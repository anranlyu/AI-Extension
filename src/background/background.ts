import { Prompt, readModePrompt, translatePrompt } from "../assets/Prompt";
import getTextFromDeepseek from "../service/getTextFromDeepseek";
import { Message } from "../service/type";

console.log('Background is running');

const sendTextToContentScript = (type: string, text: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type, text });
    }
  }); 
};


chrome.runtime.onMessage.addListener(async (message: Message) => {
  if (message.type === 'selected_text') {
    chrome.storage.local.get(['simplifyTextEnabled', "translateEnabled", "targetLanguage"], async (result) => {
      const simplifyTextEnabled = result.simplifyTextEnabled || false;
      const translateEnabled = result.translateEnabled || false;
      const targetLanguage = result.targetLanguage || "";

      if (simplifyTextEnabled) {
        console.log('Processing simplification for selected text.');
        const selectedText = message.text;
        const simplifiedText = `[ ${await getTextFromDeepseek({ prompt:Prompt, text:selectedText })} ]`;
        console.log(`Got simplified text in background:${simplifiedText}`); // Todo: Delete after devolopment
        sendTextToContentScript('simplified_text', simplifiedText);
      } else if (translateEnabled) {
        const selectedText = message.text;
        const translatedText = await getTextFromDeepseek({
          prompt: `${translatePrompt} to ${targetLanguage}:`,
          text: selectedText,
        });
        console.log(`Got translated text in background: ${translatedText}`); // Todo: Delete after devolopment
        sendTextToContentScript('translated_text', translatedText);
      } else {
        console.log("No processing toggle enabled.")
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
