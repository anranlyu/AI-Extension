import { Prompt, ReadModePrompts, translatePrompt } from "../service/Prompt";
import getTextFromDeepseek from "../service/getTextFromDeepseek";
import { Message } from "../service/type";
import generateTTS from "../service/tts_openai";

export default defineBackground(() => {

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

          const simplifiedText = `[ ${await getTextFromDeepseek({ prompt: Prompt, text: selectedText })} ]`;

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
    if (message.type === 'readMode_text') {
      console.log("get raw read mode text")
      const processedText = await getTextFromDeepseek({
        prompt: ReadModePrompts[message.selectedLevel],
        text: message.text,
      })
      console.log("Got new read mode text from llm" + processedText)
      if (processedText) {
        sendTextToContentScript('simplified_readMode_text', processedText);
      } else {
        console.log('no new read mode text')
      }
    }
  }
  );

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'tts_request') {
      console.log('TTS request received:', message.text);
      (async () => {
        try {
          const ttsResult = await generateTTS(message.text, "alloy");
          console.log('Generated TTS:', ttsResult);
          if (ttsResult.success && ttsResult.audioBlob) {
            sendResponse({ success: true, audioUrl: ttsResult.audioBlob });
          } else {
            sendResponse({ success: false, error: "No audio Blob object received." });
          }
        } catch (error) {
          console.error('Error generating TTS:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
          });
        }
      })();
      return true;
    }
  });
});