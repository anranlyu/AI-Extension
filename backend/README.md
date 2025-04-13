# Backend Server for LumiRead Extension

This server provides the backend services for the LumiRead browser extension, including:

1. URL parsing with @postlight/parser
2. Secure API proxy for DeepSeek LLM API requests

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Create a `.env` file in the backend directory with your DeepSeek API key:

   ```
   DEEPSEEK_API_KEY=your_api_key_here
   ```

3. Start the server:
   ```
   npm start
   ```

The server will run on port 5001 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### URL Parsing

- `GET /parse?url=<url>`
  - Parses an article URL and returns its content and metadata

### DeepSeek API Proxy

- `POST /api/deepseek`
  - Body:
    ```json
    {
      "prompt": "string",
      "text": "string",
      "model": "string" (optional, defaults to "deepseek-chat")
    }
    ```
  - Returns: `{ "content": "processed text response" }`
  - Supported models:
    - `deepseek-chat` - DeepSeek V3 (default)
    - `deepseek-reasoner` - DeepSeek R1 reasoning model

## Security

This server securely handles the DeepSeek API key, keeping it out of the client-side extension code. All API calls to DeepSeek are proxied through this server.
