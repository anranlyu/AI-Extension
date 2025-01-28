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

const injectHighlightStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .replaced-text {
      background-color: #e3f2fd; /* Light blue background */
      padding: 2px 4px;
      border-radius: 3px;
      border: 1px solid #90caf9; /* Light blue border */
    }

    .highlight-animation {
      animation: highlight-fade 2s ease-out;
    }

    @keyframes highlight-fade {
      0% {
        background-color: #fff176; /* Bright yellow for initial highlight */
      }
      100% {
        background-color: #e3f2fd; /* Back to light blue */
      }
    }
  `;
  document.head.appendChild(style);
};
injectHighlightStyles();

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
      // Create a span to wrap the new text
      const span = document.createElement('span');
      span.textContent = line;

      // Add a class to style the replaced text
      span.classList.add('replaced-text');

      // Add a tooltip to inform the user
      span.title = 'This text has been simplified or replaced.';

      fragment.appendChild(span);

      if (index < lines.length - 1) {
        fragment.appendChild(document.createElement('br'));
      }
    });

    range.insertNode(fragment);
    selection.removeAllRanges();

    // Add a temporary animation to draw attention
    const replacedTextElements = document.querySelectorAll('.replaced-text');
    replacedTextElements.forEach((element) => {
      element.classList.add('highlight-animation');
    });

    // Remove the animation after a short delay
    setTimeout(() => {
      replacedTextElements.forEach((element) => {
        element.classList.remove('highlight-animation');
      });
    }, 2000); // Animation lasts for 2 seconds
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
