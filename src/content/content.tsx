/* eslint-disable @typescript-eslint/no-unused-expressions */
import { getSelectedText, replaceSelectedText } from './textSelection';
import { injectDyslexiaFont, removeDyslexiaFontFromPage } from './dyslexiaFont';
import { showTranslatedOverlay } from './translate';
import {
  disableReadMode,
  // displayProcessedText,
  enableReadMode,
} from './readMode';
import { disableHighlight, enableHighlight } from './highlight';

console.log('content has been injected from content.tsx');

chrome.storage.onChanged.addListener((changes) => {
  if (changes.readModeEnabled){
    changes.readModeEnabled.newValue ? enableReadMode() : disableReadMode();
  } else if (changes.dyslexiaFontEnabled) {
    changes.dyslexiaFontEnabled.newValue
    ? injectDyslexiaFont()
    : removeDyslexiaFontFromPage();

  } else if (changes.highlightEnabled){
    changes.highlightEnabled.newValue 
    ? enableHighlight() 
    : disableHighlight();
  } else if (changes.translateEnabled){
    changes.translateEnabled.newValue
    ? "ON"
    : "OFF"
    }

});

chrome.storage.local.get(
  ['readModeEnabled', 'dyslexiaFontEnabled', 'highlightEnabled', "translateEnabled", "targetLanguage"],
  (result) => {
    if (result.readModeEnabled) enableReadMode();
    if (result.dyslexiaFontEnabled) injectDyslexiaFont();
    if (result.highlightEnabled) {
      enableHighlight();
    } else {
      disableHighlight();
    }
  }
);

document.addEventListener('mouseup', () => {
  const selectedText = getSelectedText();
  if (selectedText) {
    console.log('Selected text:', selectedText);
    chrome.runtime.sendMessage({ type: 'selected_text', text: selectedText });
  } else {
    console.warn('No text selected!');
  }
});

chrome.runtime.onMessage.addListener(
  ({ type, text }: { type: string; text: string }) => {
    if (type === 'simplified_text' && text) {
      replaceSelectedText(text);
    } else if (type === "translated_text" && text) {
      showTranslatedOverlay(text);
    }
  }
);