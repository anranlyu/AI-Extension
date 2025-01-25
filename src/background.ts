import getSummaryFromDeepseek from "./service/getSummaryFromDeepseek";



const sendSummaryToContentScript = (summary: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'SUMMARY', summary });
    }
  })
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'EXTRACTED_TEXT') {
    const textToSummarize = message.text;
    const summarizedText = await getSummaryFromDeepseek(textToSummarize);
    sendSummaryToContentScript(summarizedText);

  }
});


