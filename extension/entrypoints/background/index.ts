/**
 * Background script for the LumiRead extension.
 * Handles authentication, text processing, and communication between content scripts and popup.
 */

import {LengthAdjustmentPrompts, translatePrompt, ReadingLevelAdjustmentPrompts } from "./Prompt";
import getTextFromDeepseek from "./getTextFromDeepseek";
import { Message } from "../service/type";
import { createClient } from '@supabase/supabase-js';
import getAudioFromOpenAI from "./getAudioFromOpenAI";

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
   * Handles extension installation and updates
   * Redirects to onboarding page on first install
   */
  chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      // TODO: change to onboarding page
      chrome.tabs.create({
        url: 'https://lumiread.netlify.app/'
      });
    }
    // Todo: add logic for 'update' reason here if needed
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
   * Handles ReadMode state for a specific tab
   * @param tabId - The tab ID
   * @param enabled - Whether ReadMode should be enabled
   */
  const setReadModeForTab = async (tabId: number, enabled: boolean) => {
    try {
      // Get current tab states
      const { readModeTabStates = {} } = await chrome.storage.local.get('readModeTabStates');
      
      // Update state for this tab
      if (enabled) {
        readModeTabStates[tabId] = true;
      } else {
        delete readModeTabStates[tabId];
      }
      
      // Save updated states
      await chrome.storage.local.set({ readModeTabStates });
      
      // Send message to the tab to update its UI
      chrome.tabs.sendMessage(tabId, { 
        type: 'toggle_read_mode', 
        enabled 
      });
    } catch (error) {
      console.error('Error updating ReadMode state:', error);
    }
  };

  /**
   * Get tab ID from sender or active tab
   * @param sender - The message sender
   * @returns Promise resolving to the tab ID
   */
  const getTabId = async (sender: chrome.runtime.MessageSender): Promise<number | undefined> => {
    if (sender.tab?.id) {
      return sender.tab.id;
    }
    
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0]?.id;
  };

  /**
   * Process text with DeepSeek API
   * @param prompt - The prompt to use
   * @param text - The text to process
   * @param tabId - The tab ID to send results to
   * @param responseType - The response message type
   * @param level - The selected level
   */
  const processTextWithDeepseek = async (
    prompt: string, 
    text: string, 
    tabId: number,
    responseType: string,
    level: number
  ) => {
    try {
      const processedText = await getTextFromDeepseek({
        prompt,
        text,
      });
      
      chrome.tabs.sendMessage(tabId, {
        type: responseType,
        text: processedText,
        level,
        success: true
      });
    } catch (error) {
      console.error("Error processing text:", error);
      chrome.tabs.sendMessage(tabId, {
        type: responseType,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      });
    }
  };

