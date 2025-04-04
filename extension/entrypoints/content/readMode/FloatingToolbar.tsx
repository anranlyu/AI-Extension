import React, { useState } from 'react';
import { useFloating, shift, offset } from '@floating-ui/react';

interface FloatingToolbarProps {
  referenceElement: HTMLElement | null;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  referenceElement,
}) => {
  const [showReadingLevelTooltip, setShowReadingLevelTooltip] = useState(false);
  const [showAdjustLengthTooltip, setShowAdjustLengthTooltip] = useState(false);
  const [showTranslateTooltip, setShowTranslateTooltip] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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
      }`}
    >
      <div className="flex flex-col gap-3 px-2">
        {/* Conditional rendering based on isMinimized state */}
        {!isMinimized && (
          <>
            {/* 1. Reading Level Button */}
            <div className="relative">
              {showReadingLevelTooltip && (
                <div className="absolute right-full mr-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white">
                  Reading Level
                </div>
              )}
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
              </button>
            </div>

            {/* 2. Adjust the Length Button */}
            <div className="relative">
              {showAdjustLengthTooltip && (
                <div className="absolute right-full mr-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white">
                  Adjust the Length
                </div>
              )}
              <button
                className="p-2 hover:bg-gray-100 rounded-full"
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
                  ></path>
                  <path
                    d="M13 11.9983L21 12.0006"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  ></path>
                  <path
                    d="M13 16.5H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  ></path>
                  <path
                    d="M6 7V17"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M3.5 7.5L6 5L8.5 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M3.5 16.5L6 19L8.5 16.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </button>
            </div>

            {/* 3. Translate Button */}
            <div className="relative">
              {showTranslateTooltip && (
                <div className="absolute right-full mr-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white">
                  Translate
                </div>
              )}
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
                  ></path>
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Always visible Minimize/Maximize Button (moved to bottom) */}
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMinimized ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              ></path>
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 12H4"
              ></path>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FloatingToolbar;
