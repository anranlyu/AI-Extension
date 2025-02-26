import React, { useEffect, useState } from 'react';
import { StorageValues } from '../service/type';
import { HighlightSettings } from './HighlightSettings';

const Toggles: React.FC = () => {
  const [simplifyTextEnabled, setSimplifyTextEnabled] = useState(false);
  const [dyslexiaFontEnabled, setDyslexiaFontEnabled] = useState(false);
  const [readModeEnabled, setReadModeEnabled] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [hasLLMConfig, setHasLLMConfig] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(''); 

  // Utility functions for applying Tailwind classes
  const toggleButtonClass = (enabled: boolean) =>
    `relative w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
      enabled ? 'bg-blue-600' : 'bg-gray-300'
    }`;
  const toggleDotClass = (enabled: boolean) =>
    `absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
      enabled ? 'translate-x-6' : 'translate-x-0'
    }`;

  // Helper to read from Chrome storage once, then sync component state
  const syncFromStorage = async () => {
    const res = (await chrome.storage.local.get([
      'llm',
      'apiKey',
      'simplifyTextEnabled',
      'dyslexiaFontEnabled',
      'readModeEnabled',
      'translateEnabled',
      'targetLanguage',
      'highlightEnabled',
    ])) as StorageValues;
      
    setHasLLMConfig(!!res.llm && !!res.apiKey);
    setSimplifyTextEnabled(!!res.simplifyTextEnabled);
    setDyslexiaFontEnabled(!!res.dyslexiaFontEnabled);
    setReadModeEnabled(!!res.readModeEnabled);
    setTranslateEnabled(!!res.translateEnabled);
    setTargetLanguage(res.targetLanguage || ''); 
    setHighlightEnabled(!!res.highlightEnabled);

  };

  useEffect(() => {
    const initialize = async () => {
      await syncFromStorage();
    };
    // Initial sync
    initialize();


    // Listen for any changes in Chrome storage
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if ('llm' in changes || 'apiKey' in changes) {
        // If llm or apiKey changed, reevaluate hasLLMConfig
        const newLLM = changes.llm?.newValue;
        const newApiKey = changes.apiKey?.newValue;
        setHasLLMConfig(!!newLLM && !!newApiKey);
      }
      if ('simplifyTextEnabled' in changes) {
        setSimplifyTextEnabled(changes.simplifyTextEnabled.newValue);
      }
      if ('dyslexiaFontEnabled' in changes) {
        setDyslexiaFontEnabled(changes.dyslexiaFontEnabled.newValue);
      }
      if ('readModeEnabled' in changes) {
        setReadModeEnabled(changes.readModeEnabled.newValue);
      }
      if ('translateEnabled' in changes) {
        setTranslateEnabled(changes.translateEnabled.newValue);
      }
      if ('targetLanguage' in changes) {
        setTargetLanguage(changes.targetLanguage.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      // Clean up the listener on unmount
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // --- Handlers ---
  const handleReadModeToggle = () => {
    const newState = !readModeEnabled;
    chrome.storage.local.set({ readModeEnabled: newState });
  };

  const handleSimplifyTextToggle = () => {
    if (!hasLLMConfig) {
      alert('API Key and LLM must be configured before enabling this feature.');
      return;
    }
    const newState = !simplifyTextEnabled;
    setSimplifyTextEnabled(newState);
    chrome.storage.local.set({ simplifyTextEnabled: newState });
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

  const handleTranslateToggle = () => {
    const newState = !translateEnabled;
    setTranslateEnabled(newState);
    chrome.storage.local.set({ translateEnabled: newState });
    chrome.runtime.sendMessage({ type: "update_translate_mode", translateEnabled: newState });
  };

  const handleTargetLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const targetLanguage = event.target.value;
    setTargetLanguage(targetLanguage);
    chrome.storage.local.set({ targetLanguage: targetLanguage });
  };


  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md space-y-4 w-xs">
      {/* Simplify Text Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Simplify Text</span>
        <button onClick={handleSimplifyTextToggle} className={toggleButtonClass(simplifyTextEnabled)}>
          <div className={toggleDotClass(simplifyTextEnabled)} />
        </button>
      </div>

      {/* Dyslexia-Friendly Font Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Font Switch</span>
        <button
          onClick={handleDyslexiaFontToggle}
          className={toggleButtonClass(dyslexiaFontEnabled)}
        >
          <div className={toggleDotClass(dyslexiaFontEnabled)} />
        </button>
      </div>

      {/* Read Mode Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Read Mode</span>
        <button onClick={handleReadModeToggle} className={toggleButtonClass(readModeEnabled)}>
          <div className={toggleDotClass(readModeEnabled)} />
        </button>
      </div>

      {/* Highlighter Toggle*/}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Highlighter</span>
        <button
          onClick={handleHighlightToggle}
          className={toggleButtonClass(highlightEnabled)}
        >
          <div className={toggleDotClass(highlightEnabled)} />
        </button>
      </div>
      {highlightEnabled && <HighlightSettings />}

      {/* Translate Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Translate</span>
        <button onClick={handleTranslateToggle} className={toggleButtonClass(translateEnabled)}>
          <div className={toggleDotClass(translateEnabled)} />
        </button>
      </div>

      {/* Show dropdown for target language only if translation is enabled */}
      {translateEnabled && (
        <div className="mt-4">
          <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700">
            Target Language
          </label>
          <select
            id="targetLanguage"
            value={targetLanguage}
            onChange={handleTargetLanguageChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="en">English</option>
            <option value="zh">Chinese</option>
            <option value="ko">Korean</option>
            <option value="ja">Japanese</option>
            <option value="ar">Arabic</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="vi">Vietnamese</option>
            <option value="th">Thai</option>
            <option value="ru">Russian</option>
            {/* Add more options as needed */}
          </select>
        </div>
      )}
    </div>
  );
};

export default Toggles;
