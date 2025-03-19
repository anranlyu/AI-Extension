export function getLocalStorage<T extends string | string[] | object>(
  keys: T
): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}


export function hexToRgba(hex: string, alpha: number): string {
  const sanitizedHex = hex.replace(/^#/, '');
  const r = parseInt(sanitizedHex.substring(0, 2), 16);
  const g = parseInt(sanitizedHex.substring(2, 4), 16);
  const b = parseInt(sanitizedHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


export function createReferenceFromSelection(): HTMLElement | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return null;
  
  try {
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
  } catch (error) {
    console.error("Error creating reference element:", error);
    return null;
  }
}