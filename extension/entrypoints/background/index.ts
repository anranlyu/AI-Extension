import { Prompt, ReadModePrompts, translatePrompt } from "../service/Prompt";
import getTextFromDeepseek from "../service/getTextFromDeepseek";
import { Message } from "../service/type";
import generateTTS from "../service/tts_openai";
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://nzbrkhngkszrdmahshpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56YnJraG5na3N6cmRtYWhzaHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzI4OTgsImV4cCI6MjA1NzMwODg5OH0.LyLKnMwTQLiB-z_1MuTwmdX0kiLbpsIUL3tqMzDK0Ow';
const supabase = createClient(supabaseUrl, supabaseKey);
export default defineBackground(() => {

  // Decide what will happen when the user open extension
  chrome.action.onClicked.addListener(async (tab) => {
    await openLumiRead(tab);
  })


  // Handler watches for tabs change and finish the auth flow when the extension’s redirect URL is open
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    
    if (changeInfo.url?.startsWith(chrome.identity.getRedirectURL())) {
      const hashMap = parseUrlHash(changeInfo.url);
      const redirectType = hashMap.get('type');
      if (redirectType === 'recovery') {
        chrome.tabs.update({ url: getLoginPageUrl(hashMap) });
        return;
      }

      finishUserAuth(changeInfo.url);
    }
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session) {
        browser.storage.local.set(session);
      } 
    }

    if (event === 'SIGNED_OUT') {
      browser.storage.local.clear();
    }
  });






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

  const storageContent = await chrome.storage.local.get(null);
  const { refresh_token } = storageContent;
  console.log(storageContent);
  const session = await supabase.auth.refreshSession({ refresh_token });
  console.log('background script')
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
  await chrome.tabs.create({
    url: chrome.runtime.getURL('../auth.html'),
    active: true,
  });
}
 

const finishUserAuth = async (url: string) => {
  try {
    const hashMap = parseUrlHash(url);
    const access_token = hashMap.get('access_token');
    const refresh_token = hashMap.get('refresh_token');
    if (!access_token || !refresh_token) {
      throw new Error(`no supabase tokens found in URL hash`);
    }

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;

    // Persist session to storage - background script can become inactive and the session will be lost,
    // we need to be able to recover it by storing the tokens in extension's storage.
    console.log(data);
    await chrome.storage.local.set({ session: data.session, refresh_token: data.session?.refresh_token });

    // finally redirect to a post-auth page
    //TODO: update the post-auth page
    chrome.tabs.update({ url: 'https://myapp.com/user-login-success/' });

    console.log(`finished handling user Auth callback`);
  } catch (error) {
    console.error(error);
  }
}


function parseUrlHash(url: string) {
  const hashParts = new URL(url).hash.slice(1).split('&');
  const hashMap = new Map(
    hashParts.map(part => {
      const [name, value] = part.split('=');
      return [name, value];
    }),
  );

  return hashMap;
}


function getLoginPageUrl(hashMap:Map<string, string>) {
  // You could extract some parameters if needed:
  const errorParam = hashMap.get('error');
  
  // Build the URL with optional query parameters
  //TODO: update the login page
  let url = 'https://nzbrkhngkszrdmahshpp.supabase.co/auth/v1/callback';
  if (errorParam) {
    url += `?error=${encodeURIComponent(errorParam)}`;
  }
  return url;
}
