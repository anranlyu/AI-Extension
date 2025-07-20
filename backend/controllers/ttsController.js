import { TTSService } from '../services/ttsService.js';
import { config } from '../config/environment.js';

/**
 * Controller for Text-to-Speech endpoints
 */
export class TTSController {
  /**
   * Handle Text-to-Speech requests
   * @route POST /api/tts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async generateSpeech(req, res) {
    try {
      // Log the raw body for debugging
      console.log('POST /api/tts received:', req.body);
      
      const { text, input, voice = 'alloy' } = req.body;
      const ttsInput = text || input;

      if (!ttsInput) {
        console.log('No input text provided');
        return res.status(400).json({ error: 'Input text is required' });
      }

      const mp3Stream = await TTSService.generateSpeech(ttsInput, voice);

      // Set CORS & content-type headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'audio/mpeg');

      // Pipe the audio stream back
      mp3Stream.body.pipe(res);
      mp3Stream.body.on('error', err => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error streaming audio', details: err.message });
        }
      });
    } catch (error) {
      console.error('TTS controller error:', error);
      res.status(500).json({
        error: 'Failed to generate speech',
        details: error.message,
        errorType: error.name,
        stack: config.nodeEnv === 'development' ? error.stack : undefined
      });
    }
  }
} 