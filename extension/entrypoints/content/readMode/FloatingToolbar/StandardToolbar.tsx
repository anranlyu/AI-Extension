import React from 'react';
import { StandardToolbarProps } from './types';
import ToolbarButton from './ToolbarButton';
import {
  ReadingLevelIcon,
  AdjustLengthIcon,
  TTSIcon,
  TranslateIcon,
  MinimizeIcon,
  MaximizeIcon,
} from './icons';

const StandardToolbar: React.FC<StandardToolbarProps> = ({
  isMinimized,
  setIsMinimized,
  onAdjustLengthClick,
  onReadingLevelClick,
  onTranslateClick,
  onTTSClick,
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
            className="text-white"
          />

          {/* 2. Adjust the Length Button */}
          <ToolbarButton
            icon={<AdjustLengthIcon />}
            label="Adjust the Length"
            onClick={onAdjustLengthClick}
            resetTooltip={resetTooltips}
            className="text-white"
          />
          {/* 3. TTS Button */}
          <ToolbarButton
            icon={<TTSIcon />}
            label="Text to Speech"
            onClick={onTTSClick}
            resetTooltip={resetTooltips}
            className="text-white"
          />
          {/* 4. Translate Button */}
          <ToolbarButton
            icon={<TranslateIcon />}
            label="Translate"
            onClick={onTranslateClick}
            resetTooltip={resetTooltips}
            className="text-white"
          />
        </>
      )}

      {/* Always visible Minimize/Maximize Button */}
      <ToolbarButton
        icon={isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
        onClick={() => setIsMinimized(!isMinimized)}
        resetTooltip={resetTooltips}
        className="text-white"
      />
    </div>
  );
};

export default StandardToolbar;
