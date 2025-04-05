import React, { useState, useEffect } from 'react';
import { useFloating, shift, offset } from '@floating-ui/react';
import { FloatingToolbarProps } from './types';
import StandardToolbar from './StandardToolbar';
import LengthAdjustmentToolbar from './LengthAdjustmentToolbar';
import { CENTER_POSITION } from './constants';

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  referenceElement,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLengthAdjustMode, setIsLengthAdjustMode] = useState(false);
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
    // When length adjust mode changes, set resetTooltips to true
    if (!isLengthAdjustMode) {
      setResetTooltips(true);
      // Reset the flag after a short delay to prevent continuous resets
      const timer = setTimeout(() => {
        setResetTooltips(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLengthAdjustMode]);

  // Handle length adjustment button click
  const handleAdjustLengthClick = () => {
    setIsLengthAdjustMode(true);
  };

  // Handle close button click in length adjustment mode
  const handleCloseAdjustMode = () => {
    setIsLengthAdjustMode(false);
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
      } ${isLengthAdjustMode ? 'w-auto' : ''}`}
    >
      {isLengthAdjustMode ? (
        <LengthAdjustmentToolbar
          onClose={handleCloseAdjustMode}
          initialOption={CENTER_POSITION} // Default to "keep current length"
        />
      ) : (
        <StandardToolbar
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
          onAdjustLengthClick={handleAdjustLengthClick}
          resetTooltips={resetTooltips}
        />
      )}
    </div>
  );
};

export default FloatingToolbar;
