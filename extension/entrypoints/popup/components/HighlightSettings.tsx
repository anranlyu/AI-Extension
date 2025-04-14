import { useEffect, useState } from 'react';

export const HighlightSettings: React.FC = () => {
  const [height, setHeight] = useState('20');
  const [color, setColor] = useState('#81C3D7'); // Default blue color
  const [opacity, setOpacity] = useState('0.4'); // Default opacity

  // Load initial values from storage
  useEffect(() => {
    chrome.storage.local.get(
      ['highlightHeight', 'highlightColor', 'highlightOpacity'],
      (result) => {
        if (result.highlightHeight) setHeight(result.highlightHeight);
        if (result.highlightColor) setColor(result.highlightColor);
        if (result.highlightOpacity) setOpacity(result.highlightOpacity);
      }
    );
  }, []);

  const handleColorInput = (event: React.FormEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    setColor(target.value);
    chrome.storage.local.set({ highlightColor: target.value });
  };

  const handleHeightInput = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    setHeight(target.value);
    chrome.storage.local.set({ highlightHeight: target.value });
    target.placeholder = target.value;
  };

  const handleOpacityInput = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    setOpacity(target.value);
    chrome.storage.local.set({ highlightOpacity: target.value });
  };

  return (
    <div className="mt-2 border-t-2 border-gray-200 space-y-4">
      {/* Color Picker */}
      <div className="flex items-center justify-between mt-2">
        <label className="text-base font-medium text-gray-600">
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
        <label className="text-base font-medium text-gray-600">
          Height (px)
        </label>
        <input
          type="number"
          min="10"
          max="50"
          value={height}
          onInput={handleHeightInput}
          className="w-12 h-6 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Opacity Slider */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-base font-medium text-gray-600">Opacity</label>
          <span className="text-sm text-gray-500">
            {Math.round(parseFloat(opacity) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={opacity}
          onInput={handleOpacityInput}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
