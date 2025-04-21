/**
 * Backend server for the LumiRead extension.
 * Provides URL parsing functionality using @postlight/parser to extract article content.
 */

import express from 'express';
import Parser from '@postlight/parser';
import cors from 'cors';
import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable JSON parsing for incoming requests
app.use(express.json());
app.use(cors());

/**
 * Endpoint to parse content from a given URL
 * Uses @postlight/parser to extract article content, metadata, and other relevant information
 * 
 * @route GET /parse
 * @param {string} url - The URL of the article to parse
 * @returns {Object} Parsed article data including title, content, author, and other metadata
 * @throws {Error} 400 if URL parameter is missing
 * @throws {Error} 500 if parsing fails
 * 
 * @example
 * GET /parse?url=https://example.com/article
 */
app.get('/parse', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const result = await Parser.parse(url);
    res.json(result);
  } catch (error) {
    console.error('Parsing error:', error);
    res.status(500).json({ error: 'Failed to parse URL', details: error.message });
  }
});

/**
 * Endpoint to handle DeepSeek API requests
 * 
 * @route POST /api/deepseek
 * @param {string} prompt - The prompt for DeepSeek
 * @param {string} text - The text content to process
 * @param {string} model - Optional model to use (defaults to deepseek-chat)
 * @returns {Object} Processed text from the DeepSeek API
 * @throws {Error} 400 if required parameters are missing
 * @throws {Error} 500 if API request fails
 */
app.post('/api/deepseek', async (req, res) => {
  const { prompt, text, model = "deepseek-chat" } = req.body;
  
  if (!prompt || !text) {
    return res.status(400).json({ error: 'Both prompt and text are required' });
  }

  // Ensure API key is trimmed of any whitespace
  const apiKey = process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.trim() : '';
  
  if (!apiKey) {
    return res.status(500).json({ error: 'DeepSeek API key is not configured' });
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
        'Authorization': `Bearer ${apiKey}`
      }
    });

    res.json({ 
      content: response.data.choices[0].message.content 
    });
  } catch (error) {
    console.error('DeepSeek API error:', error.response?.data || error.message);
    
    // Log request details for debugging (excluding the full API key)
    console.log('Request details:', {
      url: 'https://api.deepseek.com/v1/chat/completions',
      model: model,
      apiKeyProvided: !!apiKey,
      apiKeyLength: apiKey.length
    });
    
    res.status(500).json({ 
      error: 'Failed to process with DeepSeek API', 
      details: error.response?.data || error.message 
    });
  }
});

/**
 * Endpoint to handle OpenAI Text-to-Speech requests
 *
 * @route POST /api/tts
 * @param {string} text - The text to convert to speech
 * @param {string} voice - Optional voice model (defaults to 'alloy')
 * @returns {Stream} Audio stream in mp3 format
 * @throws {Error} 400 if text is missing
 * @throws {Error} 500 if API key is missing or TTS generation fails
 */
app.post('/api/tts', async (req, res) => {
  const { text, voice = 'alloy' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  // Initialize OpenAI client
  const openaiApiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
  if (!openaiApiKey) {
    return res.status(500).json({ error: 'OpenAI API key not found. Check environment variables.' });
  }
  
  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    console.log(`Generating TTS for text: "${text.substring(0, 50)}..." with voice: ${voice}`);

    const maxChars = 4000; // OpenAI TTS character limit
    const limitedText = text.slice(0, maxChars);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: limitedText,
      response_format: "mp3",
    });

    // Set headers for streaming audio
    res.setHeader('Content-Type', 'audio/mpeg');
    // Pipe the stream from OpenAI directly to the response
    mp3.body.pipe(res);

  } catch (error) {
    console.error('OpenAI TTS API error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate speech',
      details: error.response?.data || error.message
    });
  }
});


/**
 * Starts the Express server
 * Listens on the specified PORT (defaults to 5001 if not set in environment)
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});