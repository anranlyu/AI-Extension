// Main exports for the LumiRead backend
export { config } from './config/environment.js';

// Controllers
export { ParserController } from './controllers/parserController.js';
export { DeepSeekController } from './controllers/deepseekController.js';
export { TTSController } from './controllers/ttsController.js';

// Services
export { ParserService } from './services/parserService.js';
export { DeepSeekService } from './services/deepseekService.js';
export { TTSService } from './services/ttsService.js';

// Utils
export { ErrorHandler } from './utils/errorHandler.js';

// Routes
export { default as routes } from './routes/index.js'; 