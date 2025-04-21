import React, { useState, useEffect } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { enableTTSMode, stopRead } from './tts_content';

interface TTSFloatingCardProps {
  container?: HTMLElement;
}

// Available voice options
const VOICE_OPTIONS = [
  { id: 'alloy', label: 'Alloy (Default)' },
  { id: 'ash', label: 'Ash' },
  { id: 'nova', label: 'Nova' },
  { id: 'echo', label: 'Echo' },
];

const TTSFloatingCard: React.FC<TTSFloatingCardProps> = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0]);

  // Listen for TTS state changes from parent
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'tts_state_change') {
        setIsPlaying(message.isActive);
      }
    };

    // Add listener
    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);


  // In ttsFloatingCard.tsx
  const handleVoiceSelect = (voice: (typeof VOICE_OPTIONS)[0]) => {
    console.log('Voice selected:', voice.id);
    setSelectedVoice(voice);
    chrome.runtime.sendMessage({
        type: 'update_tts_voice',
        voice: voice.id
    });
  };

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (newPlayingState) {
      enableTTSMode(selectedVoice.id);
    } else {
      stopRead();
    }
  };

  return (
    <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 justify-between font-sans">
      {/* Play/Pause Button */}
      <button
        className="size-10 bg-white text-black p-2 rounded-full hover:bg-indigo-200 transition flex items-center justify-center"
        onClick={handlePlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
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
            aria-hidden="true"
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
            aria-hidden="true"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>

      {/* Voice Agent Dropdown */}
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-100 transition">
          {selectedVoice.label}
        </MenuButton>

        <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-indigo-100 ring-1 ring-black/5 shadow-lg z-20 focus:outline-none">
          <div className="py-1">
            {VOICE_OPTIONS.map((voice) => (
              <MenuItem key={voice.id}>
                {({ active }) => (
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
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
