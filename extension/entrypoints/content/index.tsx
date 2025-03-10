/* eslint-disable @typescript-eslint/no-unused-expressions */
import { getSelectedText } from './textSelection';
import { injectDyslexiaFont, removeDyslexiaFontFromPage } from './dyslexiaFont';
import {
  disableReadMode,
  // displayProcessedText,
  enableReadMode,
  updateReadModeContent,
} from './readMode/readMode';
import { disableHighlight, enableHighlight, initHighlight } from './highlight';
import { enableTTSMode, stopRead } from './tts_content';
import { showFloatingOverlay } from './translate';
import './content.css';

export default defineContentScript({
  matches: ['https://www.cbc.ca/news/world/israel-gaza-electricity-1.7478863'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    initHighlight();

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.readModeEnabled) {
        changes.readModeEnabled.newValue ? enableReadMode() : disableReadMode();
      } else if (changes.dyslexiaFontEnabled) {
        changes.dyslexiaFontEnabled.newValue
          ? injectDyslexiaFont()
          : removeDyslexiaFontFromPage();
      } else if (changes.highlightEnabled) {
        changes.highlightEnabled.newValue
          ? enableHighlight(ctx)
          : disableHighlight();
      } else if (changes.TTSenabled) {
        changes.TTSenabled.newValue ? enableTTSMode() : stopRead();
      }
    });

    // Initialize the page state.
    chrome.storage.local.get(
      [
        'readModeEnabled',
        'dyslexiaFontEnabled',
        'highlightEnabled',
        'TTSenabled',
      ],

      (result) => {
        if (result.readModeEnabled) enableReadMode();
        if (result.dyslexiaFontEnabled) injectDyslexiaFont();
        if (result.highlightEnabled) {
          enableHighlight(ctx);
        } else {
          disableHighlight();
        }
        if (result.TTSenabled) {
          console.log('TTS Mode Initial State: Enabled');
          enableTTSMode();
        } else {
          console.log('TTS Mode Initial State: Disabled');
          stopRead();
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
