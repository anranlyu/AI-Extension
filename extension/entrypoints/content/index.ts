/**
 * Content script for the LumiRead Chrome extension.
 * This script is injected into web pages and handles various text processing features
 * including text selection, read mode, highlighting, text-to-speech, and translation.
 */


import { getSelectedText } from './textSelection';
// import { injectDyslexiaFont, removeDyslexiaFontFromPage } from './dyslexiaFont';
import {
  disableReadMode,
  // displayProcessedText,
  enableReadMode,
  updateReadModeContent,
} from './readMode/readMode';
import { disableHighlight, enableHighlight, initHighlight } from './highlight';
import { enableTTSMode, stopRead } from './ttsMode/tts_content';
import { createTTSFloatingUI } from './ttsMode/tts_ui';
import { showFloatingOverlay } from './translate';
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
  async main(ctx: any) {
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

    /**
     * Listen for text selection events
     * Sends selected text to the background script for processing
     */
    document.addEventListener('mouseup', () => {
      const selectedText = getSelectedText();
      if (selectedText) {
        console.log('Selected text:', selectedText);
        chrome.runtime.sendMessage({
          type: 'selected_text',
          text: selectedText,
        });
      }
    });

    /**
     * Listen for messages from the background script
     * Handles processed text responses for various features
     */
    chrome.runtime.onMessage.addListener(
      ({ type, text, level }: { type: string; text: string; level:number }) => {
        if (type === 'simplified_text' && text) {
          showFloatingOverlay(text);
        } else if (type === 'translated_text' && text) {
          showFloatingOverlay(text);
        } else if (type === 'simplified_readMode_text') {
          console.log('content script get new readmode text');
          updateReadModeContent(text, level);
        }
      }
    );
  },
});


