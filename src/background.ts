chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.id) {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === tabs[0].id && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"], 
        })
        // Remove the listener to avoid repeated execution
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  }
});


const generateSummary = async (message:string) => {
  try {

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b", // Replace with your model name
        prompt: `Summarize the following content from the webpage:${message} `,
        stream: false,
      })
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status:${response.status}`);
    }
  
    const json = await response.json();
    sendSummaryToContentScript(json.response);
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message); // Access error.message safely
    } else {
      throw new Error('An unknown error occurred');
    }
  }

}

const sendSummaryToContentScript = (summary: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'SUMMARY', summary });
    }
  })
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'EXTRACTED_TEXT') {
    const textToSummarize = message.text;
    generateSummary(textToSummarize);

  }
});


