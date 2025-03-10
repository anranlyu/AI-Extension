import { Prompt, readModePrompt, translatePrompt } from "../assets/Prompt";
import getTextFromDeepseek from "../service/getTextFromDeepseek";
import { Message } from "../service/type";
import generateTTS from "../service/tts_openai";

console.log('Background is running');

const sendTextToContentScript = (type: string, text: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type, text });
    }
  });
};

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  if (message.type === 'selected_text') {
    chrome.storage.local.get(['simplifyTextEnabled', "translateEnabled", "targetLanguage"], async (result) => {
      const simplifyTextEnabled = result.simplifyTextEnabled || false;
      const translateEnabled = result.translateEnabled || false;
      const targetLanguage = result.targetLanguage || "";

      if (simplifyTextEnabled) {
        console.log('Processing simplification for selected text.');
        const selectedText = message.text;

        const simplifiedText = `[ ${await getTextFromDeepseek({ prompt: Prompt, text: selectedText })} ]`;

        console.log(`Got simplified text in background:${simplifiedText}`);
        sendTextToContentScript('simplified_text', simplifiedText);
      } else if (translateEnabled) {
        const selectedText = message.text;
        const translatedText = await getTextFromDeepseek({
          prompt: `${translatePrompt} to ${targetLanguage}:`,
          text: selectedText,
        });
        console.log(`Got translated text in background: ${translatedText}`);
        sendTextToContentScript('translated_text', translatedText);
      } else {
        console.log("No processing toggle enabled.");
      }
    });
  }

  if (message.type === 'process_text_for_read_mode') {
    (async () => {
      const processedText = await getTextFromDeepseek({
        prompt: readModePrompt,
        text: message.text,
      });

      if (processedText) {
        sendTextToContentScript('readMode_text', processedText);
      }
    })();
  }

  if (message.type === 'tts_request') {
    console.log('TTS request received:', message.text);

    (async function handleTTSRequest() {
      try {
        const ttsResponse = await generateTTS(message.text, "alloy");
        console.log('Generated TTS:', ttsResponse);

        if (ttsResponse.success && ttsResponse.audioUrl) {
          sendResponse({ success: true, audioUrl: ttsResponse.audioUrl });
        } else {
          sendResponse({ success: false, error: "No audio URL received." });
        }
      } catch (error) {
        console.error('Error generating TTS:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error occurred" });
      }
    })();

    return true;
  }
});
