import React, { useEffect, useState } from 'react';

const Toggles: React.FC = () => {
  const [simplifyTextEnabled, setSimplifyTextEnabled] = useState(false);
  const [dyslexiaFontEnabled, setDyslexiaFontEnabled] = useState(false);
  const [readModeEnabled, setReadModeEnabled] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [hasLLMConfig, setHasLLMConfig] = useState(false);

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
  const syncFromStorage = () => {
    chrome.storage.local.get(
      [
        'llm',
        'apiKey',
        'simplifyTextEnabled',
        'dyslexiaFontEnabled',
        'readModeEnabled',
        'highlightEnabled',
      ],
      (res) => {
        setHasLLMConfig(!!res.llm && !!res.apiKey);
        setSimplifyTextEnabled(!!res.simplifyTextEnabled);
        setDyslexiaFontEnabled(!!res.dyslexiaFontEnabled);
        setReadModeEnabled(!!res.readModeEnabled);
        setHighlightEnabled(!!res.highlightEnabled);
      }
    );
  };

  useEffect(() => {
    // Initial sync
    syncFromStorage();

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

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md space-y-4 w-xs">
      {/* Simplify Text Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Simplify Text</span>
        <button
          onClick={handleSimplifyTextToggle}
          className={toggleButtonClass(simplifyTextEnabled)}
        >
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
        <button
          onClick={handleReadModeToggle}
          className={toggleButtonClass(readModeEnabled)}
        >
          <div className={toggleDotClass(readModeEnabled)} />
        </button>
      </div>

      {/* Highlighter Toggle*/}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Highlighter</span>
        <button className={toggleButtonClass(highlightEnabled)}>
          <div className={toggleDotClass(highlightEnabled)} />
        </button>
      </div>
    </div>
  );
};

export default Toggles;
