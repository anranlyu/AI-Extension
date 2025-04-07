import React, { useState, useEffect } from 'react';
import { useFloating, shift, offset } from '@floating-ui/react';
import { FloatingToolbarProps } from './types';
import StandardToolbar from './StandardToolbar';
import LengthAdjustmentToolbar from './LengthAdjustmentToolbar';
import ReadingLevelAdjustmentToolbar from './ReadingLevelAdjustmentToolbar';
import { CENTER_POSITION, CURRENT_LEVEL_POSITION } from './constants';

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  referenceElement,
  textContent = '',
  readingLevel = 0,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLengthAdjustMode, setIsLengthAdjustMode] = useState(false);
  const [isReadingLevelMode, setIsReadingLevelMode] = useState(false);
  const [resetTooltips, setResetTooltips] = useState(false);

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
    if (!isLengthAdjustMode && !isReadingLevelMode) {
      setResetTooltips(true);
      // Reset the flag after a short delay to prevent continuous resets
      const timer = setTimeout(() => {
        setResetTooltips(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLengthAdjustMode, isReadingLevelMode]);

  // Handle length adjustment button click
  const handleAdjustLengthClick = () => {
    setIsLengthAdjustMode(true);
    setIsReadingLevelMode(false);
  };

  // Handle reading level button click
  const handleReadingLevelClick = () => {
    setIsReadingLevelMode(true);
    setIsLengthAdjustMode(false);
  };

  // Handle close button click in adjustment modes
  const handleCloseAdjustMode = () => {
    setIsLengthAdjustMode(false);
    setIsReadingLevelMode(false);
  };

  return (
    <div
      ref={refs.setFloating}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 999999,
        transition: 'all 0.3s ease',
      }}
      className={`bg-white rounded-full shadow-lg py-4 flex flex-col items-center ${
        isMinimized ? 'w-14' : ''
      } ${isLengthAdjustMode || isReadingLevelMode ? 'w-auto' : ''}`}
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
          resetTooltips={resetTooltips}
        />
      )}
    </div>
  );
};

export default FloatingToolbar;
