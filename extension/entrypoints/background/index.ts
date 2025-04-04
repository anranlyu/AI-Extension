/**
 * Background script for the LumiRead extension.
 * Handles authentication, text processing, and communication between content scripts and popup.
 */

import { Prompt, ReadModePrompts, translatePrompt } from "../service/Prompt";
import getTextFromDeepseek from "../service/getTextFromDeepseek";
import { Message } from "../service/type";
import generateTTS from "../service/tts_openai";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://nzbrkhngkszrdmahshpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56YnJraG5na3N6cmRtYWhzaHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzI4OTgsImV4cCI6MjA1NzMwODg5OH0.LyLKnMwTQLiB-z_1MuTwmdX0kiLbpsIUL3tqMzDK0Ow';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Main background script initialization
 * Sets up event listeners for extension actions, authentication, and message handling
 */
export default defineBackground(() => {
  /**
   * Handles extension icon click
   * Opens the popup or redirects to login if not authenticated
   */
  chrome.action.onClicked.addListener(async (tab) => {
    await openLumiRead(tab);
  });

  /**
   * Handles authentication callback
   * Watches for tab updates to catch the auth redirect URL
   */
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

  /**
   * Handles Supabase authentication state changes
   * Manages session persistence in chrome.storage
   */
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session) {
        chrome.storage.local.set(session);
      } 
    }

    if (event === 'SIGNED_OUT') {
      chrome.storage.local.clear();
    }
  });

  /**
   * Sends text content to the active tab's content script
   * @param type - The type of message to send
   * @param text - The text content to send
   */
  const sendTextToContentScript = (type: string, text: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type, text });
      }
    });
  };

  /**
   * Handles messages from content scripts and popup
   * Processes text for simplification, translation, and read mode
   */
  chrome.runtime.onMessage.addListener(async (message: Message, sender) => {
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
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'simplified_readMode_text',
          text: processedText,
          level: message.selectedLevel
        });
      }
    }

    if (message.type === 'SET_AUTH') {
      console.log(message);
      await chrome.storage.local.set(message.auth);
    }
  });

  /**
   * Handles text-to-speech requests
   * Converts text to audio and sends it back to the content script
   */
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'tts_request') {
      console.log('TTS request received:', message.text);
      (async () => {
        try {
          const ttsResult = await generateTTS(message.text, "alloy");
          if (ttsResult.success && ttsResult.audioBlob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result;
              sendResponse({ success: true, audioUrl: base64Audio });
              console.log('Sending TTS audio URL to content script...');
            };
            reader.readAsDataURL(ttsResult.audioBlob);
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

/**
 * Opens the LumiRead popup or redirects to login
 * @param tab - The current tab
 */
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

/**
 * Opens the login page in a new tab
 */
const openLoginPage = async () => {
  await chrome.tabs.create({
    url: chrome.runtime.getURL('../auth.html'),
    active: true,
  });
}

/**
 * Completes the user authentication process
 * @param url - The authentication callback URL
 */
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

    await chrome.storage.local.set({ session: data.session});
    chrome.tabs.update({ url: 'https://lumiread.netlify.app' });

    console.log(`finished handling user Auth callback`);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Parses URL hash parameters into a Map
 * @param url - The URL containing hash parameters
 * @returns Map of parameter names to values
 */
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

/**
 * Generates the login page URL with error handling
 * @param hashMap - Map of URL hash parameters
 * @returns The login page URL with optional error parameter
 */
function getLoginPageUrl(hashMap:Map<string, string>) {
  const errorParam = hashMap.get('error');
  let url = 'https://nzbrkhngkszrdmahshpp.supabase.co/auth/v1/callback';
  if (errorParam) {
    url += `?error=${encodeURIComponent(errorParam)}`;
  }
  return url;
}
