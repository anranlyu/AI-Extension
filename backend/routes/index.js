import express from 'express';
import { ParserController } from '../controllers/parserController.js';
import { DeepSeekController } from '../controllers/deepseekController.js';
import { TTSController } from '../controllers/ttsController.js';

const router = express.Router();

/**
 * URL Parser Routes
 */
router.get('/parse', ParserController.parseUrl);

/**
 * DeepSeek API Routes
 */
router.post('/api/deepseek', DeepSeekController.processText);

/**
 * Text-to-Speech Routes
 */
router.post('/api/tts', TTSController.generateSpeech);

export default router; 