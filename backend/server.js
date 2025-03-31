/**
 * Backend server for the LumiRead extension.
 * Provides URL parsing functionality using @postlight/parser to extract article content.
 */

const express = require('express');
const Parser = require('@postlight/parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

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
 * Starts the Express server
 * Listens on the specified PORT (defaults to 5000 if not set in environment)
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});