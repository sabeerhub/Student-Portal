import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { askStudyBuddy, generateSpeech } from '../../services/geminiService';

// --- Helper Functions for Audio Processing ---
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
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


// --- Icons ---
const BotIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" /></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>);
const AttachmentIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>);
const SpeakerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);


const StudyBuddy: React.FC = () => {
  const CHAT_HISTORY_KEY = 'studyBuddyHistory';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<{ preview: string; data: string; mimeType: string; } | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) return parsedHistory;
      }
    } catch (error) {
      console.error("Failed to parse chat history from localStorage", error);
    }
    return [{ role: 'model', text: 'Hi! I am Portal Bot. How can I help with your IT studies? You can also upload an image.' }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setUploadedImage({
          preview: URL.createObjectURL(file),
          data: base64String,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePlayAudio = async (text: string, messageId: string) => {
    if (playingAudioId) return;
    setPlayingAudioId(messageId);
    try {
        const base64Audio = await generateSpeech(text);
        if (base64Audio) {
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start();
            source.onended = () => setPlayingAudioId(null);
        } else {
            setPlayingAudioId(null);
        }
    } catch (e) {
        console.error("Failed to play audio", e);
        setPlayingAudioId(null);
    }
  }


  const handleSend = async () => {
    const trimmedInput = input.trim();
    if ((!trimmedInput && !uploadedImage) || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: trimmedInput, image: uploadedImage?.data };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedImage(null);
    setIsLoading(true);

    const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text, image: msg.image }]
    }));

    try {
      const imagePayload = uploadedImage ? { inlineData: { data: uploadedImage.data, mimeType: uploadedImage.mimeType } } : null;
      const responseText = await askStudyBuddy(trimmedInput, history, imagePayload);
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, something went wrong. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg flex flex-col h-[550px]">
      <h3 className="text-xl font-bold text-text-primary text-center p-4 border-b border-gray-600">Study Buddy</h3>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <BotIcon />}
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl flex flex-col gap-2 ${msg.role === 'model' ? 'bg-card-light text-text-secondary' : 'bg-primary text-white'}`}>
              {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} alt="User upload" className="rounded-lg max-h-40" />}
              {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
              {msg.role === 'model' && msg.text && (
                  <button onClick={() => handlePlayAudio(msg.text, `msg-${index}`)} disabled={!!playingAudioId} className="self-start mt-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed">
                     {playingAudioId === `msg-${index}` ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div> : <SpeakerIcon />}
                  </button>
              )}
            </div>
            {msg.role === 'user' && <UserIcon />}
          </div>
        ))}
        {isLoading && (<div className="flex items-start gap-3"><BotIcon /><div className="px-4 py-3 rounded-2xl bg-card-light flex items-center space-x-2"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div></div></div>)}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-600">
        {uploadedImage && (
            <div className="relative mb-2 w-24 h-24">
                <img src={uploadedImage.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                <button onClick={() => setUploadedImage(null)} className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full p-0.5"><CloseIcon/></button>
            </div>
        )}
        <div className="flex items-center">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="mr-3 p-2 text-gray-400 hover:text-white"><AttachmentIcon /></button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask about anything..." className="flex-1 bg-card-light border border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" disabled={isLoading} />
            <button onClick={handleSend} disabled={isLoading || (!input.trim() && !uploadedImage)} className="ml-3 p-2 bg-primary text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;