import { Prompt, readModePrompt, translatePrompt } from "../assets/Prompt";
import getTextFromDeepseek from "../service/getTextFromDeepseek";
import getTranslationFromGPT from "../service/getTranslationFromGPT";
import { Message } from "../service/type";


const sendTextToContentScript = (type: string, text: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type, text });
    }
  });
};

chrome.runtime.onMessage.addListener(
  async (message: Message, _sender, sendResponse) => {
    // For testing, override simplification to perform translation.
    console.log("Background onMessage received whoooo dis:", message);
    if (message.type === 'selected_text') {
      chrome.storage.local.get(['translateEnabled'], async (result) => {
        const translateEnabled = result.translateEnabled || false;
        if (translateEnabled) {
          const selectedText = message.text;
          // Use translatePrompt to instruct translation.

          console.log('check if we reach this line before GPT');
          const translatedText = await getTranslationFromGPT({
            prompt: translatePrompt,
            text: selectedText,
          });
          console.log(`Got translated text in background: ${translatedText}`);
          sendTextToContentScript('translated_text', translatedText);
        } else {
          console.log('Translation toggle is OFF. Skipping text translation.');
        }
        sendResponse(); // Notify sender that response handling is complete.
      });
      return true; // Keep the messaging channel open.
    }
    // Handle read mode processing separately.
    else if (message.type === 'process_text_for_read_mode') {
      const processedText = await getTextFromDeepseek({
        prompt: readModePrompt,
        text: message.text,
      });
      if (processedText) {
        sendTextToContentScript('readMode_text', processedText);
      }
      sendResponse();
      return true;
    } else {
      sendResponse();
    }
  }
);



chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.id) {
          if (changes.readModeEnabled) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'update_read_mode',
              readModeEnabled: changes.readModeEnabled.newValue,
            });
          }
          if (changes.dyslexiaFontEnabled) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'update_dyslexia_font',
              dyslexiaFontEnabled: changes.dyslexiaFontEnabled.newValue,
            });
          }
          if (changes.simplifyTextEnabled) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'update_simplify_text',
              simplifyTextEnabled: changes.simplifyTextEnabled.newValue,
            });
          }
          if (changes.translateEnabled) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'update_translate_mode',
              translateEnabled: changes.translateEnabled.newValue,
            });
          }
        }
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'get_initial_state') {
    chrome.storage.local.get(['readModeEnabled', 'dyslexiaFontEnabled', "translateEnabled"], (data) => {
      sendResponse(data);
    });
    return true; // Required for async sendResponse
  }
});
