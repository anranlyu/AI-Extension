import OpenAI from 'openai';
import { config } from '../config/environment.js';

/**
 * Service for Text-to-Speech functionality
 */
export class TTSService {
  /**
   * Generate speech from text using OpenAI TTS
   * @param {string} text - The text to convert to speech
   * @param {string} voice - The voice model to use (defaults to 'alloy')
   * @returns {Promise<Stream>} Audio stream in mp3 format
   * @throws {Error} If TTS generation fails
   */
  static async generateSpeech(text, voice = 'alloy') {
    if (!text) {
      throw new Error('Input text is required');
    }

    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key not found. Check environment variables.');
    }

    // Trim to the max OpenAI TTS chars
    const maxChars = 1000;
    const limitedText = text.slice(0, maxChars);
    
    if (text.length > maxChars) {
      console.log(`Text truncated from ${text.length} to ${maxChars} characters`);
    }

    const openai = new OpenAI({ apiKey: config.openaiApiKey });

    try {
      console.log(`Generating TTS for text: "${limitedText}" with voice: ${voice}`);

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice,
        input: limitedText,
        response_format: "mp3",
      });

      return mp3;
    } catch (error) {
      console.error('OpenAI TTS API error:', error);
      throw new Error(`Failed to generate speech: ${error.response?.data || error.message}`);
    }
  }
} 