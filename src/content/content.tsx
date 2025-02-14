/* eslint-disable @typescript-eslint/no-unused-expressions */
import './content.css';
import { getSelectedText, replaceSelectedText } from './textSelection';
import { injectDyslexiaFont, removeDyslexiaFontFromPage } from './dyslexiaFont';
import { injectHighlightStyles } from './highlightStyles';
import {
  disableReadMode,
  // displayProcessedText,
  enableReadMode,
} from './readMode';
import { enableHighlight } from './highlight';

console.log('content has been injected');

injectHighlightStyles();

chrome.storage.onChanged.addListener((changes) => {
  if (changes.readModeEnabled) {
    if (changes.readModeEnabled.newValue) enableReadMode();
    else disableReadMode();
  } else if (changes.dyslexiaFontEnabled) {
    if (changes.dyslexiaFontEnabled.newValue) injectDyslexiaFont();
    else removeDyslexiaFontFromPage();
  } else if (changes.highlightEnabled) {
    if (changes.highlightEnabled.newValue) enableHighlight();
  }
});

chrome.storage.local.get(
  ['readModeEnabled', 'dyslexiaFontEnabled'],
  (result) => {
    if (result.readModeEnabled) enableReadMode();
    if (result.dyslexiaFontEnabled) injectDyslexiaFont();
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
    }
  }
);
