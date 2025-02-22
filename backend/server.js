const express = require('express');
const Parser = require('@postlight/parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable JSON parsing for incoming requests
app.use(express.json());
app.use(cors());

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});