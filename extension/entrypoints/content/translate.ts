import { showTooltip } from "./Floating/renderFloating";

// temporary reference element
export function createReferenceFromSelection(): HTMLElement | null {
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
    dummy.style.opacity = "0"; // Invisible, but present for positioning
    
    document.body.appendChild(dummy);
    return dummy;
  }
  return null;
}

export function showFloatingOverlay(translatedText: string) {
  // Use the helper to create a temporary reference element based on selection.
  const referenceEl = createReferenceFromSelection();

  if (referenceEl) {
    showTooltip({
      content: translatedText,
      referenceElement: referenceEl,
    });
    
    // Optionally, remove the dummy reference element after some time or when the tooltip is closed.
    setTimeout(() => {
      referenceEl.remove();
    }, 5000);
  }
}
