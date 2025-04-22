import { extractReadableContent } from '../readMode/readMode';
import '../../content/content.css';

/**
 * Maximum text length for TTS to prevent hitting API limits
 * Set to 0 to disable the limit
 */
const MAX_TTS_LENGTH = 0;

// State tracking
let currentAudio: HTMLAudioElement | null = null;
let isProcessing = false;

/**
 * Sends a TTS request to the background script
 * @param textToRead Text to convert to speech
 * @returns Promise with the TTS response
 */
export const requestTTS = async (
  textToRead: string,
  voice: string = 'alloy'
): Promise<{ success: boolean; audioUrl?: string; error?: string }> => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'toggle_tts_in_read_mode',
      text: textToRead,
      voice,
    });

    if (!response || !response.success) {
      return {
        success: false,
        error: response?.error || 'No response from background script',
      };
    }

    return response;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Enables Text-to-Speech mode using provided or extracted content
 * @param voice Voice to use for TTS
 * @param providedContent Optional pre-extracted content
 */
// export const enableTTSMode = async (
//   voice: string = 'alloy',
//   providedContent?: { content: string }
// ) => {
//   if (isProcessing) return;
//   isProcessing = true;

//   try {
//     let textToRead: string;

//     if (providedContent?.content) {
//       textToRead = providedContent.content.trim();
//     } else {
//       const extractedData = await extractReadableContent();
//       if (!extractedData) throw new Error('No readable content found');

//       // Prefer plain text if available
//       textToRead =
//         (extractedData.textContent || extractedData.htmlContent || '')
//           .trim();
//     }

//     if (!textToRead) throw new Error('No valid text to read');

//     // Apply length limit if needed
//     if (MAX_TTS_LENGTH > 0 && textToRead.length > MAX_TTS_LENGTH) {
//       textToRead = textToRead.substring(0, MAX_TTS_LENGTH) + '...';
//     }

//     // Request TTS from background script
//     const ttsResponse = await requestTTS(textToRead, voice);
//     if (!ttsResponse.success) throw new Error(ttsResponse.error || 'TTS request failed');

//     // Handle audio playback
//     if (currentAudio) {
//       currentAudio.pause();
//     }

//     currentAudio = new Audio(ttsResponse.audioUrl!);

//     try {
//       await currentAudio.play();
//     } catch (err) {
//       // Handle autoplay blocking
//       if (err instanceof Error && err.name === 'NotAllowedError') {
//         document.body.addEventListener(
//           'click',
//           function playAfterInteraction() {
//             currentAudio?.play().then(() => {
//               document.body.removeEventListener('click', playAfterInteraction);
//             });
//           },
//           { once: true }
//         );
//       } else {
//         throw err;
//       }
//     }
//   } catch (error) {
//     console.error('TTS error:', error);
//   } finally {
//     isProcessing = false;
//   }
// };

// /**
//  * Stops TTS playback and resets state
//  */
// export const stopRead = () => {
//   if (currentAudio) {
//     currentAudio.pause();
//     currentAudio.currentTime = 0;
//     currentAudio = null;
//   }
// };
