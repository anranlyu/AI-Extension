import React, { useState, useEffect } from 'react';
import { useFloating, shift, offset } from '@floating-ui/react';
import { FloatingToolbarProps } from './types';
import StandardToolbar from './StandardToolbar';
import LengthAdjustmentToolbar from './LengthAdjustmentToolbar';
import ReadingLevelAdjustmentToolbar from './ReadingLevelAdjustmentToolbar';
import TranslationToolbar from './TranslationToolbar';
import { CENTER_POSITION, CURRENT_LEVEL_POSITION } from './constants';

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
  };

  // Handle reading level button click
  const handleReadingLevelClick = () => {
    setIsReadingLevelMode(true);
    setIsLengthAdjustMode(false);
    setIsTranslationMode(false);
  };

  // Handle translate button click
  const handleTranslateClick = () => {
    setIsTranslationMode(true);
    setIsLengthAdjustMode(false);
    setIsReadingLevelMode(false);
  };

  // Handle TTS button click
  const handleTTSClick = () => {
    const newTTSState = !isTTSActive;
    setIsTTSActive(newTTSState);

    // Send message to toggle TTS in the content script
    chrome.runtime.sendMessage({
      type: 'toggle_tts_in_read_mode',
      enabled: newTTSState,
    });
  };

  // Handle close button click in adjustment modes
  const handleCloseAdjustMode = () => {
    setIsLengthAdjustMode(false);
    setIsReadingLevelMode(false);
    setIsTranslationMode(false);
  };

  return (
    <>
      {isTranslationMode && (
        <div
          style={{
            position: 'fixed',
            bottom: '23px',
            right: 'calc(23px + 4.32rem)', // Position it right next to the slider bar
            zIndex: 2147483646,
          }}
        >
          <TranslationToolbar
            onClose={handleCloseAdjustMode}
            textContent={textContent}
          />
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
        } ${isLengthAdjustMode || isReadingLevelMode || isTranslationMode ? 'w-auto' : ''}`}
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
            isTTSActive={isTTSActive}
            isTranslationMode={isTranslationMode}
          />
        )}
      </div>
    </>
  );
};

export default FloatingToolbar;
