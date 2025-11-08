import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

// --- Transcript Types ---
interface Transcript {
    id: string;
    role: 'user' | 'model';
    text: string;
}

// --- Component ---
const LiveConversation: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'error'>('idle');
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioResourcesRef = useRef<{
        stream: MediaStream | null;
        inputAudioContext: AudioContext | null;
        outputAudioContext: AudioContext | null;
        scriptProcessor: ScriptProcessorNode | null;
        sourceNode: MediaStreamAudioSourceNode | null;
        nextStartTime: number;
        sources: Set<AudioBufferSourceNode>;
    }>({ stream: null, inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, sourceNode: null, nextStartTime: 0, sources: new Set() });

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const addTranscript = useCallback((role: 'user' | 'model', text: string) => {
        setTranscripts(prev => [...prev, { id: self.crypto.randomUUID(), role, text }]);
    }, []);

    const stopConversation = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        
        const audio = audioResourcesRef.current;
        audio.stream?.getTracks().forEach(track => track.stop());
        audio.scriptProcessor?.disconnect();
        audio.sourceNode?.disconnect();
        audio.inputAudioContext?.close();
        audio.outputAudioContext?.close();

        audioResourcesRef.current = { stream: null, inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, sourceNode: null, nextStartTime: 0, sources: new Set() };
        setStatus('idle');
    }, []);

    const startConversation = async () => {
        setStatus('connecting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audio = audioResourcesRef.current;
            audio.stream = stream;
            audio.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audio.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audio.nextStartTime = 0;

            // FIX: As per guidelines, assume API_KEY is set and do not use non-null assertion.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        const source = audio.inputAudioContext!.createMediaStreamSource(stream);
                        const scriptProcessor = audio.inputAudioContext!.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audio.inputAudioContext!.destination);
                        audio.sourceNode = source;
                        audio.scriptProcessor = scriptProcessor;
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Transcriptions
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        } else if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            if (currentInputTranscriptionRef.current) addTranscript('user', currentInputTranscriptionRef.current.trim());
                            if (currentOutputTranscriptionRef.current) addTranscript('model', currentOutputTranscriptionRef.current.trim());
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }
                        // Handle Audio
                        const modelTurnParts = message.serverContent?.modelTurn?.parts;
                        if (modelTurnParts && audio.outputAudioContext) {
                            const audioPart = modelTurnParts.find(p => p.inlineData?.data);
                            const audioData = audioPart?.inlineData?.data;
                            if (audioData) {
                                const ctx = audio.outputAudioContext;
                                audio.nextStartTime = Math.max(audio.nextStartTime, ctx.currentTime);
                                const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(ctx.destination);
                                source.addEventListener('ended', () => audio.sources.delete(source));
                                source.start(audio.nextStartTime);
                                audio.nextStartTime += audioBuffer.duration;
                                audio.sources.add(source);
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatus('error');
                        addTranscript('model', 'Sorry, a connection error occurred.');
                        stopConversation();
                    },
                    onclose: () => {
                        // This may be called on graceful shutdown too.
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    systemInstruction: 'You are a friendly and helpful study assistant for an information technology university student. Keep your responses concise and conversational.',
                },
            });
        } catch (err) {
            console.error('Failed to start conversation:', err);
            setStatus('error');
            addTranscript('model', 'Could not access the microphone. Please check your permissions.');
        }
    };
    
    // Cleanup on unmount
    useEffect(() => {
        return () => stopConversation();
    }, [stopConversation]);

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcripts]);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-600">
                    <h2 className="text-xl font-bold text-primary">Live AI Tutor</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-card-light hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </header>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {transcripts.map(t => (
                        <div key={t.id} className={`flex items-start gap-3 ${t.role === 'user' ? 'justify-end' : ''}`}>
                            <div className={`max-w-md px-4 py-2 rounded-2xl ${t.role === 'model' ? 'bg-card-light' : 'bg-secondary text-white'}`}>
                                <p className="text-sm">{t.text}</p>
                            </div>
                        </div>
                    ))}
                     <div ref={transcriptEndRef} />
                </div>
                <footer className="p-4 border-t border-gray-600 flex flex-col items-center justify-center">
                    {status === 'idle' && <button onClick={startConversation} className="px-8 py-4 bg-accent text-white rounded-full font-bold text-lg">Start Conversation</button>}
                    {status === 'connecting' && <p className="text-text-secondary">Connecting...</p>}
                    {status === 'listening' && <button onClick={stopConversation} className="px-8 py-4 bg-red-600 text-white rounded-full font-bold text-lg">Stop Conversation</button>}
                    {status === 'error' && <p className="text-red-400">An error occurred. Please try again.</p>}
                </footer>
            </div>
        </div>
    );
};

export default LiveConversation;