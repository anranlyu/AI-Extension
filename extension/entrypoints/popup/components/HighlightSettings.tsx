import { useEffect, useState } from 'react';

export const HighlightSettings: React.FC = () => {
  const [height, setHeight] = useState('20');
  const [color, setColor] = useState('#fde68a'); // Default tailwind yellow-200

  // Load initial values from storage
  useEffect(() => {
    chrome.storage.local.get(
      ['highlightHeight', 'highlightColor'],
      (result) => {
        if (result.highlightHeight) setHeight(result.highlightHeight);
        if (result.highlightColor) setColor(result.highlightColor);
      }
    );
  }, []);

  const handleColorInput = (event: React.FormEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    setColor(target.value);
    chrome.storage.local.set({ highlightColor: target.value });
  };

  const handleHightInput = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    setHeight(target.value);
    chrome.storage.local.set({ highlightHeight: target.value });
    target.placeholder = target.value;
  };

  return (
    <div className="mt-2 border-t-2 border-gray-200 space-y-4">
      {/* Color Picker */}
      <div className="flex items-center justify-between mt-2">
        <label className="text-sm font-medium text-gray-600">
          Highlight Color
        </label>
        <input
          type="color"
          value={color}
          onInput={handleColorInput}
          className="w-12 h-6 rounded-md cursor-pointer rounded-lg border-none bg-transparent"
        />
      </div>

      {/* Height Slider */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-600">Height (px)</label>
        <input
          type="number"
          min="10"
          max="50"
          value={height}
          onInput={handleHightInput}
          className="w-12 h-6 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
