import { Message } from '../service/type';

console.log('content has been injected');

const getSelectedText = (): string | null => {
  const selection = window.getSelection();
  return selection && selection.rangeCount > 0 ? selection.toString() : null;
};

const replaceSelectedText = (newText: string): void => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
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
    console.log('Received simplified text:', message.text);
    replaceSelectedText(message.text);
  }
});
