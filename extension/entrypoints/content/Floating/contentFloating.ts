// contentFloating.ts as a module
import { showTooltip, hideTooltip } from './renderFloating';
import { createReferenceFromSelection } from '../utilities';

// Configuration options
interface FloatingUIOptions {
  autoHideAfter?: number; // ms to auto-hide, undefined for no auto-hide
  // cssClass?: string;      // option to adopt different CSS class for styling
}

// Default options
const defaultOptions: FloatingUIOptions = {
  autoHideAfter: 5000
};

// automatic cleanup
let hideTimeout: number | null = null;

//Floating UI at the current text selection
export function showFloatingUI(
  content: React.ReactNode,
  options: FloatingUIOptions = {}
) {
  // Merge with default options
  const mergedOptions = { ...defaultOptions, ...options };

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  try {
    const referenceEl = createReferenceFromSelection();
    if (!referenceEl) {
      console.warn("No valid selection for tooltip positioning");
      return false;
    }
    
    showTooltip({
      content,
      referenceElement: referenceEl,
      // cssClass: mergedOptions.cssClass
    });
    
    if (mergedOptions.autoHideAfter) {
      hideTimeout = window.setTimeout(() => {
        hideFloatingUI();
      }, mergedOptions.autoHideAfter);
    }
    
    return true;
  } catch (error) {
    console.error("Error showing floating UI:", error);
    return false;
  }
}

// Manually hide the floating UI
export function hideFloatingUI() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  hideTooltip();
}

export function handleTranslatedText(text: string) {
  showFloatingUI(text);
}