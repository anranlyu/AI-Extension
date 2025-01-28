import { Message } from '../service/type';

console.log('content has been injected');

const injectDyslexiaFont = () => {
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
  }
};

chrome.runtime.sendMessage(
  { type: 'get_dyslexia_font_enabled' },
  (response) => {
    if (response && response.dyslexiaFontEnabled) {
      injectDyslexiaFont();
    }
  }
);

const getSelectedText = (): string | null => {
  const selection = window.getSelection();
  return selection && selection.rangeCount > 0 ? selection.toString() : null;
};

const replaceSelectedText = (newText: string): void => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const lines = newText.split('\n');

    const fragment = document.createDocumentFragment();

    lines.forEach((line, index) => {
      fragment.appendChild(document.createTextNode(line));
      if (index < lines.length) {
        fragment.appendChild(document.createElement('br'));
      }
    });

    range.insertNode(fragment);
    selection.removeAllRanges();
  }
};

document.addEventListener('mouseup', () => {
  const selectedText = getSelectedText();
  if (selectedText) {
    console.log('Selected text:', selectedText);
    chrome.runtime.sendMessage({ type: 'selected_text', text: selectedText });
  } else {
    console.warn('No text selected!');
  }
});

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === 'simplified_text') {
    console.log('Received processed text:', message.text);
    replaceSelectedText(message.text);
  }

  if (message.type === 'update_dyslexia_font') {
    if (message.dyslexiaFontEnabled) {
      injectDyslexiaFont();
    } else {
      removeDyslexiaFontFromPage();
    }
  }
});
