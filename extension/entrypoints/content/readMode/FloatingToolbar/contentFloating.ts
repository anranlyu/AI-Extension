import { showTooltip, hideTooltip } from './renderFloating';
import { createReferenceFromSelection } from '../../utilities';

// Configuration options
interface FloatingUIOptions {
  autoHideAfter?: number;   // currently undefined for no auto-hide
  draggable?: boolean; 
  preserveReference?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
}

// Default options
const defaultOptions: FloatingUIOptions = {
  autoHideAfter: undefined, 
  draggable: true,
  preserveReference: true,
  position: 'top',
  offset: 10
};

let hideTimeout: number | null = null;
let isDragging = false;
let currentTooltip: HTMLElement | null = null;

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
    // Hide any existing tooltip before showing a new one
    if (currentTooltip) {
      hideFloatingUI();
    }

    const referenceEl = createReferenceFromSelection();
    if (!referenceEl) {
      console.warn("No valid selection for tooltip positioning");
      return false;
    }

    // Get the shadow root from the reference element
    let shadowRoot = referenceEl.getRootNode() as ShadowRoot;
    if (!shadowRoot || !(shadowRoot instanceof ShadowRoot)) {
      // If no shadow root, try to find the read mode container
      const readModeContainer = document.getElementById('read-mode-shadow-container');
      if (readModeContainer?.shadowRoot) {
        shadowRoot = readModeContainer.shadowRoot;
      } else {
        console.warn("Could not find shadow root for tooltip");
        return false;
      }
    }

    // Create tooltip container in the shadow root if it doesn't exist
    let tooltipContainer = shadowRoot.querySelector('.floating-tooltip-container');
    if (!tooltipContainer) {
      tooltipContainer = document.createElement('div');
      tooltipContainer.className = 'floating-tooltip-container';
      shadowRoot.appendChild(tooltipContainer);
    }
    
    // Show the tooltip with the specified options
    showTooltip({
      content,
      referenceElement: referenceEl,
      position: mergedOptions.position,
      offset: mergedOptions.offset,
      ...(mergedOptions.preserveReference ? { preserveReferenceElement: true } as any : {})
    });
    
    // Wait for the next tick to ensure the tooltip is rendered
    setTimeout(() => {
      // Store the current tooltip element
      currentTooltip = shadowRoot.querySelector('.floating-tooltip-container');
      
      if (!currentTooltip) {
        console.warn("Failed to find tooltip container after rendering");
        return;
      }
      
      // Listen for drag start/end if draggable is enabled
      if (mergedOptions.draggable) {
        setupDraggable(currentTooltip, mergedOptions);
      }
      
      // Set auto-hide if enabled
      if (mergedOptions.autoHideAfter && !isDragging) {
        hideTimeout = window.setTimeout(() => {
          hideFloatingUI();
        }, mergedOptions.autoHideAfter);
      }
    }, 0);
    
    return true;
  } catch (error) {
    console.error("Error showing floating UI:", error);
    return false;
  }
}

// Setup draggable functionality
function setupDraggable(element: HTMLElement, options: FloatingUIOptions) {
  let startX = 0;
  let startY = 0;
  let initialX = 0;
  let initialY = 0;

  const onMouseDown = (e: MouseEvent) => {
    // Don't start dragging if clicking on buttons or interactive elements
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) {
      return;
    }

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = element.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;

    // Cancel any existing hide timeout while dragging
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    element.style.cursor = 'grabbing';
    element.style.transition = 'none';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const newX = initialX + dx;
    const newY = initialY + dy;

    // Constrain to viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    const constrainedX = Math.max(0, Math.min(newX, viewportWidth - elementWidth));
    const constrainedY = Math.max(0, Math.min(newY, viewportHeight - elementHeight));

    element.style.left = `${constrainedX}px`;
    element.style.top = `${constrainedY}px`;
  };

  const onMouseUp = () => {
    if (!isDragging) return;

    isDragging = false;
    element.style.cursor = 'grab';
    element.style.transition = '';

    // Restart auto-hide if enabled
    if (options.autoHideAfter) {
      hideTimeout = window.setTimeout(() => {
        hideFloatingUI();
      }, options.autoHideAfter);
    }
  };

  element.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // Cleanup function
  return () => {
    element.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
}

// Manually hide the floating UI
export function hideFloatingUI() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  hideTooltip();
  currentTooltip = null;
  isDragging = false;
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
      position: mergedOptions.position,
      offset: mergedOptions.offset,
      ...(mergedOptions.preserveReference ? { preserveReferenceElement: true } as any : {})
    });
    
    // Update the current tooltip reference
    currentTooltip = document.querySelector('.floating-tooltip-container');
    
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
