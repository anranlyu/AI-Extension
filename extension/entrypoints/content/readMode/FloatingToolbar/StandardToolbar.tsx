import React from 'react';
import { StandardToolbarProps } from './types';
import ToolbarButton from './ToolbarButton';
import {
  ReadingLevelIcon,
  AdjustLengthIcon,
  TranslateIcon,
  MinimizeIcon,
  MaximizeIcon,
} from './icons';

const StandardToolbar: React.FC<StandardToolbarProps> = ({
  isMinimized,
  setIsMinimized,
  onAdjustLengthClick,
  onReadingLevelClick,
  resetTooltips = false,
}) => {
  return (
    <div className="flex flex-col gap-3 px-2">
      {/* Conditional rendering based on isMinimized state */}
      {!isMinimized && (
        <>
          {/* 1. Reading Level Button */}
          <ToolbarButton
            icon={<ReadingLevelIcon />}
            label="Reading Level"
            onClick={onReadingLevelClick}
            resetTooltip={resetTooltips}
          />

          {/* 2. Adjust the Length Button */}
          <ToolbarButton
            icon={<AdjustLengthIcon />}
            label="Adjust the Length"
            onClick={onAdjustLengthClick}
            resetTooltip={resetTooltips}
          />

          {/* 3. Translate Button */}
          <ToolbarButton
            icon={<TranslateIcon />}
            label="Translate"
            resetTooltip={resetTooltips}
          />
        </>
      )}

      {/* Always visible Minimize/Maximize Button */}
      <ToolbarButton
        icon={isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
        onClick={() => setIsMinimized(!isMinimized)}
        resetTooltip={resetTooltips}
      />
    </div>
  );
};

export default StandardToolbar;
