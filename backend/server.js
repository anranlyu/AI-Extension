/**
 * Backend server for the LumiRead extension.
 * Refactored with 3-layer architecture: Controllers, Services, and Data Access layers.
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
import routes from './routes/index.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: config.nodeEnv === 'development' ? error.message : 'Something went wrong'
  });
});

/**
 * Start the Express server
 */
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health check available at: http://localhost:${config.port}/health`);
});