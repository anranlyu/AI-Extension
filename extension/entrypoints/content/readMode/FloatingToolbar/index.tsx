import React, { useState, useCallback } from 'react';
import { useFloating, offset, flip, shift } from '@floating-ui/react';
import StandardToolbar from './StandardToolbar';
import LengthAdjustment from './LengthAdjustment';
import { FloatingToolbarProps, LENGTH_OPTIONS } from './types';

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  referenceElement,
}) => {
  // Main state for toolbar
  const [isLengthAdjustMode, setIsLengthAdjustMode] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [selectedLengthOption, setSelectedLengthOption] = useState(2); // Default to "keep current length"

  // Floating UI setup
  const { x, y, strategy, refs } = useFloating({
    placement: 'left',
    middleware: [offset(10), flip(), shift()],
    elements: {
      reference: referenceElement ?? undefined,
    },
  });

  // Toggle minimize state
  const handleMinimizeToggle = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  // Handle length adjustment mode
  const handleAdjustLengthClick = useCallback(() => {
    setIsLengthAdjustMode(true);
  }, []);

  // Handle closing length adjustment mode
  const handleCloseAdjustLength = useCallback(() => {
    setIsLengthAdjustMode(false);
    setHasBeenDragged(false);
  }, []);

  // Handle send button click
  const handleSendClick = useCallback(() => {
    // Here you would implement the logic for sending with the selected length
    console.log(
      `Send with length option: ${LENGTH_OPTIONS[selectedLengthOption]}`
    );
    // Note: We don't exit length adjust mode anymore - the user must click X
  }, [selectedLengthOption]);

  return (
    <div
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        zIndex: 1000,
      }}
      className="bg-white rounded-lg shadow-lg p-2"
    >
      {isLengthAdjustMode ? (
        <LengthAdjustment
          selectedLengthOption={selectedLengthOption}
          hasBeenDragged={hasBeenDragged}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          setSelectedLengthOption={setSelectedLengthOption}
          setHasBeenDragged={setHasBeenDragged}
          onSendClick={handleSendClick}
          onCloseClick={handleCloseAdjustLength}
        />
      ) : (
        <StandardToolbar
          isMinimized={isMinimized}
          onAdjustLengthClick={handleAdjustLengthClick}
          onMinimizeToggle={handleMinimizeToggle}
        />
      )}
    </div>
  );
};

export default FloatingToolbar;
