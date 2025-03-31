/**
 * Text selection and replacement utilities for the LumiRead extension.
 * Provides functionality for getting selected text and replacing it with processed content.
 */

/**
 * Animates replaced text elements with a highlight effect
 * @param elements - A collection of DOM elements to animate
 * @description
 * Adds a highlight animation class to the elements and removes it after 1 second.
 * Used to provide visual feedback when text is replaced.
 */
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

/**
 * Gets the currently selected text from the window
 * @returns The selected text as a string, or null if no text is selected
 * @description
 * Uses the window.getSelection() API to retrieve the currently selected text.
 * Returns null if no text is selected or if the selection is empty.
 */
export const getSelectedText = (): string | null => {
  return window.getSelection()?.toString() || null;
};

/**
 * Replaces the currently selected text with new content
 * @param newText - The new text content to replace the selection with
 * @description
 * Replaces the currently selected text with new content while preserving formatting:
 * 1. Gets the current selection
 * 2. Deletes the selected content
 * 3. Creates a document fragment with the new content
 * 4. Preserves line breaks from the new text
 * 5. Adds visual styling and tooltip to replaced text
 * 6. Animates the replaced text for visual feedback
 * 
 * The replaced text is wrapped in spans with the 'replaced-text' class
 * and includes a tooltip indicating it has been modified.
 */
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