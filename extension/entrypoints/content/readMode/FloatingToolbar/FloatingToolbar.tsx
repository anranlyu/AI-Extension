import React, { useState, useEffect } from 'react';
import { useFloating, shift, offset } from '@floating-ui/react';
import { FloatingToolbarProps } from './types';
import StandardToolbar from './StandardToolbar';
import LengthAdjustmentToolbar from './LengthAdjustmentToolbar';
import ReadingLevelAdjustmentToolbar from './ReadingLevelAdjustmentToolbar';
import TranslationToolbar from './TranslationToolbar';
import { CENTER_POSITION, CURRENT_LEVEL_POSITION } from './constants';
import TTSFloatingCard from './ttsFloatingCard';
import { LoadingSpinner } from './icons';
import { updateReadModeContent } from '../readMode'; // Import the update function

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  referenceElement,
  textContent = '',
  readingLevel = 0,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLengthAdjustMode, setIsLengthAdjustMode] = useState(false);
  const [isReadingLevelMode, setIsReadingLevelMode] = useState(false);
  const [isTranslationMode, setIsTranslationMode] = useState(false);
  const [resetTooltips, setResetTooltips] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-end',
    middleware: [
      offset({ mainAxis: 16, crossAxis: 16 }),
      shift({ padding: 8 }),
    ],
    elements: {
      reference: referenceElement ?? undefined,
    },
  });

  // Track mode changes to reset tooltips
  useEffect(() => {
    // When toolbar mode changes, set resetTooltips to true
    if (!isLengthAdjustMode && !isReadingLevelMode && !isTranslationMode) {
      setResetTooltips(true);
      // Reset the flag after a short delay to prevent continuous resets
      const timer = setTimeout(() => {
        setResetTooltips(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLengthAdjustMode, isReadingLevelMode, isTranslationMode]);

  // Listen for TTS state changes from content script
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'tts_state_change') {
        setIsTTSActive(message.isActive);
      }
    };

    // Add listener
    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Handle length adjustment button click
  const handleAdjustLengthClick = () => {
    setIsLengthAdjustMode(true);
    setIsReadingLevelMode(false);
    setIsTranslationMode(false);
    setIsTTSActive(false);
  };

  // Handle reading level button click
  const handleReadingLevelClick = () => {
    setIsReadingLevelMode(true);
    setIsLengthAdjustMode(false);
    setIsTranslationMode(false);
    setIsTTSActive(false);
  };

  // Handle translate button click
  const handleTranslateClick = () => {
    setIsTranslationMode(!isTranslationMode);
    setIsLengthAdjustMode(false);
    setIsReadingLevelMode(false);
    setIsTTSActive(false);
  };

  // Handle TTS button click
  const handleTTSClick = () => {
    setIsTTSActive(!isTTSActive);
    setIsTranslationMode(false);
    setIsReadingLevelMode(false);
    setIsLengthAdjustMode(false);
  };

  // Handle close button click in adjustment modes
  const handleCloseAdjustMode = () => {
    setIsLengthAdjustMode(false);
    setIsReadingLevelMode(false);
    setIsTranslationMode(false);
    setIsTTSActive(false);
    setIsTranslating(false);
  };

  // Handlers for translation start/finish
  const handleStartTranslation = () => setIsTranslating(true);
  const handleFinishTranslation = () => setIsTranslating(false);

  // NEW: Effect to listen for translation results
  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === 'proceesed_read_mode_text') {
        if (message.success && typeof message.text === 'string') {
          // Update content
          updateReadModeContent(message.text);
          // Finish loading state
          handleFinishTranslation();
          // Close the translation UI
          handleCloseAdjustMode();
        } else {
          console.error(
            '[FloatingToolbar] Translation failed or text missing:',
            message.error || 'No text received'
          );
          // Finish loading state even on failure
          handleFinishTranslation();
          // Close the translation UI
          handleCloseAdjustMode();
        }
      }
    };

    // Add listener only when a translation is in progress
    if (isTranslating) {
      chrome.runtime.onMessage.addListener(messageListener);
    } else {
      chrome.runtime.onMessage.removeListener(messageListener); // Ensure cleanup if isTranslating becomes false
    }

    // Cleanup function
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [isTranslating]); // Rerun effect when isTranslating changes

  // Render Loading Spinner if translating
  if (isTranslating) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '23px',
          right: '23px',
          zIndex: 2147483647,
          background: 'rgba(47, 102, 144, 0.8)',
          borderRadius: '50%',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {isTranslationMode && (
        <div
          style={{
            position: 'fixed',
            bottom: '23px',
            right: 'calc(23px + 4.32rem)',
            zIndex: 2147483646,
          }}
        >
          <TranslationToolbar
            onClose={handleCloseAdjustMode}
            textContent={textContent}
            onStartTranslation={handleStartTranslation}
          />
        </div>
      )}
      {isTTSActive && (
        <div
          style={{
            position: 'fixed',
            bottom: '138px',
            right: 'calc(23px + 4.32rem)',
            zIndex: 2147483646,
          }}
        >
          <TTSFloatingCard textContent={textContent} />
        </div>
      )}
      <div
        ref={refs.setFloating}
        style={{
          position: 'fixed',
          bottom: '23px',
          right: '23px',
          zIndex: 2147483646,
          transition: 'all 0.3s ease',
          transform: 'scale(1.1)',
          transformOrigin: 'bottom right',
        }}
        className={`bg-[#2F6690] rounded-full shadow-lg py-2 flex flex-col items-center ${
          isMinimized ? 'w-14' : ''
        } ${
          isLengthAdjustMode || isReadingLevelMode || isTranslationMode
            ? 'w-auto'
            : ''
        }`}
      >
        {isLengthAdjustMode ? (
          <LengthAdjustmentToolbar
            onClose={handleCloseAdjustMode}
            initialOption={CENTER_POSITION}
            textContent={textContent}
          />
        ) : isReadingLevelMode ? (
          <ReadingLevelAdjustmentToolbar
            onClose={handleCloseAdjustMode}
            initialOption={CURRENT_LEVEL_POSITION}
            textContent={textContent}
            readingLevel={readingLevel}
          />
        ) : (
          <StandardToolbar
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            onAdjustLengthClick={handleAdjustLengthClick}
            onReadingLevelClick={handleReadingLevelClick}
            onTranslateClick={handleTranslateClick}
            onTTSClick={handleTTSClick}
            resetTooltips={resetTooltips}
          />
        )}
      </div>
    </>
  );
};

export default FloatingToolbar;
