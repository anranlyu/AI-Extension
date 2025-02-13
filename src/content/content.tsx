/* eslint-disable @typescript-eslint/no-unused-expressions */
import './content.css';
import { getSelectedText, replaceSelectedText } from './textSelection';
import { Message } from '../service/type';
import { injectDyslexiaFont, removeDyslexiaFontFromPage } from './dyslexiaFont';
import { injectHighlightStyles } from './highlightStyles';
import { disableReadMode, enableReadMode } from './readMode';
import "./translate"; 

console.log('content has been injected');
injectHighlightStyles();

const handleRuntimeMessage = (message: Message) => {
  switch (message.type) {
    case 'simplified_text':
      console.log('Received simplified text:', message.text);
      replaceSelectedText(message.text);
      break;
    case 'translated_text':
      console.log('Received translated text:', message.text);
      // You might display the translated text as an overlay here.
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
      // Optionally handle read mode text.
      break;
    case "update_translate_mode":
      console.log("Received update_translate_mode:", message.translateEnabled);
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

