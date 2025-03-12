import { Prompt, ReadModePrompts, translatePrompt } from "../service/Prompt";
import getTextFromDeepseek from "../service/getTextFromDeepseek";
import { Message } from "../service/type";
import generateTTS from "../service/tts_openai";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzbrkhngkszrdmahshpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56YnJraG5na3N6cmRtYWhzaHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzI4OTgsImV4cCI6MjA1NzMwODg5OH0.LyLKnMwTQLiB-z_1MuTwmdX0kiLbpsIUL3tqMzDK0Ow';
const supabase = createClient(supabaseUrl, supabaseKey);

export default defineBackground(() => {

  chrome.action.onClicked.addListener(async (tab) => {
    console.log('clicked')
    await openLumiRead(tab);
  })
 
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
  
    if (message.type === 'tts_request') {
      console.log('TTS request received:', message.text);
      try {
        await generateTTS(message.text, "alloy");
      } catch (error) {
        console.error('Error generating TTS:', error);
      }
    }
  }
  );
});


const openLumiRead = async (tab: chrome.tabs.Tab) => {
  console.log(supabase);
  const storageContent = await chrome.storage.local.get(null);
  console.log(storageContent)
  const { refresh_token } = storageContent;

  const session = await supabase.auth.refreshSession({ refresh_token });
  console.log(session);
  if (session.error) {
    await Promise.all([chrome.storage.local.clear(), supabase.auth.signOut()]);
    await openLoginPage();
    return;
  } else {
    chrome.action.setPopup({ popup: 'popupWindow.html' }, () => {
      chrome.action.openPopup();
    });
  }

  
}

const openLoginPage = async () => {
  await browser.tabs.create({
    url: chrome.runtime.getURL('../auth.html'),
    active: true,
  });
}
 
