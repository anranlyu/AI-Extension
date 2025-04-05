import React, { useState } from 'react';
import { LengthAdjustmentToolbarProps } from './types';
import TrackMarker from './TrackMarker';
import ToolbarButton from './ToolbarButton';
import { CloseIcon } from './icons';
import { CENTER_POSITION } from './constants';

const LengthAdjustmentToolbar: React.FC<LengthAdjustmentToolbarProps> = ({
  onClose,
  initialOption = CENTER_POSITION,
}) => {
  const [selectedOption, setSelectedOption] = useState(initialOption);

  const handleSendClick = () => {
    // Only process if not in center position
    if (selectedOption !== CENTER_POSITION) {
      // Here you would implement the actual length adjustment functionality
      console.log(`Adjusting length to option: ${selectedOption}`);
    }
    // Don't close - wait for explicit close from user
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <TrackMarker
          selectedOption={selectedOption}
          onOptionChange={setSelectedOption}
          onSendClick={handleSendClick}
        />
      </div>

      {/* Close button at the bottom of track */}
      <div className="mt-3">
        <ToolbarButton icon={<CloseIcon />} onClick={onClose} />
      </div>
    </div>
  );
};

export default LengthAdjustmentToolbar;
