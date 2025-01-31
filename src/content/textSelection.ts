export const getSelectedText = (): string | null => {
  const selection = window.getSelection();
  return selection && selection.rangeCount > 0 ? selection.toString() : null;
};

export const replaceSelectedText = (newText: string): void => {
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