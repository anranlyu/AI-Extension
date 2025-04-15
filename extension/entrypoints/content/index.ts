/**
 * Content script for the LumiRead Chrome extension.
 * This script is injected into web pages and handles various text processing features
 * including text selection, read mode, text-to-speech, and translation.
 */

import {
  disableReadMode,
  enableReadMode,
} from './readMode/readMode';
import { enableTTSMode, stopRead } from './ttsMode/tts_content';
import { createTTSFloatingUI } from './ttsMode/tts_ui';
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
    let ttsUI: Awaited<ReturnType<typeof createTTSFloatingUI>>;
    let currentTabId: number;

    /**
     * Creates and mounts the Text-to-Speech floating UI
     */
    const createTTSUI = async () => {
      ttsUI = await createTTSFloatingUI(ctx);
      ttsUI.mount();
    };

    /**
     * Removes the Text-to-Speech floating UI
     */
    const removeTTSUI = () => {
      if (ttsUI) {
        ttsUI.remove();
      }
    };

    // Get current tab ID
    chrome.runtime.sendMessage({ type: 'get_tab_id' }, (response) => {
      if (response && response.tabId) {
        currentTabId = response.tabId;
      }
    });

    /**
     * Listen for direct messages from popup or background script
     */
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'toggle_read_mode') {
        message.enabled ? enableReadMode() : disableReadMode();
        sendResponse({ success: true });
        return true;
      }
      return false;
    });

    /**
     * Listen for changes in extension settings
     * Handles enabling/disabling of various features based on storage changes
     */
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.TTSenabled) {
        if (changes.TTSenabled.newValue) {
          createTTSUI();
          enableTTSMode();
        } else {
          removeTTSUI();
          stopRead();
        }
      }
    });

    /**
     * Initialize page state based on stored settings
     * Enables features that were previously enabled by the user
     */
    chrome.storage.local.get(['TTSenabled', 'readModeTabStates'], (result) => {
      if (result.TTSenabled) {
        createTTSUI();
        enableTTSMode();
      }
      
      // Check if ReadMode is enabled for this specific tab
      if (result.readModeTabStates && currentTabId && result.readModeTabStates[currentTabId]) {
        enableReadMode();
      }
    });
  },
});
