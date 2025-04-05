import React, { useState } from 'react';

interface MainToolbarProps {
  onAdjustLengthClick: () => void;
  onMinimizeToggle: () => void;
}

const MainToolbar: React.FC<MainToolbarProps> = ({
  onAdjustLengthClick,
  onMinimizeToggle,
}) => {
  // State for tooltips
  const [showReadingLevelTooltip, setShowReadingLevelTooltip] = useState(false);
  const [showAdjustLengthTooltip, setShowAdjustLengthTooltip] = useState(false);
  const [showTranslateTooltip, setShowTranslateTooltip] = useState(false);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Reading Level Button */}
      <div className="relative">
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
          onMouseEnter={() => setShowReadingLevelTooltip(true)}
          onMouseLeave={() => setShowReadingLevelTooltip(false)}
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        {showReadingLevelTooltip && (
          <div className="absolute right-full mr-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white">
            Adjust Reading Level
          </div>
        )}
      </div>

      {/* Adjust Length Button */}
      <div className="relative">
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
          onClick={onAdjustLengthClick}
          onMouseEnter={() => setShowAdjustLengthTooltip(true)}
          onMouseLeave={() => setShowAdjustLengthTooltip(false)}
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 7.5L21 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M13 11.9983L21 12.0006"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M13 16.5H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6 7V17"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.5 7.5L6 5L8.5 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.5 16.5L6 19L8.5 16.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {showAdjustLengthTooltip && (
          <div className="absolute right-full mr-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white">
            Adjust Length
          </div>
        )}
      </div>

      {/* Translate Button */}
      <div className="relative">
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
          onMouseEnter={() => setShowTranslateTooltip(true)}
          onMouseLeave={() => setShowTranslateTooltip(false)}
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
        </button>
        {showTranslateTooltip && (
          <div className="absolute right-full mr-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white">
            Translate
          </div>
        )}
      </div>

      {/* Minimize button */}
      <button
        onClick={onMinimizeToggle}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </div>
  );
};

export default MainToolbar;
