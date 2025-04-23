import React, { useState } from 'react';
import { TranslationToolbarProps } from './types';
import { TRANSLATION_OPTIONS } from './constants';

const TranslationToolbar: React.FC<TranslationToolbarProps> = ({
  textContent = '',
  onStartTranslation,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const handleSendClick = () => {
    if (selectedLanguage && textContent) {
      // Call parent handler to start processing
      onStartTranslation();

      // Send translation request
      chrome.runtime.sendMessage({
        type: 'readMode_text_translation',
        text: textContent,
        targetLanguage: selectedLanguage,
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Language Selection Panel */}
        <div className="bg-[#D9DCD6] p-4 w-64 relative rounded-2xl shadow-xl">
          <div className="flex flex-col items-center">
            {/* Language Dropdown */}
            <div className="mt-4 mb-4 w-full">
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-2 border border-white/20 rounded-lg focus:ring-0 focus:border-white/40 bg-[#2f6690] text-white text-center"
              >
                <option value="" className="text-center">
                  Select target Language
                </option>
                {TRANSLATION_OPTIONS.map((language) => (
                  <option
                    key={language}
                    value={language}
                    className="text-center rounded-2xl"
                  >
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* Translate Button */}
            <button
              onClick={handleSendClick}
              disabled={!selectedLanguage}
              className={`w-full py-2 px-4 rounded-lg transition-colors text-center ${
                selectedLanguage
                  ? 'bg-[#2f6690] text-white hover:bg-[#81c3d7]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }`}
            >
              Translate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationToolbar;
