export const injectDyslexiaFont = () => {
  const style = document.createElement('style');
  const fontUrl = chrome.runtime.getURL('fonts/OpenDyslexicMono-Regular.otf');
  style.setAttribute('data-dyslexia-font', 'true');
  style.textContent = `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('${fontUrl}') format('opentype');
      font-weight: normal;
      font-style: normal;
    }

    * {
      font-family: 'OpenDyslexic' !important;
    }
  `;
  document.head.appendChild(style);
};

export const removeDyslexiaFontFromPage = () => {
  const styleElement = document.querySelector('style[data-dyslexia-font]');
  if (styleElement) {
    styleElement.remove();
  }
};