import { DeepSeekService } from '../services/deepseekService.js';

/**
 * Controller for DeepSeek API endpoints
 */
export class DeepSeekController {
  /**
   * Handle DeepSeek text processing requests
   * @route POST /api/deepseek
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async processText(req, res) {
    try {
      const { prompt, text, model = "deepseek-chat" } = req.body;
      
      if (!prompt || !text) {
        return res.status(400).json({ error: 'Both prompt and text are required' });
      }

      const content = await DeepSeekService.processText(prompt, text, model);
      res.json({ content });
    } catch (error) {
      console.error('DeepSeek controller error:', error);
      
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: error.message });
      }
      
      res.status(500).json({ 
        error: 'Failed to process with DeepSeek API', 
        details: error.message 
      });
    }
  }
} 