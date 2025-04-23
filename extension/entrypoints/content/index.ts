/**
 * Content script for the LumiRead Chrome extension.
 * This script is injected into web pages and handles various text processing features
 * including text selection, read mode, text-to-speech, and translation.
 */

import {
  disableReadMode,
  enableReadMode,
} from './readMode/readMode';
import './content.css';

/**
 * Main content script configuration and initialization.
 * This script runs on all HTTP and HTTPS pages and provides various text processing features.
 */
export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  cssInjectionMode: 'ui',

  /**
   * Main entry point for the content script.
   * Initializes all features and sets up event listeners.
   * @param ctx - The content script context provided by WXT
   */
  async main(ctx) {

    let currentTabId: number;


    // Get current tab ID
    chrome.runtime.sendMessage({ type: 'get_tab_id' }, (response) => {
      if (response && response.tabId) {
        currentTabId = response.tabId;
      }
    });

    /**
     * Listen for messages from popup or background script
     */
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Handle ReadMode toggle
      if (message.type === 'toggle_read_mode') {
        message.enabled ? enableReadMode() : disableReadMode();
        
        
        sendResponse({ success: true });
        return true;
      }
      
      
      return false;
    });

    /**
     * Initialize ReadMode state for this tab
     */
    chrome.storage.local.get(['readModeTabStates'], (result) => {
      if (result.readModeTabStates && currentTabId && result.readModeTabStates[currentTabId]) {
        enableReadMode();
      }
    });
  },
});
