// contentFloating.tsx
import { showTooltip } from './renderFloating';

// Optional: Create a helper to derive a reference element.
// For example, if you want to base the tooltip position on text selection,
// you can create a temporary reference element:
function createReferenceFromSelection(): HTMLElement | null {
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const dummy = document.createElement('div');
    dummy.style.position = 'absolute';
    dummy.style.top = `${rect.top + window.scrollY}px`;
    dummy.style.left = `${rect.left + window.scrollX}px`;
    dummy.style.width = `${rect.width}px`;
    dummy.style.height = `${rect.height}px`;
    dummy.style.pointerEvents = 'none';
    dummy.style.opacity = '0';
    document.body.appendChild(dummy);
    return dummy;
  }
  return null;
}

// Listen for messages from the background script.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'translated_text') {
    const translationText = message.text;
    // Decide on the reference element.
    // Here we use a helper to create a reference element based on the current text selection.
    let referenceElement = createReferenceFromSelection();
    // Alternatively, if you have an element ID or another strategy, use that.
    
    if (referenceElement) {
      showTooltip({
        content: translationText,
        referenceElement,
      });
      // Optionally, remove the temporary reference element after a while:
      setTimeout(() => {
        referenceElement?.remove();
      }, 5000);
    }
  }
});
