import React, { useState, useRef, useEffect } from 'react';
import { useFloating, shift, offset } from '@floating-ui/react';

interface FloatingToolbarProps {
  referenceElement: HTMLElement | null;
}

// Length adjustment options
const LENGTH_OPTIONS = [
  'longest',
  'longer',
  'keep current length',
  'shorter',
  'shortest',
];

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  referenceElement,
}) => {
  const [showReadingLevelTooltip, setShowReadingLevelTooltip] = useState(false);
  const [showAdjustLengthTooltip, setShowAdjustLengthTooltip] = useState(false);
  const [showTranslateTooltip, setShowTranslateTooltip] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Length adjustment mode states
  const [isLengthAdjustMode, setIsLengthAdjustMode] = useState(false);
  const [selectedLengthOption, setSelectedLengthOption] = useState(2); // Default to "keep current length"
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  const dragHandleRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && trackRef.current && dragHandleRef.current) {
        const trackRect = trackRef.current.getBoundingClientRect();
        const trackHeight = trackRect.height;
        const trackTop = trackRect.top;

        // Calculate relative position along the track
        let relativeY = (e.clientY - trackTop) / trackHeight;

        // Constrain to track bounds (0 to 1)
        relativeY = Math.max(0, Math.min(1, relativeY));

        // Convert to one of the 5 options (0 to 4)
        const optionIndex = Math.floor(relativeY * 5);
        setSelectedLengthOption(Math.min(4, optionIndex));

        // Mark as dragged for showing send arrow later
        if (!hasBeenDragged) {
          setHasBeenDragged(true);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, hasBeenDragged]);

  // Handle length adjustment button click
  const handleAdjustLengthClick = () => {
    setIsLengthAdjustMode(true);
    setHasBeenDragged(false);
    setSelectedLengthOption(2); // Reset to "keep current length"
  };

  // Handle close button click
  const handleCloseAdjustMode = () => {
    setIsLengthAdjustMode(false);
    setHasBeenDragged(false);
  };

  // Handle send button click
  const handleSendClick = () => {
    // Here you would implement the actual length adjustment functionality
    console.log(`Adjusting length to: ${LENGTH_OPTIONS[selectedLengthOption]}`);

    // Do not exit length adjustment mode
    // The user needs to click the X button to exit
  };

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
      } ${isLengthAdjustMode ? 'w-auto' : ''}`}
    >
      {isLengthAdjustMode ? (
        // Length adjustment mode UI
        <div className="flex items-center">
          {/* Text label that shows current selection - always visible */}
          <div className="absolute right-full mr-2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white">
            {LENGTH_OPTIONS[selectedLengthOption]}
          </div>

          {/* Vertical track with draggable handle */}
          <div className="flex flex-col items-center">
            <div
              ref={trackRef}
              className="bg-gray-200 w-10 h-72 rounded-lg relative my-2 flex flex-col items-center"
              style={{ padding: '18px 0' }}
            >
              {/* Track markers */}
              <div className="absolute inset-0 flex flex-col justify-between py-6">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="flex justify-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        idx === selectedLengthOption
                          ? 'bg-gray-800'
                          : 'bg-gray-400'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Draggable handle positioned absolutely on top of track */}
              <div
                ref={dragHandleRef}
                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{
                  top: `calc(${(selectedLengthOption / 4) * 100}% * 0.8 + 10%)`,
                }}
                onMouseDown={handleMouseDown}
              >
                {hasBeenDragged ? (
                  // Send arrow button after dragging
                  <button
                    onClick={handleSendClick}
                    className="p-2 bg-black text-white rounded-full hover:bg-gray-800"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                ) : (
                  // Regular adjust length button
                  <button className="p-2 bg-white rounded-full shadow-md">
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
                )}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleCloseAdjustMode}
              className="mt-2 p-2 hover:bg-gray-100 rounded-full"
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
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        // Standard floating toolbar UI
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
                  onClick={handleAdjustLengthClick}
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
      )}
    </div>
  );
};

export default FloatingToolbar;
