/* eslint-disable @typescript-eslint/no-unused-expressions */
import './content.css';
import { getSelectedText, replaceSelectedText } from './textSelection';
import { Message } from '../service/type';
import { injectDyslexiaFont, removeDyslexiaFontFromPage } from './dyslexiaFont';
import { injectHighlightStyles } from './highlightStyles';
import {
  disableReadMode,
  // displayProcessedText,
  enableReadMode,
} from './readMode';

console.log('content has been injected');

injectHighlightStyles();

const handleRuntimeMessage = (message: Message) => {
  switch (message.type) {
    case 'simplified_text':
      console.log('Received processed text:', message.text);
      replaceSelectedText(message.text);
      break;
    case 'update_read_mode':
      message.readModeEnabled ? enableReadMode() : disableReadMode();
      break;
    case 'update_dyslexia_font':
      message.dyslexiaFontEnabled
        ? injectDyslexiaFont()
        : removeDyslexiaFontFromPage();
      break;
    case 'readMode_text':
      // displayProcessedText(message.text);
      break;
    default:
      console.warn(`Unknown message type: ${message.type}`);
  }
};

chrome.runtime.onMessage.addListener(handleRuntimeMessage);

chrome.runtime.sendMessage({ type: 'get_initial_state' }, (response) => {
  if (response?.readModeEnabled) {
    enableReadMode();
  }
  if (response?.dyslexiaFontEnabled) {
    injectDyslexiaFont();
  }
});

document.addEventListener('mouseup', () => {
  const selectedText = getSelectedText();
  if (selectedText) {
    console.log('Selected text:', selectedText);
    chrome.runtime.sendMessage({ type: 'selected_text', text: selectedText });
  } else {
    console.warn('No text selected!');
  }
});
