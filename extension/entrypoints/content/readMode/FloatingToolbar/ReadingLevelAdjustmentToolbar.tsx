import React, { useState, useEffect } from 'react';
import { ReadingLevelAdjustmentToolbarProps } from './types';
import TrackMarker from './TrackMarker';
import ToolbarButton from './ToolbarButton';
import { CloseIcon, LoadingSpinner } from './icons';
import { CURRENT_LEVEL_POSITION, READING_LEVEL_OPTIONS } from './constants';
import { updateReadModeContent } from '../readMode';

const ReadingLevelAdjustmentToolbar: React.FC<
  ReadingLevelAdjustmentToolbarProps
> = ({
  onClose,
  initialOption = CURRENT_LEVEL_POSITION,
  textContent = '',
  readingLevel = 0,
}) => {
  const [selectedOption, setSelectedOption] = useState(initialOption);
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine which options to use based on readingLevel
  const options = READING_LEVEL_OPTIONS[readingLevel];

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
  }, [onClose, selectedOption]);

  const handleSendClick = () => {
    // Only process if not in center position and we have text content
    if (selectedOption !== CURRENT_LEVEL_POSITION && textContent) {
      setIsProcessing(true);
      // Send message to background script
      chrome.runtime.sendMessage({
        type: 'readMode_text_reading_level',
        text: textContent,
        selectedLevel: selectedOption + readingLevel,
      });
    }
  };

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
        <TrackMarker
          selectedOption={selectedOption}
          onOptionChange={setSelectedOption}
          onSendClick={handleSendClick}
          options={options}
        />
      </div>

      {/* Close button at the bottom of track */}
      <div className="mt-3">
        <ToolbarButton icon={<CloseIcon />} onClick={onClose} />
      </div>
    </div>
  );
};

export default ReadingLevelAdjustmentToolbar;
