import Parser from '@postlight/parser';

/**
 * Service for parsing URL content
 */
export class ParserService {
  /**
   * Parse content from a given URL
   * @param {string} url - The URL to parse
   * @returns {Promise<Object>} Parsed article data
   * @throws {Error} If parsing fails
   */
  static async parseUrl(url) {
    if (!url) {
      throw new Error('URL is required');
    }

    try {
      const result = await Parser.parse(url);
      console.log('Successfully parsed URL:', url);
      return result;
    } catch (error) {
      console.error('Parsing error for URL:', url, error);
      throw new Error(`Failed to parse URL: ${error.message}`);
    }
  }
} 