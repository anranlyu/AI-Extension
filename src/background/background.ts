
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





