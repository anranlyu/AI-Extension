import { showTooltip } from "./Floating/renderFloating.tsx";

// Optionally include any helper functions here, for example:
function createReferenceFromSelection(): HTMLElement | null {
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const dummy = document.createElement("div");
    dummy.style.position = "absolute";
    dummy.style.top = `${rect.top + window.scrollY}px`;
    dummy.style.left = `${rect.left + window.scrollX}px`;
    dummy.style.width = `${rect.width}px`;
    dummy.style.height = `${rect.height}px`;
    dummy.style.pointerEvents = "none";
    dummy.style.opacity = "0";
    document.body.appendChild(dummy);
    return dummy;
  }
  return null;
}

// Listen for messages from the background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'translated_text') {
    const translationText = message.text;
    const referenceEl = createReferenceFromSelection(); // Or use another strategy
    if (referenceEl) {
      showTooltip({
        content: translationText,
        referenceElement: referenceEl,
      });
      // Optionally, remove the dummy after a delay:
      setTimeout(() => referenceEl.remove(), 5000);
    }
  }
});
