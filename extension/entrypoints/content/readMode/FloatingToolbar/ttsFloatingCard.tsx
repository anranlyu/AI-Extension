import React, { useState, useEffect, useRef } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';

interface TTSFloatingCardProps {
  textContent?: string;
}

const VOICE_OPTIONS = [
  { id: 'alloy', label: 'Alloy (Default)' },
  { id: 'ash', label: 'Ash' },
  { id: 'nova', label: 'Nova' },
  { id: 'echo', label: 'Echo' },
];

/**
 * Sends a TTS request initiation to the background script.
 * Background script will respond immediately with ack, then later with audio.
 * @param textToRead Text to convert to speech
 * @param voice Selected voice
 * @returns Promise resolving when the initial request is acknowledged (or fails).
 */
export const requestTTS = async (
  textToRead: string,
  voice: string = 'alloy'
): Promise<{ success: boolean; error?: string; status?: string }> => {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        {
          type: 'toggle_tts_in_read_mode',
          text: textToRead,
          voice,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              'TTS initial request runtime error:',
              chrome.runtime.lastError.message
            );
            return resolve({
              success: false,
              error: `Runtime error: ${chrome.runtime.lastError.message}`,
            });
          }
          console.log('TTS request acknowledgement received:', response);
          if (!response || !response.success) {
            resolve({
              success: false,
              error: response?.error || 'Initial request failed',
            });
          } else {
            resolve({ success: true, status: response.status }); // Expect { status: 'processing' }
          }
        }
      );
    } catch (error) {
      console.error('Synchronous error sending TTS initial request:', error);
      resolve({
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown synchronous error',
      });
    }
  });
};

const TTSFloatingCard: React.FC<TTSFloatingCardProps> = ({ textContent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // --- Effect to listen for TTS audio result from background ---
  useEffect(() => {
    const messageListener = (
      message: any,
      sender: chrome.runtime.MessageSender
    ) => {
      if (message.type === 'tts_audio_ready') {
        console.log('Received tts_audio_ready message:', message);
        setIsLoading(false); // Stop loading regardless of success/failure

        if (message.success && message.audioUrl) {
          setLastError(null);
          const audio = new Audio(message.audioUrl);
          audioRef.current = audio;

          audio.addEventListener('ended', () => {
            setIsPlaying(false);
            audioRef.current = null; // Clear ref when done
          });

          audio.addEventListener('error', (e) => {
            console.error('Audio playback error:', e);
            setLastError('Error playing audio.');
            setIsPlaying(false);
            audioRef.current = null;
          });

          // Start playing
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.error('Error starting audio playback:', err);
              setLastError('Failed to start playback.');
              setIsPlaying(false);
              audioRef.current = null;
            });
        } else {
          // Handle TTS failure
          console.error('TTS generation failed:', message.error);
          setLastError(message.error || 'TTS failed in background.');
          setIsPlaying(false);
          audioRef.current = null;
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      // Clean up audio element and ref if component unmounts while playing
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs only once on mount
  // --- End Effect ---

  const handleVoiceSelect = (voice: (typeof VOICE_OPTIONS)[0]) => {
    setSelectedVoice(voice);
    // Send voice update to background if needed (optional)
    // chrome.runtime.sendMessage({ type: 'update_tts_voice', voice: voice.id });

    // Reset existing audio on voice change
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
    setIsLoading(false); // Stop loading if voice changes mid-request
    setLastError(null);
  };

  const handlePlayPause = async () => {
    console.log('Play/Pause clicked', { isPlaying, isLoading });
    setLastError(null); // Clear previous errors

    if (isLoading) return; // Prevent multiple requests

    if (isPlaying && audioRef.current) {
      // Pause current playback
      audioRef.current.pause();
      setIsPlaying(false);
      // Don't clear audioRef here, allow resuming
      return;
    }

    if (!isPlaying && audioRef.current) {
      // Resume existing audio
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Error resuming audio playback:', err);
        setLastError('Failed to resume playback.');
        setIsPlaying(false);
        audioRef.current = null; // Clear ref if resume fails
      }
      return;
    }

    // --- Initiate new TTS request ---
    if (!audioRef.current) {
      if (!textContent) {
        setLastError('No readable content found');
        return;
      }

      setIsLoading(true);
      try {
        // Send request, wait only for acknowledgement
        const ack = await requestTTS(textContent, selectedVoice.id);

        if (!ack.success) {
          throw new Error(ack.error || 'Failed to send TTS request');
        }

        // Now waiting for the 'tts_audio_ready' message handled by the useEffect listener
        console.log('TTS request sent and acknowledged. Waiting for audio...');
      } catch (err) {
        console.error('Error initiating TTS:', err);
        setLastError(
          err instanceof Error ? err.message : 'Unknown error initiating TTS'
        );
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-[#D9DCD6] text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 justify-between font-sans">
      {/* Error Display */}
      {lastError && (
        <div className="text-red-700 text-xs absolute bottom-full left-0 mb-1 p-1 bg-red-100 rounded">
          Error: {lastError}
        </div>
      )}

      {/* Play/Pause Button */}
      <button
        className={`size-10 bg-[#2F6690] text-white p-2 rounded-full hover:bg-[#2F6690] transition flex items-center justify-center ${
          isLoading ? 'opacity-50 cursor-wait' : ''
        }`}
        onClick={handlePlayPause}
        disabled={isLoading}
        aria-label={isPlaying ? 'Pause' : isLoading ? 'Loading' : 'Play'}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>

      {/* Voice Agent Dropdown */}
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton
          className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-[#2F6690] px-3 py-2 text-sm font-semibold text-white ring-1 ring-gray-100 hover:bg-[#2F6690] transition disabled:opacity-50"
          disabled={isLoading || isPlaying}
        >
          {selectedVoice.label}
        </MenuButton>

        <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-[#D9DCD6] ring-1 ring-black/5 shadow-lg z-20 focus:outline-none">
          <div className="py-1">
            {VOICE_OPTIONS.map((voice) => (
              <MenuItem key={voice.id}>
                {({ active }) => (
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      active ? 'bg-[#2F6690] text-gray-900' : 'text-gray-700'
                    } ${selectedVoice.id === voice.id ? 'font-semibold' : ''}`}
                    onClick={() => handleVoiceSelect(voice)}
                  >
                    {voice.label}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
};

export default TTSFloatingCard;
