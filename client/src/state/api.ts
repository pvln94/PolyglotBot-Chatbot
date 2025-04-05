// src/state/api.ts
import { secureApiCall } from '../services/apiService';

// Fetch simple AI-generated text (e.g., for single prompts)
export async function getAIText(input: string, language: string): Promise<string> {
  try {
    const response = await secureApiCall(
      `${import.meta.env.VITE_BACKEND_URL}/ai-text`,
      'POST',
      { input, language }
    );
    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Error fetching AI text:', error);
    return '';
  }
}

// Translate text between languages
export async function translatedText(input: string, fromLang: string, toLang: string): Promise<string> {
  try {
    const response = await secureApiCall(
      `${import.meta.env.VITE_BACKEND_URL}/translate`,
      'POST',
      { text: input, fromLang, toLang }
    );
    const data = await response.json();
    return data.translatedText || '';
  } catch (error) {
    console.error('Error translating text:', error);
    return '';
  }
}

// Convert text to speech and set audio URL
export async function handleTextToSpeech(text: string, setAudioUrl: (url: string) => void): Promise<void> {
  try {
    const response = await secureApiCall(
      `${import.meta.env.VITE_BACKEND_URL}/text-to-speech`,
      'POST',
      { text }
    );
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setTimeout(() => URL.revokeObjectURL(url), 10000); // Cleanup after 10s
  } catch (error) {
    console.error('Error converting text to speech:', error);
  }
}

// Chat completion for conversational AI responses (context-aware)
export async function chatCompletion(messages: { content: string; role: string }[], language: string): Promise<string> {
  try {
    const response = await secureApiCall(
      `${import.meta.env.VITE_BACKEND_URL}/chat-completion`,
      'POST',
      { messages, language }
    );
    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Error in chat completion:', error);
    return '';
  }
}

// Convert speech to text from audio input
export async function handleSpeechToText(formData: FormData): Promise<string> {
  try {
    const response = await secureApiCall(
      `${import.meta.env.VITE_BACKEND_URL}/speech-to-text`,
      'POST',
      formData
    );
    const data = await response.json();
    return data.transcript || '';
  } catch (error) {
    console.error('Error converting speech to text:', error);
    return '';
  }
}