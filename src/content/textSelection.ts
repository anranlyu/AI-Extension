const animateReplacedText = (elements: NodeListOf<Element>) => {
  elements.forEach((element) => {
    element.classList.add('highlight-animation');
  });

  setTimeout(() => {
    elements.forEach((element) => {
      element.classList.remove('highlight-animation');
    });
  }, 1000);
};
console.log("testing")

export const getSelectedText = (): string | null => {
  return window.getSelection()?.toString() || null;
};

export const replaceSelectedText = (newText: string): void => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const lines = newText.split('\n');
  const fragment = document.createDocumentFragment();

  lines.forEach((line, index) => {
    const span = document.createElement('span');
    span.textContent = line;
    span.classList.add('replaced-text');
    span.title = 'This text has been simplified or replaced.';
    fragment.appendChild(span);

    if (index < lines.length - 1) {
      fragment.appendChild(document.createElement('br'));
    }
  });

  range.insertNode(fragment);
  selection.removeAllRanges();

  const replacedTextElements = document.querySelectorAll('.replaced-text');
  animateReplacedText(replacedTextElements);
};