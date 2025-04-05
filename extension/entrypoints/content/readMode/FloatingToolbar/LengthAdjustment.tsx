import React, { useRef, useEffect } from 'react';
import { LENGTH_OPTIONS } from './types';

interface LengthAdjustmentProps {
  selectedLengthOption: number;
  hasBeenDragged: boolean;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  setSelectedLengthOption: (option: number) => void;
  setHasBeenDragged: (dragged: boolean) => void;
  onSendClick: () => void;
  onCloseClick: () => void;
}

const LengthAdjustment: React.FC<LengthAdjustmentProps> = ({
  selectedLengthOption,
  hasBeenDragged,
  isDragging,
  setIsDragging,
  setSelectedLengthOption,
  setHasBeenDragged,
  onSendClick,
  onCloseClick,
}) => {
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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
  }, [
    isDragging,
    hasBeenDragged,
    setIsDragging,
    setSelectedLengthOption,
    setHasBeenDragged,
  ]);

  return (
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
                    idx === selectedLengthOption ? 'bg-gray-800' : 'bg-gray-400'
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
                onClick={onSendClick}
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
          onClick={onCloseClick}
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
  );
};

export default LengthAdjustment;
