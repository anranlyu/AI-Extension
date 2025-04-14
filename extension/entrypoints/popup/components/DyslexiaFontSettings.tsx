import React, { useEffect, useState } from 'react';

export const DyslexiaFontSettings: React.FC = () => {
  const [selectedFont, setSelectedFont] = useState<string>('OpenDyslexic');
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Fetch the current font setting on mount and load fonts
  useEffect(() => {
    // Load the font files for the buttons
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'OpenDyslexicRegular';
        src: url('${chrome.runtime.getURL(
          'fonts/regular.otf'
        )}') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      
      @font-face {
        font-family: 'OpenDyslexicBold';
        src: url('${chrome.runtime.getURL(
          'fonts/bold.otf'
        )}') format('opentype');
        font-weight: bold;
        font-style: normal;
      }
      
      @font-face {
        font-family: 'OpenDyslexicItalic';
        src: url('${chrome.runtime.getURL(
          'fonts/italic.otf'
        )}') format('opentype');
        font-weight: normal;
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
    setFontsLoaded(true);

    chrome.storage.local.get(['dyslexiaFontType'], (result) => {
      if (result.dyslexiaFontType) {
        setSelectedFont(result.dyslexiaFontType);
      }
    });

    // Clean up
    return () => {
      style.remove();
    };
  }, []);

  // Update font type in storage and send message to content script
  const handleFontSelect = (fontType: string) => {
    setSelectedFont(fontType);
    chrome.storage.local.set({ dyslexiaFontType: fontType });

    // Send message to content script to update the font
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'update_dyslexia_font',
          fontType: fontType,
        });
      }
    });
  };

  return (
    <div className="pb-2 pt-1 border-t-2 border-gray-200">
      <div className="space-y-2 pt-3">
        <button
          onClick={() => handleFontSelect('OpenDyslexic')}
          className={`w-full text-left px-3 py-2 rounded text-base ${
            selectedFont === 'OpenDyslexic'
              ? 'bg-[#81C3D7] text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          style={{ fontFamily: 'OpenDyslexicRegular' }}
        >
          OpenDyslexic
        </button>

        <button
          onClick={() => handleFontSelect('OpenDyslexicBold')}
          className={`w-full text-left px-3 py-2 rounded text-base ${
            selectedFont === 'OpenDyslexicBold'
              ? 'bg-[#81C3D7] text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          style={{ fontFamily: 'OpenDyslexicBold' }}
        >
          OpenDyslexic Bold
        </button>

        <button
          onClick={() => handleFontSelect('OpenDyslexicItalic')}
          className={`w-full text-left px-3 py-2 rounded text-base ${
            selectedFont === 'OpenDyslexicItalic'
              ? 'bg-[#81C3D7] text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          style={{ fontFamily: 'OpenDyslexicItalic' }}
        >
          OpenDyslexic Italic
        </button>
      </div>
    </div>
  );
};

export default DyslexiaFontSettings;
