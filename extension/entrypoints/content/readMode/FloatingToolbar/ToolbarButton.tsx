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
        <div className="absolute right-full mr-3 whitespace-nowrap rounded-md bg-[#3A7CA5] px-3 py-1.5 text-base text-white shadow-lg">
          {label}
        </div>
      )}
      <button
        className={`p-2.5 hover:bg-[gray-100] rounded-full transition-colors duration-200 ${
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
