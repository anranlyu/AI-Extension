/**
 * Content script for the LumiRead Chrome extension.
 * This script is injected into web pages and handles various text processing features
 * including text selection, read mode, highlighting, text-to-speech, and translation.
 */



import {
  disableReadMode,
  enableReadMode,
} from './readMode/readMode';
import { disableHighlight, enableHighlight, initHighlight } from './highlight';
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
    // Initialize text highlighting feature
    initHighlight();
    let ttsUI: Awaited<ReturnType<typeof createTTSFloatingUI>>;

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

    /**
     * Listen for changes in extension settings
     * Handles enabling/disabling of various features based on storage changes
     */
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.readModeEnabled) {
        changes.readModeEnabled.newValue ? enableReadMode() : disableReadMode();
      } else if (changes.highlightEnabled) {
        changes.highlightEnabled.newValue
          ? enableHighlight(ctx)
          : disableHighlight();
      } else if (changes.TTSenabled) {
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
    chrome.storage.local.get(
      ['readModeEnabled', 'highlightEnabled', 'TTSenabled'],
      (result) => {
        if (result.readModeEnabled) enableReadMode();
        if (result.highlightEnabled) {
          enableHighlight(ctx);
        } else {
          disableHighlight();
        }
        if (result.TTSenabled) {
          createTTSUI();
          enableTTSMode();
        }
      }
    );

  },
});
