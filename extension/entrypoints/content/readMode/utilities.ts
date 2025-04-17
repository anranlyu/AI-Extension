export function createReferenceFromSelection(): HTMLElement | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!range) {
    return null;
  }

  // Create a temporary span element
  const referenceEl = document.createElement('span');
  referenceEl.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    visibility: hidden;
  `;

  // Get the common ancestor container
  const container = range.commonAncestorContainer;
  
  // If the container is in a shadow root, get the shadow host
  let parentElement = container.nodeType === Node.ELEMENT_NODE 
    ? container as Element 
    : container.parentElement;
  
  while (parentElement && !parentElement.shadowRoot) {
    parentElement = parentElement.parentElement;
  }

  // If we found a shadow root, append to its host
  if (parentElement?.shadowRoot) {
    parentElement.shadowRoot.appendChild(referenceEl);
  } else {
    // Otherwise append to the main document
    document.body.appendChild(referenceEl);
  }

  // Set the reference element's position to match the selection
  const rect = range.getBoundingClientRect();
  referenceEl.style.left = `${rect.left}px`;
  referenceEl.style.top = `${rect.top}px`;
  referenceEl.style.width = `${rect.width}px`;
  referenceEl.style.height = `${rect.height}px`;

  return referenceEl;
} 