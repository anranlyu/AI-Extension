
import getSummaryFromDeepseek from "../service/getSummaryFromDeepseek";
import { Message } from "../service/type";



const sendTextToContentScript = (simplifiedText: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'simplified_text', text:simplifiedText });
    }
  })
}

chrome.runtime.onMessage.addListener(async (message:Message) => {
  if (message.type === 'selected_text') {
    const selectedText = message.text;
    const simplifiedText = await getSummaryFromDeepseek(selectedText);
    console.log(`Got simplified text in background:${simplifiedText}`)
    sendTextToContentScript(simplifiedText);

  }
});


