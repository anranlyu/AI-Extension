/**
 * Content script for the LumiRead Chrome extension.
 * This script is injected into web pages and handles various text processing features
 * including text selection, read mode, text-to-speech, and translation.
 */

import {
  disableReadMode,
  enableReadMode,
} from './readMode/readMode';
// import { enableTTSMode, stopRead } from './ttsMode/tts_content';
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
    let ttsUI: Awaited<ReturnType<typeof createTTSFloatingUI>> | undefined;
    let currentTabId: number;
    let isTTSActive = false;


    /**
     * Removes the Text-to-Speech floating UI
     */
    const removeTTSUI = () => {
      if (ttsUI) {
        ttsUI.remove();
        ttsUI = undefined;
      }
    };

    /**
     * Toggles TTS floating UI and functionality
     * @param enabled Whether TTS should be enabled
     */
    const toggleTTS = async (enabled: boolean, textContent:string) => {
      // If state already matches desired state, do nothing
      if ((enabled && isTTSActive) || (!enabled && !isTTSActive)) {
        return;
      }
      
      isTTSActive = enabled;
      
      if (enabled) {
        ttsUI = await createTTSFloatingUI(ctx, textContent);
        ttsUI.mount();
        // enableTTSMode();
        notifyTTSStateChange(true);
      } else {
        removeTTSUI();
        // stopRead();
        notifyTTSStateChange(false);
      }
    };

    /**
     * Notifies the ReadMode toolbar of TTS state changes
     * @param isActive Current TTS state
     */
    const notifyTTSStateChange = (isActive: boolean) => {
      chrome.runtime.sendMessage({
        type: 'tts_state_change',
        isActive
      });
    };

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
        
        // If ReadMode is disabled, also disable TTS if it's active
        if (!message.enabled && isTTSActive) {
          toggleTTS(false, message.textContent);
        }
        
        sendResponse({ success: true });
        return true;
      }
      
      // Handle TTS toggle
      if (message.type === 'toggle_tts_in_read_mode') {
        toggleTTS(message.enabled,message.textContent);
        sendResponse({ success: true });
        return true;
      }
      
      // Handle ReadMode state updates
      if (message.type === 'update_read_mode_state' && !message.enabled) {
        // If ReadMode is being disabled and TTS is active, disable TTS as well
        if (isTTSActive) {
          toggleTTS(false, message.textContent);
        }
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
