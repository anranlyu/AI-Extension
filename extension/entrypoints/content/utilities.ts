/**
 * Utility functions for the LumiRead extension.
 * Provides helper functions for storage operations and color manipulation.
 */

/**
 * Retrieves data from Chrome's local storage
 * @template T - The type of keys to retrieve (string, string array, or object)
 * @param keys - The key(s) to retrieve from storage
 * @returns Promise resolving to an object containing the requested storage data
 * @throws Error if there's a runtime error accessing storage
 * @description
 * A Promise-based wrapper around chrome.storage.local.get that handles errors.
 * Can retrieve single keys, multiple keys, or all storage data.
 * 
 * @example
 * // Get a single key
 * getLocalStorage('theme').then(data => console.log(data.theme));
 * 
 * // Get multiple keys
 * getLocalStorage(['theme', 'fontSize']).then(data => {
 *   console.log(data.theme, data.fontSize);
 * });
 * 
 * // Get all storage data
 * getLocalStorage({}).then(data => console.log(data));
 */
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

/**
 * Converts a hex color code to an RGBA color string
 * @param hex - The hex color code (with or without # prefix)
 * @param alpha - The alpha/opacity value (0-1)
 * @returns The color as an RGBA string
 * @description
 * Converts a hex color code to an RGBA color string with the specified opacity.
 * Handles hex codes both with and without the # prefix.
 * Provides a default blue color if hex is undefined or invalid.
 * 
 * @example
 * hexToRgba('#FF0000', 0.5) // returns 'rgba(255, 0, 0, 0.5)'
 * hexToRgba('FF0000', 0.5)  // returns 'rgba(255, 0, 0, 0.5)'
 */
export function hexToRgba(hex: string | undefined, alpha: number): string {
  // Default color if hex is undefined or invalid
  const defaultColor = '#81C3D7'; // Default blue color
  
  // Make sure we have a valid hex color
  if (!hex || hex.length < 6) {
    hex = defaultColor;
  }
  
  const sanitizedHex = hex.replace(/^#/, '');
  
  try {
    const r = parseInt(sanitizedHex.substring(0, 2), 16);
    const g = parseInt(sanitizedHex.substring(2, 4), 16);
    const b = parseInt(sanitizedHex.substring(4, 6), 16);
    
    // Check if parsing was successful
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      // Use default color if parsing failed
      const defaultR = parseInt(defaultColor.substring(1, 3), 16);
      const defaultG = parseInt(defaultColor.substring(3, 5), 16);
      const defaultB = parseInt(defaultColor.substring(5, 7), 16);
      return `rgba(${defaultR}, ${defaultG}, ${defaultB}, ${alpha})`;
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (e) {
    // Fallback to default color on any error
    const defaultR = parseInt(defaultColor.substring(1, 3), 16);
    const defaultG = parseInt(defaultColor.substring(3, 5), 16);
    const defaultB = parseInt(defaultColor.substring(5, 7), 16);
    return `rgba(${defaultR}, ${defaultG}, ${defaultB}, ${alpha})`;
  }
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
  }}

