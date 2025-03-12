const injectDyslexiaFont = () => {
  if (document.querySelector('style[data-dyslexia-font]')) {
    console.log('Dyslexia font already injected.');
    return;
  }

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

const removeDyslexiaFontFromPage = () => {
  const styleElement = document.querySelector('style[data-dyslexia-font]');
  if (styleElement) {
    styleElement.remove();
  } else {
    console.warn('No dyslexia font style to remove.');
  }
};


export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {


    chrome.storage.local.get(
      [
        'dyslexiaFontEnabled',
      ],

      (result) => {
        if (result.dyslexiaFontEnabled) injectDyslexiaFont();
      }
    )


    chrome.storage.onChanged.addListener((changes) => {
      if (changes.dyslexiaFontEnabled) {
        changes.dyslexiaFontEnabled.newValue
          ? injectDyslexiaFont()
          : removeDyslexiaFontFromPage();
      }
    })
  },
});