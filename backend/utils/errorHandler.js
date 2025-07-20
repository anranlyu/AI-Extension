/**
 * Centralized error handling utility
 */
export class ErrorHandler {
  /**
   * Handle and format errors for API responses
   * @param {Error} error - The error object
   * @param {Object} res - Express response object
   * @param {string} defaultMessage - Default error message
   * @param {number} statusCode - HTTP status code (defaults to 500)
   */
  static handleError(error, res, defaultMessage = 'Internal server error', statusCode = 500) {
    console.error('Error occurred:', error);
    
    // Don't send response if headers already sent
    if (res.headersSent) {
      return;
    }

    const errorResponse = {
      error: defaultMessage,
      details: error.message
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Create a standardized error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} details - Additional error details
   * @returns {Object} Formatted error object
   */
  static createError(message, statusCode = 500, details = null) {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (details) {
      error.details = details;
    }
    return error;
  }
} 