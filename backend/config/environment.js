import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  openaiApiKey: process.env.OPENAI_API_KEY?.trim(),
  deepseekApiKey: process.env.DEEPSEEK_API_KEY?.trim(),
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Log configuration status (without exposing full keys)
console.log("Loaded OPENAI API Key:", config.openaiApiKey?.slice(0, 5) || 'Not Found');
console.log("Loaded DEEPSEEK API Key:", config.deepseekApiKey?.slice(0, 5) || 'Not Found'); 