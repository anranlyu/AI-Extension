import { showTooltip, hideTooltip } from './renderFloating';
import { createReferenceFromSelection } from '../utilities';

// Configuration options
interface FloatingUIOptions {
  autoHideAfter?: number;   // currently undefined for no auto-hide
  draggable?: boolean; 
  preserveReference?: boolean; 
}

// Default options - no auto-hide
const defaultOptions: FloatingUIOptions = {
  autoHideAfter: undefined, 
  draggable: true,
  preserveReference: true
};

let hideTimeout: number | null = null;
let isDragging = false;

// Floating UI at the current text selection
export function showFloatingUI(
  content: React.ReactNode,
  options: FloatingUIOptions = {}
) {
  const mergedOptions = { ...defaultOptions, ...options };

  // Clear any existing timeout if present
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
      ...(mergedOptions.preserveReference ? { preserveReferenceElement: true } as any : {})
    });
    
    // Listen for drag start/end if draggable is enabled
    if (mergedOptions.draggable) {
      const container = document.querySelector('.floating-tooltip-container');
      if (container) {
        container.addEventListener('mousedown', () => {
          isDragging = true;
          // Cancel any existing hide timeout while dragging
          if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
          }
        }, { once: true });
        
        document.addEventListener('mouseup', () => {
          isDragging = false;
          // Restart auto-hide after drag ends if enabled and explicitly requested
          if (mergedOptions.autoHideAfter && !isDragging) {
            hideTimeout = window.setTimeout(() => {
              hideFloatingUI();
            }, mergedOptions.autoHideAfter);
          }
        }, { once: true });
      }
    }
    
    // Only set auto-hide if explicitly enabled
    if (mergedOptions.autoHideAfter && !isDragging) {
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
  hideTooltip(); // Call without arguments to match your current API
}

// Update content without resetting position
export function updateFloatingContent(content: React.ReactNode, options: FloatingUIOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Get the current reference element
  const currentReferenceEl = document.querySelector('[data-floating-reference="true"]');
  
  if (currentReferenceEl) {
    showTooltip({
      content,
      referenceElement: currentReferenceEl as HTMLElement,
      ...(mergedOptions.preserveReference ? { preserveReferenceElement: true } as any : {})
    });
    
    // Only reset hide timeout if auto-hide is explicitly enabled
    if (mergedOptions.autoHideAfter && !isDragging) {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      
      hideTimeout = window.setTimeout(() => {
        hideFloatingUI();
      }, mergedOptions.autoHideAfter);
    }
    
    return true;
  }
  
  // If no existing tooltip, create a new one
  return showFloatingUI(content, options);
}

export function handleTranslatedText(text: string) {
  // Show text without auto-hide
  showFloatingUI(text);
}

// 3. Add this simple test function to contentFloating.ts:
export function testDraggable() {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '100px';
  div.style.left = '100px';
  div.style.width = '200px';
  div.style.height = '100px';
  div.style.backgroundColor = 'lightblue';
  div.style.border = '2px solid blue';
  div.style.zIndex = '10000';
  div.style.cursor = 'grab';
  div.textContent = 'Test Draggable';
  
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  
  div.addEventListener('mousedown', (e) => {
    console.log('Test draggable: mousedown');
    isDragging = true;
    offsetX = e.clientX - parseInt(div.style.left);
    offsetY = e.clientY - parseInt(div.style.top);
    div.style.cursor = 'grabbing';
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      console.log('Test draggable: mousemove');
      div.style.left = (e.clientX - offsetX) + 'px';
      div.style.top = (e.clientY - offsetY) + 'px';
    }
  });
  
  document.addEventListener('mouseup', () => {
    console.log('Test draggable: mouseup');
    isDragging = false;
    div.style.cursor = 'grab';
  });
  
  document.body.appendChild(div);
  return div;
}
