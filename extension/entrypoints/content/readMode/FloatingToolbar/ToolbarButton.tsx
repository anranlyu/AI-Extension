import React, { useState, useEffect } from 'react';
import { ToolbarButtonProps } from './types';

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  showTooltip = false,
  isActive = false,
  className = '',
  resetTooltip = false,
}) => {
  const [showLabel, setShowLabel] = useState(showTooltip);

  // Reset tooltip visibility when resetTooltip prop changes
  useEffect(() => {
    if (resetTooltip) {
      setShowLabel(false);
    }
  }, [resetTooltip]);

  return (
    <div className="relative">
      {showLabel && label && (
        <div className="absolute right-full mr-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white">
          {label}
        </div>
      )}
      <button
        className={`p-2 hover:bg-gray-100 rounded-full ${
          isActive ? 'bg-gray-100' : ''
        } ${className}`}
        onClick={onClick}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
      >
        {icon}
      </button>
    </div>
  );
};

export default ToolbarButton;
