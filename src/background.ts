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

// chrome.runtime.onMessage.addListener((message, send, sendResponse) => {
//   if (message.type === 'EXTRACTED_TEXT' && send) {
//     const textToSummarize = message.text;

//     fetch('http://127.0.0.1:11434/api/generate', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: "deepseek-r1:7b", // Replace with your model name
//         prompt: `Summarize the following text:\n\n${textToSummarize}`,
//         stream: false, // Get the response as a single JSON object
//       }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         const summary = data.response; // Extract summary from the response
//         console.log('Summarized Text:', summary);

//         // Send the summary back to the content script
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//           if (tabs[0]?.id) {
//             chrome.tabs.sendMessage(tabs[0].id, { type: 'SUMMARY', summary });
//           }
//         });

//         sendResponse({ success: true });
//       })
//       .catch((error) => {
//         console.error('Error communicating with Ollama:', error);
//         sendResponse({ success: false, error: error.message });
//       });

//     // Return true to indicate asynchronous response
//     return true;
//   }
// });

