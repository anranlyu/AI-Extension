import React, { useEffect, useState } from 'react';

const Toggles: React.FC = () => {
  const [simplifyTextEnabled, setSimplifyTextEnabled] =
    useState<boolean>(false);
  const [dyslexiaFontEnabled, setDyslexiaFontEnabled] =
    useState<boolean>(false);

  const [hasLLMConfig, setHasLLMConfig] = useState(false);
  useEffect(() => {
    const updateLLMConfig = () => {
      chrome.storage.local.get(['llm', 'apiKey'], (result) => {
        setHasLLMConfig(!!result.llm && !!result.apiKey);
      });
    };

    // Initial check
    updateLLMConfig();

    // Listen for storage changes
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if ('llm' in changes || 'apiKey' in changes) {
        updateLLMConfig();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    chrome.storage.local.get(
      ['simplifyTextEnabled', 'dyslexiaFontEnabled'],
      (result) => {
        setSimplifyTextEnabled(result.simplifyTextEnabled || false);
        setDyslexiaFontEnabled(result.dyslexiaFontEnabled || false);
      }
    );
  }, []);

  const handleSimplifyTextToggle = () => {
    if (!hasLLMConfig) {
      alert('API Key and LLM must be configured before enabling this feature.');
      return;
    }
    const newState = !simplifyTextEnabled;
    setSimplifyTextEnabled(newState);
    // Save the state to local storage
    chrome.storage.local.set({ simplifyTextEnabled: newState }, () => {
      console.log('Simplify text function state saved:', newState);
    });
  };

  const handleDyslexiaFontToggle = () => {
    const newState = !dyslexiaFontEnabled;
    setDyslexiaFontEnabled(newState);
    // Save the state to local storage
    chrome.storage.local.set({ dyslexiaFontEnabled: newState }, () => {
      console.log('Dyslexia-friendly font function state saved:', newState);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'update_dyslexia_font',
            dyslexiaFontEnabled: newState,
          });
        }
      });
    });
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md space-y-4 w-xs">
      {/* Simplify Text Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Simplify Text</span>
        <button
          onClick={handleSimplifyTextToggle}
          className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
            simplifyTextEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
              simplifyTextEnabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          ></div>
        </button>
      </div>

      {/* Dyslexia-Friendly Font Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Dyslexia Font</span>
        <button
          onClick={handleDyslexiaFontToggle}
          className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
            dyslexiaFontEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
              dyslexiaFontEnabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          ></div>
        </button>
      </div>
    </div>
  );
};

export default Toggles;
