
import { Prompt, readModePrompt } from "../assets/Prompt";
import getTextFromDeepseek from "../service/getTextFromDeepseek";
import { Message } from "../service/type";



const sendTextToContentScript = (type:string, simplifiedText: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: type, text:simplifiedText });
    }
  })
}


chrome.runtime.onMessage.addListener(async (message: Message) => {
  if (message.type === 'selected_text') {
    chrome.storage.local.get(['simplifyTextEnabled'], async (result) => {
      const simplifyTextEnabled = result.simplifyTextEnabled || false;

      if (simplifyTextEnabled) {
        const selectedText = message.text;
        const simplifiedText = await getTextFromDeepseek({ prompt:Prompt, text:selectedText });
        console.log(`Got simplified text in background:${simplifiedText}`); // Todo: Delete after devolopment
        sendTextToContentScript('simplified_text', simplifiedText);
      } else {
        console.log('Simplify Text toggle is OFF. Skipping text simplification.');
      }
    });
  }

    if (message.type === 'process_text_for_read_mode') {
    const processedText = await getTextFromDeepseek({
      prompt: readModePrompt,
      text: message.text,
    })
    
    if (processedText) {
      sendTextToContentScript('readMode_text', processedText);
    }
  }
});


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
        }
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'get_initial_state') {
    chrome.storage.local.get(['readModeEnabled', 'dyslexiaFontEnabled'], (data) => {
      sendResponse(data);
    });
    return true; // Required for async sendResponse
  }
});
