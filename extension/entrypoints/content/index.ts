/* eslint-disable @typescript-eslint/no-unused-expressions */
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


export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  cssInjectionMode: 'ui',

  async main(ctx) {
    initHighlight();
    let ttsUI: Awaited<ReturnType<typeof createTTSFloatingUI>>;

    const createTTSUI = async () => {
      ttsUI = await createTTSFloatingUI(ctx);
      ttsUI.mount();
    };

    const removeTTSUI = () => {
      if (ttsUI) {
        ttsUI.remove();
      }
    };

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

    // Initialize the page state.
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

    chrome.runtime.onMessage.addListener(
      ({ type, text }: { type: string; text: string }) => {
        if (type === 'simplified_text' && text) {
          showFloatingOverlay(text);
        } else if (type === 'translated_text' && text) {
          showFloatingOverlay(text);
        } else if (type === 'simplified_readMode_text') {
          console.log('content script get new readmode text');
          updateReadModeContent(text);
        }
      }
    );
  },
});
