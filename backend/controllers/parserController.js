import { ParserService } from '../services/parserService.js';

/**
 * Controller for URL parsing endpoints
 */
export class ParserController {
  /**
   * Handle URL parsing requests
   * @route GET /parse
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async parseUrl(req, res) {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const result = await ParserService.parseUrl(url);
      res.json(result);
    } catch (error) {
      console.error('Parser controller error:', error);
      res.status(500).json({ 
        error: 'Failed to parse URL', 
        details: error.message 
      });
    }
  }
} 