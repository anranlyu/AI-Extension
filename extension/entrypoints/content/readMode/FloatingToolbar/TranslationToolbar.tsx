// In TranslationToolbar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { TranslationToolbarProps } from './types';
import ToolbarButton from './ToolbarButton';
import { CloseIcon, LoadingSpinner } from './icons';
import { TRANSLATION_OPTIONS } from './constants';
import { showFloatingUI } from './contentFloating';

const TranslationToolbar: React.FC<TranslationToolbarProps> = ({
  onClose,
  textContent = '',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [translationTimeout, setTranslationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get selected text when component mounts
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      console.log('Selection changed:', selection?.toString());
      
      if (selection && selection.toString().trim()) {
        const text = selection.toString().trim();
        console.log('Setting selected text:', text);
        setSelectedText(text);
        setError(null); // Clear any previous errors when new text is selected
      } else {
        console.log('No valid selection');
        setSelectedText('');
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('mouseup', handleSelection);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  // Set up message listener for when content is updated
  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === 'processed_read_mode_text') {
        if (message.success) {
          // Show the translation in a floating window
          showFloatingUI(
            <div className="flex flex-col gap-4 p-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Original Text</h3>
                <p className="text-gray-800">{selectedText}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Translation</h3>
                <p className="text-gray-800">{message.text}</p>
              </div>
            </div>,
            {
              draggable: true,
              preserveReference: true
            }
          );
          setError(null);
        } else {
          setError(message.error || 'Translation failed. Please try again.');
        }
        setIsProcessing(false);
        if (translationTimeout) {
          clearTimeout(translationTimeout);
          setTranslationTimeout(null);
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [selectedText, translationTimeout]);

  // Load state on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'get_tab_id' }, (response) => {
      if (response && response.tabId) {
        setCurrentTabId(response.tabId);
      }
    });

    chrome.storage.local.get(['translationState'], (result) => {
      if (result.translationState) {
        const { preferences, tabStates } = result.translationState;
        setSelectedLanguage(preferences.defaultLanguage);
        
        if (currentTabId && tabStates[currentTabId]) {
          setSelectedLanguage(tabStates[currentTabId].targetLanguage);
        }
      }
    });
  }, [currentTabId]);

  const handleSendClick = useCallback(() => {
    if (selectedLanguage && selectedText && currentTabId) {
      console.log('Sending translation request:', { selectedText, selectedLanguage });
      setIsProcessing(true);
      setError(null);
      
      // Set a timeout for the translation request
      const timeout = setTimeout(() => {
        setIsProcessing(false);
        setError('Translation request timed out. Please try again.');
      }, 30000); // 30 second timeout
      
      setTranslationTimeout(timeout);
      
      chrome.runtime.sendMessage({
        type: 'readMode_text_translation',
        text: selectedText,
        targetLanguage: selectedLanguage,
      });
    } else {
      console.log('Cannot send translation request:', { selectedText, selectedLanguage, currentTabId });
      setError('Please select text and a target language.');
    }
  }, [selectedLanguage, selectedText, currentTabId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (translationTimeout) {
        clearTimeout(translationTimeout);
      }
    };
  }, [translationTimeout]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-sm text-gray-600">Translating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 w-64">
        {/* Language Dropdown */}
        <div className="mb-4">
          <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Target Language
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setError(null);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#81C3D7] focus:border-[#81C3D7]"
          >
            <option value="">Select a language</option>
            {TRANSLATION_OPTIONS.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Text Preview */}
        {selectedText && (
          <div className="mb-4 p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Selected Text:</p>
            <p className="text-sm text-gray-800 mt-1">{selectedText}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 rounded">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Translate Button */}
        <button
          onClick={handleSendClick}
          disabled={!selectedText || !selectedLanguage}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            selectedText && selectedLanguage
              ? 'bg-[#81C3D7] text-white hover:bg-[#6BA8C0]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Translate
        </button>
      </div>
      
      <ToolbarButton icon={<CloseIcon />} onClick={onClose} />
    </div>
  );
};

export default TranslationToolbar;