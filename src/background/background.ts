
import getSummaryFromDeepseek from "../service/getSimplifiedTextFromDeepseek";
import { Message } from "../service/type";



const sendTextToContentScript = (simplifiedText: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'simplified_text', text:simplifiedText });
    }
  })
}


chrome.runtime.onMessage.addListener(async (message: Message) => {
  if (message.type === 'selected_text') {
    chrome.storage.local.get(['simplifyTextEnabled'], async (result) => {
      const simplifyTextEnabled = result.simplifyTextEnabled || false;

      if (simplifyTextEnabled) {
        const selectedText = message.text;
        const simplifiedText = await getSummaryFromDeepseek(selectedText);
        console.log(`Got simplified text in background:${simplifiedText}`); // Todo: Delete after devolopment
        sendTextToContentScript(simplifiedText);
      } else {
        console.log('Simplify Text toggle is OFF. Skipping text simplification.');
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'get_dyslexia_font_enabled') {

    chrome.storage.local.get(['dyslexiaFontEnabled'], (result) => {
      sendResponse({ dyslexiaFontEnabled: result.dyslexiaFontEnabled });
    });

    return true;
  }

  if (message.type === 'update_read_mode') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'update_read_mode',
          readModeEnabled: message.readModeEnabled,
        });
      }
    });
  }
});
