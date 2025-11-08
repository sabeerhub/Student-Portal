
import { GoogleGenAI, Modality } from "@google/genai";

// FIX: Initialize GoogleGenAI directly with process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const askStudyBuddy = async (
  prompt: string, 
  history: { role: 'user' | 'model', parts: { text: string; image?: string }[] }[],
  image?: { inlineData: { data: string; mimeType: string; } } | null
): Promise<string> => {
  try {
    const userTurnParts = [];
    if (image) {
      userTurnParts.push(image);
    }
    if (prompt) {
        userTurnParts.push({ text: prompt });
    }

    // FIX: Correctly adapt history to the format expected by generateContent.
    // The previous implementation would lose text if an image was present in a history message.
    const contents = history.map(h => {
      const sdkParts: ({text: string} | {inlineData: {mimeType: string, data: string}})[] = [];
      // The parts array from StudyBuddy contains a single object with text and optional image
      const p = h.parts[0];
      if (p.text) {
          sdkParts.push({ text: p.text });
      }
      if (p.image) {
          // The mimeType is not stored in history, so we assume jpeg based on component implementation.
          sdkParts.push({ inlineData: { mimeType: 'image/jpeg', data: p.image } });
      }
      return { role: h.role, parts: sdkParts };
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...contents,
        { role: 'user', parts: userTurnParts }
      ],
      // FIX: Use systemInstruction config instead of user/model turns for system prompt.
      config: {
        systemInstruction: "You are a friendly and helpful study assistant for an information technology university student. Explain complex topics simply. Provide code examples when relevant. Your name is 'Portal Bot'."
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      // FIX: Pass the text directly to the model without the "Say: " prefix.
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    // Safely find the audio part in the response to prevent errors
    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
    const base64Audio = audioPart?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    return undefined;
  }
}