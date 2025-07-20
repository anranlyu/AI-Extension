# LumiRead Backend - 3-Layer Architecture

This backend has been refactored to follow a clean 3-layer architecture pattern for better maintainability, testability, and separation of concerns.

## Architecture Overview

```
┌─────────────────┐
│   Controllers   │  ← Handle HTTP requests/responses
├─────────────────┤
│    Services     │  ← Business logic and data processing
├─────────────────┤
│  External APIs  │  ← Third-party API integrations
└─────────────────┘
```

## Directory Structure

```
backend/
├── config/
│   └── environment.js      # Environment configuration
├── controllers/
│   ├── parserController.js # URL parsing endpoints
│   ├── deepseekController.js # DeepSeek API endpoints
│   └── ttsController.js    # Text-to-Speech endpoints
├── services/
│   ├── parserService.js    # URL parsing business logic
│   ├── deepseekService.js  # DeepSeek API integration
│   └── ttsService.js       # TTS business logic
├── routes/
│   └── index.js           # Centralized route definitions
├── utils/
│   └── errorHandler.js    # Error handling utilities
└── server.js              # Main application entry point
```

## Layer Responsibilities

### 1. Controllers Layer

- Handle HTTP requests and responses
- Input validation and sanitization
- Response formatting
- Error handling for HTTP context

### 2. Services Layer

- Business logic implementation
- Data processing and transformation
- Integration with external APIs
- Error handling for business logic

### 3. External APIs Layer

- Direct integration with third-party services
- API authentication and configuration
- Request/response handling for external services

## API Endpoints

### URL Parser

- **GET** `/parse?url=<URL>` - Parse content from a URL

### DeepSeek API

- **POST** `/api/deepseek` - Process text with DeepSeek AI
  ```json
  {
    "prompt": "System prompt",
    "text": "Text to process",
    "model": "deepseek-chat" // optional
  }
  ```

### Text-to-Speech

- **POST** `/api/tts` - Convert text to speech
  ```json
  {
    "text": "Text to convert", // or "input"
    "voice": "alloy" // optional
  }
  ```

### Health Check

- **GET** `/health` - Server health status

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5001
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
NODE_ENV=development
```

## Running the Server

```bash
cd backend
npm install
npm start
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Maintainability**: Easier to modify and extend functionality
3. **Testability**: Each layer can be tested independently
4. **Reusability**: Services can be reused across different controllers
5. **Error Handling**: Centralized and consistent error management
6. **Configuration**: Centralized environment and configuration management

## Adding New Features

1. **New API endpoint**: Add controller → service → update routes
2. **New external integration**: Create service → add to controller
3. **New business logic**: Add to appropriate service layer

## Error Handling

The application uses centralized error handling:

- Controllers handle HTTP-specific errors
- Services handle business logic errors
- Global error handler catches unhandled errors
- Development mode provides detailed error information
