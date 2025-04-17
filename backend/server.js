/**
 * Backend server for the LumiRead extension.
 * Provides URL parsing functionality using @postlight/parser to extract article content.
 */

const express = require('express');
const Parser = require('@postlight/parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Debug logging for environment variables
console.log('Environment variables loaded:');
console.log('DEEPSEEK_API_KEY exists:', !!process.env.DEEPSEEK_API_KEY);
console.log('DEEPSEEK_API_KEY length:', process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.length : 0);
console.log('NODE_ENV:', process.env.NODE_ENV);

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

  // Debug logging for API key
  console.log('DeepSeek API request received:');
  console.log('API Key exists:', !!process.env.DEEPSEEK_API_KEY);
  console.log('API Key length:', process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.length : 0);
  console.log('Request details:', { prompt, text, model });

  // Ensure API key is trimmed of any whitespace
  const apiKey = process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.trim() : '';
  
  if (!apiKey) {
    console.error('API Key is missing or empty');
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
      temperature: 0.7,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    console.log('DeepSeek API response:', {
      status: response.status,
      statusText: response.statusText,
      hasContent: !!response.data?.choices?.[0]?.message?.content
    });

    res.json({ 
      content: response.data.choices[0].message.content 
    });
  } catch (error) {
    console.error('DeepSeek API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    // Log request details for debugging (excluding the full API key)
    console.log('Request details:', {
      url: 'https://api.deepseek.com/v1/chat/completions',
      model: model,
      apiKeyProvided: !!apiKey,
      apiKeyLength: apiKey.length,
      error: error.message
    });
    
    res.status(500).json({ 
      error: 'Failed to process with DeepSeek API', 
      details: error.response?.data || error.message 
    });
  }
});

/**
 * Test endpoint to verify API key is loaded correctly
 * Only shows first/last few characters for security
 * 
 * @route GET /api/test-config
 */
app.get('/api/test-config', (req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY || '';
  const maskedKey = apiKey ? 
    `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : 
    'not found';
  
  res.json({
    apiKeyStatus: apiKey ? 'loaded' : 'missing',
    apiKeyMasked: maskedKey,
    apiKeyLength: apiKey.length,
    nodeEnv: process.env.NODE_ENV || 'not set'
  });
});

/**
 * Starts the Express server
 * Listens on the specified PORT (defaults to 5000 if not set in environment)
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});