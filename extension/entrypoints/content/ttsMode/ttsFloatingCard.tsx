import React, { useState, useEffect, useRef } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { requestTTS } from './tts_content';

interface TTSFloatingCardProps {
  textContent?: string;
}

const VOICE_OPTIONS = [
  { id: 'alloy', label: 'Alloy (Default)' },
  { id: 'ash', label: 'Ash' },
  { id: 'nova', label: 'Nova' },
  { id: 'echo', label: 'Echo' },
];

const TTSFloatingCard: React.FC<TTSFloatingCardProps> = ({ textContent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'tts_state_change' && audioRef.current) {
        setIsPlaying(message.isActive);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleVoiceSelect = (voice: typeof VOICE_OPTIONS[0]) => {
    setSelectedVoice(voice);
    chrome.runtime.sendMessage({
      type: 'update_tts_voice',
      voice: voice.id
    });
    // reset existing audio on voice change
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  };

  const handlePlayPause = async () => {
    console.log('Play/Pause clicked', { isPlaying, isLoading });
    if (isLoading) return;

    if (isPlaying) {
      // Pause playback
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // Resume existing audio
    if (audioRef.current) {
      await audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // First-time play: fetch TTS and play
    setIsLoading(true);
    try {
      console.log(textContent);
      if (!textContent) {
        throw new Error('No readable content found');
      }
      
      const resp = await requestTTS(textContent, selectedVoice.id);
      if (!resp.success || !resp.audioUrl) throw new Error(resp.error || 'TTS request failed');

      const audio = new Audio(resp.audioUrl);
      audioRef.current = audio;
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        audioRef.current = null;
      });

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#D9DCD6] text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 justify-between font-sans">
      {/* Play/Pause Button */}
      <button
        className="size-10 bg-[#16425B] text-white p-2 rounded-full hover:bg-[#2F6690] transition flex items-center justify-center"
        onClick={handlePlayPause}
        disabled={isLoading}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>

      {/* Voice Agent Dropdown */}
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-[#16425B] px-3 py-2 text-sm font-semibold text-white ring-1 ring-gray-100 hover:bg-[#2F6690] transition">
          {selectedVoice.label}
        </MenuButton>

        <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-[#D9DCD6] ring-1 ring-black/5 shadow-lg z-20 focus:outline-none">
          <div className="py-1">
            {VOICE_OPTIONS.map((voice) => (
              <MenuItem key={voice.id}>
                {({ active }) => (
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-[#81C3D7] text-gray-900' : 'text-gray-700'} ${selectedVoice.id === voice.id ? 'font-semibold' : ''}`}
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
