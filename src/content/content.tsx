/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Message } from '../service/type';
import {
  enableReadMode,
  disableReadMode,
  displayProcessedText,
} from './readMode';
import { injectDyslexiaFont, removeDyslexiaFontFromPage } from './dyslexiaFont';
import { injectHighlightStyles } from './highlightStyles';
import { getSelectedText, replaceSelectedText } from './textSelection';

console.log('content has been injected');

injectHighlightStyles();

const handleRuntimeMessage = (message: Message) => {
  switch (message.type) {
    case 'update_read_mode':
      message.readModeEnabled ? enableReadMode() : disableReadMode();
      break;
    case 'simplified_text':
      console.log('Received processed text:', message.text);
      replaceSelectedText(message.text);
      break;
    case 'update_dyslexia_font':
      message.dyslexiaFontEnabled
        ? injectDyslexiaFont()
        : removeDyslexiaFontFromPage();
      break;
    case 'readMode_text':
      displayProcessedText(message.text);
      break;
    default:
      console.warn(`Unknown message type: ${message.type}`);
  }
};

chrome.runtime.onMessage.addListener(handleRuntimeMessage);

const checkDyslexiaFontEnabled = () => {
  chrome.runtime.sendMessage(
    { type: 'get_dyslexia_font_enabled' },
    (response) => {
      if (response?.dyslexiaFontEnabled) {
        injectDyslexiaFont();
      }
    }
  );
};

checkDyslexiaFontEnabled();

document.addEventListener('mouseup', () => {
  const selectedText = getSelectedText();
  if (selectedText) {
    console.log('Selected text:', selectedText);
    chrome.runtime.sendMessage({ type: 'selected_text', text: selectedText });
  } else {
    console.warn('No text selected!');
  }
});
