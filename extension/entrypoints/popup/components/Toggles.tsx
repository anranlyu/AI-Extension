import React, { useEffect, useState } from 'react';
import { StorageValues } from '../../service/type';
import { HighlightSettings } from './HighlightSettings';
import { DyslexiaFontSettings } from './DyslexiaFontSettings';

const Toggles: React.FC = () => {
  const [dyslexiaFontEnabled, setDyslexiaFontEnabled] = useState(false);
  const [readModeEnabled, setReadModeEnabled] = useState(false);
  const [TTSenabled, setTTSEnabled] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);

  // Utility functions for applying Tailwind classes
  const toggleButtonClass = (enabled: boolean) =>
    `relative w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
      enabled ? 'bg-[#81C3D7]' : 'bg-gray-300'
    }`;
  const toggleDotClass = (enabled: boolean) =>
    `absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
      enabled ? 'translate-x-6' : 'translate-x-0'
    }`;

  // Helper to read from Chrome storage once, then sync component state
  const syncFromStorage = async () => {
    // Get the current tab ID
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      setCurrentTabId(tabs[0].id);

      // Get tab-specific ReadMode state
      const { readModeTabStates = {} } = await chrome.storage.local.get(
        'readModeTabStates'
      );
      setReadModeEnabled(!!readModeTabStates[tabs[0].id]);
    }

    const res = (await chrome.storage.local.get([
      'llm',
      'apiKey',
      'dyslexiaFontEnabled',
      'targetLanguage',
      'TTSenabled',
      'highlightEnabled',
    ])) as StorageValues;

    setDyslexiaFontEnabled(!!res.dyslexiaFontEnabled);
    setHighlightEnabled(!!res.highlightEnabled);
    setTTSEnabled(!!res.TTSenabled);
  };

  useEffect(() => {
    // Initial sync
    syncFromStorage();

    // Listen for any changes in Chrome storage
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if ('dyslexiaFontEnabled' in changes) {
        setDyslexiaFontEnabled(changes.dyslexiaFontEnabled.newValue);
      }
      if ('TTSenabled' in changes) {
        setTTSEnabled(changes.TTSenabled.newValue);
      }
      if ('readModeTabStates' in changes && currentTabId) {
        const tabStates = changes.readModeTabStates.newValue || {};
        setReadModeEnabled(!!tabStates[currentTabId]);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [currentTabId]);

  // --- Handlers ---
  const handleTTSToggle = () => {
    const newState = !TTSenabled;
    setTTSEnabled(newState);
    chrome.storage.local.set({ TTSenabled: newState });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'toggle_tts_card',
          enabled: newState,
        });
      }
    });
  };

  const handleReadModeToggle = () => {
    const newState = !readModeEnabled;
    setReadModeEnabled(newState);

    if (currentTabId) {
      chrome.runtime.sendMessage({
        type: 'toggle_read_mode_for_tab',
        tabId: currentTabId,
        enabled: newState,
      });
    }
  };

  const handleDyslexiaFontToggle = () => {
    const newState = !dyslexiaFontEnabled;
    setDyslexiaFontEnabled(newState);
    chrome.storage.local.set({ dyslexiaFontEnabled: newState });
  };

  const handleHighlightToggle = () => {
    const newState = !highlightEnabled;
    setHighlightEnabled(newState);
    chrome.storage.local.set({ highlightEnabled: newState });
  };

  return (
    <div className="p-4 bg-gray-100 shadow-md space-y-4 w-xs">
      {/* Read Mode Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-gray-700">Read Mode</span>
        <button
          onClick={handleReadModeToggle}
          className={toggleButtonClass(readModeEnabled)}
        >
          <div className={toggleDotClass(readModeEnabled)} />
        </button>
      </div>

      {/* TTS Toggle*/}
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-gray-700">
          Text to Speech
        </span>
        <button
          onClick={handleTTSToggle}
          className={toggleButtonClass(TTSenabled)}
        >
          <div className={toggleDotClass(TTSenabled)} />
        </button>
      </div>

      {/* Dyslexia-Friendly Font Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-gray-700">
          Dyslexia Font
        </span>
        <button
          onClick={handleDyslexiaFontToggle}
          className={toggleButtonClass(dyslexiaFontEnabled)}
        >
          <div className={toggleDotClass(dyslexiaFontEnabled)} />
        </button>
      </div>
      {dyslexiaFontEnabled && <DyslexiaFontSettings />}

      {/* Highlighter Toggle*/}
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-gray-700">Highlighter</span>
        <button
          onClick={handleHighlightToggle}
          className={toggleButtonClass(highlightEnabled)}
        >
          <div className={toggleDotClass(highlightEnabled)} />
        </button>
      </div>
      {highlightEnabled && <HighlightSettings />}
    </div>
  );
};

export default Toggles;
