import { Message } from '../service/type';
import { enableReadMode, disableReadMode } from './readMode';
import { injectDyslexiaFont, removeDyslexiaFontFromPage } from './dyslexiaFont';
import { injectHighlightStyles } from './highlightStyles';
import { getSelectedText, replaceSelectedText } from './textSelection';

console.log('content has been injected');

injectHighlightStyles();

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === 'update_read_mode') {
    if (message.readModeEnabled) {
      enableReadMode();
    } else {
      disableReadMode();
    }
  }

  if (message.type === 'simplified_text') {
    console.log('Received processed text:', message.text);
    replaceSelectedText(message.text);
  }

  if (message.type === 'update_dyslexia_font') {
    if (message.dyslexiaFontEnabled) {
      injectDyslexiaFont();
    } else {
      removeDyslexiaFontFromPage();
    }
  }
});

chrome.runtime.sendMessage(
  { type: 'get_dyslexia_font_enabled' },
  (response) => {
    if (response && response.dyslexiaFontEnabled) {
      injectDyslexiaFont();
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
