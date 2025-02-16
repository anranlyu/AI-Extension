import { Prompt, readModePrompt, translatePrompt } from "../assets/Prompt";
import getTextFromDeepseek from "../service/getTextFromDeepseek";
import getTranslationFromGPT from "../service/getTranslationFromGPT";
// import getTranslationFromDeepseek from "../service/getTranslationFromDeepseek";
import { Message } from "../service/type";

console.log('Background is running');

const sendTextToContentScript = (type: string, text: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type, text });
    }
  });
};


chrome.runtime.onMessage.addListener(
  async (message: Message, _sender, sendResponse) => {
    if (message.type === 'selected_text') {
      // Merge the logic for translation and simplification here:
      chrome.storage.local.get(
        ['translateEnabled', 'simplifyTextEnabled', 'targetLanguage'],
        async (result) => {
          const translateEnabled = result.translateEnabled || false;
          const simplifyTextEnabled = result.simplifyTextEnabled || false;
          const selectedText = message.text;
          const targetLanguage = result.targetLanguage || "" ; 


          // If translation is enabled, prioritize translation over simplification.
          if (translateEnabled) {
            console.log('Processing translation for selected text.');
            const translatedText = await getTranslationFromGPT({
              prompt: translatePrompt,
              text: selectedText,
              targetLanguage: targetLanguage
            });
            console.log(`Got translated text in background: ${translatedText}`);
            sendTextToContentScript('translated_text', translatedText);
            sendResponse({ translatedText: translatedText });
          } else if (simplifyTextEnabled) {
            console.log('Processing simplification for selected text.');
            const simplifiedText = await getTextFromDeepseek({
              prompt: Prompt,
              text: selectedText,
            });
            console.log(`Got simplified text in background: ${simplifiedText}`);
            sendTextToContentScript('simplified_text', simplifiedText);
            sendResponse({ simplifiedText: simplifiedText});
          } else {
            console.log('No processing toggle enabled.');
          }
          sendResponse(); // Ensure we respond.
        }
      );
      return true; // Keep the channel open for async response.
    }
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
    chrome.storage.local.get(
      ['readModeEnabled', 'dyslexiaFontEnabled', 'translateEnabled', 'targetLanguage'],
      (data) => {
        sendResponse(data);
      }
    );
    return true; // For asynchronous response.
  }
});

