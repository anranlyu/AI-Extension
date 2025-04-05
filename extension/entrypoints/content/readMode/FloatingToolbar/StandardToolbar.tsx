import React from 'react';
import MainToolbar from './MainToolbar';
import MinimizedToolbar from './MinimizedToolbar';

interface StandardToolbarProps {
  isMinimized: boolean;
  onAdjustLengthClick: () => void;
  onMinimizeToggle: () => void;
}

const StandardToolbar: React.FC<StandardToolbarProps> = ({
  isMinimized,
  onAdjustLengthClick,
  onMinimizeToggle,
}) => {
  return isMinimized ? (
    <MinimizedToolbar onMinimizeToggle={onMinimizeToggle} />
  ) : (
    <MainToolbar
      onAdjustLengthClick={onAdjustLengthClick}
      onMinimizeToggle={onMinimizeToggle}
    />
  );
};

export default StandardToolbar;