// Unified message handler
// Make the main listener async again to allow await in other handlers
chrome.runtime.onMessage.addListener(async (message: Message, sender, sendResponse) => {
  // Get tabId from sender if available (primarily for content script messages)
  const senderTabId = sender.tab?.id;

  switch (message.type) {
    case 'get_tab_id': {
      // Use senderTabId here
      sendResponse({ tabId: senderTabId, error: !senderTabId ? 'No tab ID available' : undefined });
      break;
    }
    case 'toggle_read_mode_for_tab': {
      // IMPORTANT: Use tabId from the message payload, NOT senderTabId
      const { tabId: targetTabId, enabled } = message;
      if (targetTabId && enabled !== undefined) {
        // Use targetTabId here
        await setReadModeForTab(targetTabId, enabled);
        sendResponse({ success: true });
      } else {
        // Be more specific about the error
        sendResponse({ error: 'Missing targetTabId or enabled flag in message' }); 
      }
      break;
    }
    case 'tts_state_change': {
      // Use senderTabId here
      if (senderTabId) chrome.tabs.sendMessage(senderTabId, message);
      break;
    }
    case 'update_read_mode_state': {
      const enabled = message.enabled === true;
      // Use senderTabId here
      if (senderTabId) {
        await setReadModeForTab(senderTabId, enabled);
        sendResponse({ success: true });
      } else sendResponse({ error: 'No sender tab ID' });
      break;
    }
    case 'readMode_text_length_adjustment': {
      // Use senderTabId here
      if (!message.selectedLevel || !message.text || !senderTabId) {
        sendResponse({ error: 'Missing params or sender tab ID' });
        break;
      }
      await processTextWithDeepseek(
        LengthAdjustmentPrompts[message.selectedLevel - 1],
        message.text,
        senderTabId,
        'proceesed_read_mode_text',
        message.selectedLevel
      );
      break;
    }
    case 'readMode_text_reading_level': {
       // Use senderTabId here
      if (!message.selectedLevel || !message.text || !senderTabId) {
        sendResponse({ error: 'Missing params or sender tab ID' });
        break;
      }
      await processTextWithDeepseek(
        ReadingLevelAdjustmentPrompts[message.selectedLevel],
        message.text,
        senderTabId,
        'proceesed_read_mode_text',
        message.selectedLevel
      );
      break;
    }
    case 'readMode_text_translation': {
      try {
        const processed = await getTextFromDeepseek({
          prompt: `${translatePrompt} to ${message.targetLanguage}:`,
          text: message.text
        });
         // Use senderTabId here
        if (senderTabId) {
          chrome.tabs.sendMessage(senderTabId, { type: 'proceesed_read_mode_text', text: processed, success: true });
        }
      } catch (err) {
        console.error('Error translating:', err);
        sendResponse({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
      }
      break;
    }
    case 'SET_AUTH': {
      if (message.auth) await chrome.storage.local.set(message.auth);
      break;
    }
    case 'toggle_tts_in_read_mode': {
      // Use senderTabId here for sending the final result
      const targetTabIdForTTS = sender.tab?.id; 
      sendResponse({ success: true, status: 'processing' });
      (async () => {
      try {
        if (!message.text) throw new Error('No text for TTS in background script');
          if (!targetTabIdForTTS) throw new Error('Cannot send TTS result without sender tab ID');

        const ttsResult = await getAudioFromOpenAI(message.text, message.voice || 'alloy');

        if (ttsResult.success && ttsResult.audioBlob) {
          const reader = new FileReader();
            reader.onloadend = () => {
              console.log("FileReader finished, sending audio URL to tab:", targetTabIdForTTS);
              chrome.tabs.sendMessage(targetTabIdForTTS, {
                type: 'tts_audio_ready',
                success: true,
                audioUrl: reader.result
              });
            };
            reader.onerror = (error) => {
               console.error("FileReader error:", error);
               chrome.tabs.sendMessage(targetTabIdForTTS, { 
                 type: 'tts_audio_ready', 
                 success: false, 
                 error: 'FileReader error' 
               });
            };
          reader.readAsDataURL(ttsResult.audioBlob);
        } else {
            console.log("No audio blob received, sending error to tab:", targetTabIdForTTS);
            chrome.tabs.sendMessage(targetTabIdForTTS, { 
              type: 'tts_audio_ready', 
              success: false, 
              error: ttsResult.error || 'No audio blob' 
            });
        }
      } catch (err) {
        console.error('TTS error:', err);
          if (targetTabIdForTTS) {
            chrome.tabs.sendMessage(targetTabIdForTTS, { 
              type: 'tts_audio_ready', 
              success: false, 
              error: err instanceof Error ? err.message : 'Unknown TTS error' 
            });
      }
        }
      })();
      return false; 
    }
    default:
      break;
  }
  
  return true; 
});

// Clean up on tab removal
chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    const { readModeTabStates = {} } = await chrome.storage.local.get('readModeTabStates');
    if (readModeTabStates[tabId]) {
      delete readModeTabStates[tabId];
      await chrome.storage.local.set({ readModeTabStates });
    }
  } catch (err) {
    console.error('Cleanup error:', err);
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
  
  const session = await supabase.auth.refreshSession({ refresh_token });
  
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
