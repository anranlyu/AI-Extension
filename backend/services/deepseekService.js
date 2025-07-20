import axios from 'axios';
import { config } from '../config/environment.js';

/**
 * Service for DeepSeek API interactions
 */
export class DeepSeekService {
  /**
   * Process text using DeepSeek API
   * @param {string} prompt - The system prompt
   * @param {string} text - The text content to process
   * @param {string} model - The model to use (defaults to deepseek-chat)
   * @returns {Promise<string>} Processed text content
   * @throws {Error} If API request fails
   */
  static async processText(prompt, text, model = "deepseek-chat") {
    if (!prompt || !text) {
      throw new Error('Both prompt and text are required');
    }

    if (!config.deepseekApiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    try {
      console.log(`Making request to DeepSeek API with model: ${model}`);
      
      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text }
        ],
        model: model,
        temperature: 1.3,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseekApiKey}`
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API error:', error.response?.data || error.message);
      
      // Log request details for debugging (excluding the full API key)
      console.log('Request details:', {
        url: 'https://api.deepseek.com/v1/chat/completions',
        model: model,
        apiKeyProvided: !!config.deepseekApiKey,
        apiKeyLength: config.deepseekApiKey?.length
      });
      
      throw new Error(`Failed to process with DeepSeek API: ${error.response?.data || error.message}`);
    }
  }
} 