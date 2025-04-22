import React, { useState, useEffect } from 'react';
import { TranslationToolbarProps } from './types';
import TrackMarker from './TrackMarker';
import ToolbarButton from './ToolbarButton';
import { CloseIcon, LoadingSpinner } from './icons';
import { updateReadModeContent } from '../readMode';
import { TRANSLATION_OPTIONS } from './constants';

const TranslationToolbar: React.FC<TranslationToolbarProps> = ({
  onClose,
  textContent = '',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);

  // Load state on mount
  useEffect(() => {
    // Get current tab ID
    chrome.runtime.sendMessage({ type: 'get_tab_id' }, (response) => {
      if (response && response.tabId) {
        setCurrentTabId(response.tabId);
      }
    });

    // Load translation state
    chrome.storage.local.get(['translationState'], (result) => {
      if (result.translationState) {
        const { preferences, tabStates } = result.translationState;
        setSelectedLanguage(preferences.defaultLanguage);
        setRecentLanguages(preferences.recentLanguages);
        
        // If we have a tab ID, load its specific state
        if (currentTabId && tabStates[currentTabId]) {
          setSelectedLanguage(tabStates[currentTabId].targetLanguage);
        }
      }
    });
  }, [currentTabId]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if ('translationState' in changes) {
        const newState = changes.translationState.newValue;
        if (newState) {
          setSelectedLanguage(newState.preferences.defaultLanguage);
          setRecentLanguages(newState.preferences.recentLanguages);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const handleSendClick = () => {
    if (selectedLanguage && textContent && currentTabId) {
      setIsProcessing(true);
      
      // Update state
      const newRecentLanguages = [
        selectedLanguage,
        ...recentLanguages.filter(lang => lang !== selectedLanguage)
      ].slice(0, 5); // Keep last 5 languages

      // Update both global preferences and tab-specific state
      chrome.storage.local.get(['translationState'], (result) => {
        const currentState = result.translationState || {
          tabStates: {},
          preferences: {
            defaultLanguage: selectedLanguage,
            recentLanguages: [],
            maxRecentLanguages: 5
          }
        };

        const updatedState = {
          ...currentState,
          tabStates: {
            ...currentState.tabStates,
            [currentTabId]: {
              enabled: true,
              targetLanguage: selectedLanguage,
              lastUsedLanguage: selectedLanguage
            }
          },
          preferences: {
            ...currentState.preferences,
            defaultLanguage: selectedLanguage,
            recentLanguages: newRecentLanguages
          }
        };

        chrome.storage.local.set({ translationState: updatedState });
      });

      // Send translation request
      chrome.runtime.sendMessage({
        type: 'readMode_text_translation',
        text: textContent,
        targetLanguage: selectedLanguage,
      });
    }
  };

  // Set up message listener for when content is updated
  useEffect(() => {
    const messageListener = (message: any) => {
      // Listen for the response from the background script
      if (message.type === 'proceesed_read_mode_text' && message.success) {
        // Update content
        updateReadModeContent(message.text);
        // Reset processing state
        setIsProcessing(false);
        // Return to standard toolbar
        setTimeout(() => onClose(), 300);
      }
    };

    // Add message listener
    chrome.runtime.onMessage.addListener(messageListener);

    // Clean up
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [onClose]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Language Selection Panel */}
        <div className="bg-[#16425b] p-4 w-64 relative">
          <div className="flex flex-col items-center">
            {/* Close Button */}
            <div className="absolute -top-4 -left-4 w-10 h-10 flex items-center justify-center bg-[#2f6690] rounded-full hover:bg-[#81c3d7] transition-colors">
              <ToolbarButton 
                icon={<CloseIcon />} 
                onClick={onClose}
                className="w-10 h-10 text-white flex items-center justify-center"
              />
            </div>
            
            {/* Language Dropdown */}
            <div className="mt-4 mb-4 w-full">
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-2 border border-white/20 rounded-lg focus:ring-0 focus:border-white/40 bg-[#2f6690] text-white text-center"
              >
                <option value="" className="text-center">Select target Language</option>
                {TRANSLATION_OPTIONS.map((language) => (
                  <option key={language} value={language} className="text-center">
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
                  : 'bg-white text-white/50 cursor-not-allowed'
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