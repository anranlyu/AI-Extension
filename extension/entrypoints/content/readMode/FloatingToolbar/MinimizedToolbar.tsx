import React from 'react';

interface MinimizedToolbarProps {
  onMinimizeToggle: () => void;
}

const MinimizedToolbar: React.FC<MinimizedToolbarProps> = ({
  onMinimizeToggle,
}) => {
  return (
    <button
      onClick={onMinimizeToggle}
      className="p-2 hover:bg-gray-100 rounded-full"
      aria-label="Expand toolbar"
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
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
};

export default MinimizedToolbar;
