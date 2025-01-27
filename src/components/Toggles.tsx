import React, { useState } from 'react';

const Toggles: React.FC = () => {
  const [simplifyTextEnabled, setSimplifyTextEnabled] =
    useState<boolean>(false);
  const [dyslexiaFontEnabled, setDyslexiaFontEnabled] =
    useState<boolean>(false);

  const handleSimplifyTextToggle = () => {
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
