// Font type mapping to file paths
type FontType = 'OpenDyslexic' | 'OpenDyslexicBold' | 'OpenDyslexicItalic';

const fontFiles: Record<FontType, string> = {
  'OpenDyslexic': 'fonts/regular.otf',
  'OpenDyslexicBold': 'fonts/bold.otf', // Replace with actual bold file if available
  'OpenDyslexicItalic': 'fonts/italic.otf' // Replace with actual italic file if available
};

// Default font type
let currentFontType: FontType = 'OpenDyslexic';

const injectDyslexiaFont = (fontType: FontType = 'OpenDyslexic') => {
  // Remove any existing font styles first
  removeDyslexiaFontFromPage();
  
  // Store the current font type
  currentFontType = fontType;
  
  const style = document.createElement('style');
  const fontUrl = chrome.runtime.getURL(fontFiles[fontType]);
  style.setAttribute('data-dyslexia-font', 'true');
  
  // Adjust CSS based on font type
  let fontStyle = 'normal';
  let fontWeight = 'normal';
  
  if (fontType === 'OpenDyslexicBold') {
    fontWeight = 'bold';
  } else if (fontType === 'OpenDyslexicItalic') {
    fontStyle = 'italic';
  }
  
  style.textContent = `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('${fontUrl}') format('opentype');
      font-weight: ${fontWeight};
      font-style: ${fontStyle};
    }

    * {
      font-family: 'OpenDyslexic' !important;
      font-weight: ${fontWeight === 'bold' ? 'bold' : 'normal'} !important;
      font-style: ${fontStyle} !important;
    }
  `;
  document.head.appendChild(style);
};

const removeDyslexiaFontFromPage = () => {
  const styleElement = document.querySelector('style[data-dyslexia-font]');
  if (styleElement) {
    styleElement.remove();
  }
};

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
    // Initial setup based on stored settings
    chrome.storage.local.get(
      [
        'dyslexiaFontEnabled',
        'dyslexiaFontType'
      ],
      (result: { dyslexiaFontEnabled?: boolean; dyslexiaFontType?: string }) => {
        if (result.dyslexiaFontEnabled) {
          // Use stored font type or default
          const fontType = (result.dyslexiaFontType as FontType) || 'OpenDyslexic';
          injectDyslexiaFont(fontType);
        }
      }
    );

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.dyslexiaFontEnabled) {
        changes.dyslexiaFontEnabled.newValue
          ? injectDyslexiaFont(currentFontType)
          : removeDyslexiaFontFromPage();
      }
      
      if (changes.dyslexiaFontType && changes.dyslexiaFontType.newValue) {
        if (document.querySelector('style[data-dyslexia-font]')) {
          // Only update font if it's currently enabled
          const newFontType = changes.dyslexiaFontType.newValue as FontType;
          injectDyslexiaFont(newFontType);
        }
      }
    });
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message: { type: string; enabled?: boolean; fontType?: string }) => {
      if (message.type === 'toggle_dyslexia_font') {
        message.enabled
          ? injectDyslexiaFont(currentFontType)
          : removeDyslexiaFontFromPage();
      } else if (message.type === 'update_dyslexia_font' && message.fontType) {
        if (document.querySelector('style[data-dyslexia-font]')) {
          // Only update font if it's currently enabled
          const fontType = message.fontType as FontType;
          injectDyslexiaFont(fontType);
        }
      }
    });
  },
});