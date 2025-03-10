/* eslint-disable @typescript-eslint/no-unused-expressions */
// import './content.css';
import { getSelectedText, replaceSelectedText } from './textSelection';
import { injectDyslexiaFont, removeDyslexiaFontFromPage } from './dyslexiaFont';
import {
  disableReadMode,
  enableReadMode,
} from './readMode';
import { disableHighlight, enableHighlight } from './highlight';
import { enableTTSMode, stopRead } from './tts_content';


console.log('Content script has been injected');

chrome.storage.local.get(
  ['readModeEnabled', 'dyslexiaFontEnabled', 'highlightEnabled', 'TTSenabled'],
  (result) => {
    setTimeout(() => {
      if (result.readModeEnabled) enableReadMode();
      if (result.dyslexiaFontEnabled) injectDyslexiaFont();
      if (result.highlightEnabled) {
        enableHighlight();
      } else {
        disableHighlight();
      }
      if (result.TTSenabled) {
        console.log("TTS Mode Initial State: Enabled");
        enableTTSMode();
      } else {
        console.log("TTS Mode Initial State: Disabled");
        stopRead();
      }
    }, 500);
  }
);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.readModeEnabled) {
    changes.readModeEnabled.newValue ? enableReadMode() : disableReadMode();
  } else if (changes.dyslexiaFontEnabled) {
    changes.dyslexiaFontEnabled.newValue
      ? injectDyslexiaFont()
      : removeDyslexiaFontFromPage();
  } else if (changes.highlightEnabled) {
    changes.highlightEnabled.newValue ? enableHighlight() : disableHighlight();
  } else if (changes.TTSenabled) {
    changes.TTSenabled.newValue ? enableTTSMode() : stopRead();
  }
});

document.addEventListener('mouseup', () => {
  const selectedText = getSelectedText();
  if (selectedText) {
    console.log('Selected text:', selectedText);
    chrome.runtime.sendMessage({ type: 'selected_text', text: selectedText }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending selected text message:", chrome.runtime.lastError.message);
      }
      if (!response) {
        console.warn("No response received for selected text processing.");
      }
    });
  } else {
    console.warn('No text selected!');
  }
});

chrome.runtime.onMessage.addListener(({ type, text }: { type: string; text: string }) => {
  if (type === 'simplified_text' && text) {
    replaceSelectedText(text);
  } else if (type === 'translated_text' && text) {
    // showTranslatedOverlay(text);
  } else if (type === 'tts_request_error') {
    console.error("TTS request error received:", text);
  }
});
