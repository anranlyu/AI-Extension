import type { ContentScriptContext, ShadowRootContentScriptUi } from 'wxt/client';
import { getLocalStorage, hexToRgba } from './utilities';

let highlightElement: HTMLElement | null = null;
let mouseMoveListener: ((event: MouseEvent) => void) | null = null;
let mouseLeaveListener: (() => void) | null = null;
let shadowUi: ShadowRootContentScriptUi<void> | null;

export const initHighlight = () => {

  chrome.storage.local.get(['highlightColor', 'highlightHeight'], (items) => {

    if (!items.highlightColor) {
      chrome.storage.local.set({ highlightColor: 'rgba(243, 236, 182, 0.4)' });
    }

    if (!items.highlightHeight) {
      chrome.storage.local.set({ highlightHeight: '20' });
    }
  });
};



async function createHighlighter(ctx: ContentScriptContext) {
  const { highlightColor, highlightHeight } = await getLocalStorage([
    'highlightColor',
    'highlightHeight',
  ]);

  return createShadowRootUi(ctx, {
    name: 'tailwind-shadow-root-highlighter',
    position: 'inline',
    anchor: 'body',
    append: 'first',
    onMount: (uiContainer) => {
      const highlighter = document.createElement('div');
      highlighter.classList.add(
        'absolute',
        'w-full',
        'pointer-events-none',
        'z-[999999]'
      );
      highlighter.id = "highlighter";
      highlighter.style.backgroundColor = hexToRgba(highlightColor, 0.4);
      highlighter.style.height = `${highlightHeight}px`;
      uiContainer.append(highlighter);
    },
  });
}



/**
 * Set up mousemove + mouseleave listeners to position the highlight.
 */
function setupEventListeners() {
  mouseMoveListener = (event: MouseEvent) => {
    if (!highlightElement) return;

    // Position the highlight bar around the mouse Y position
    const height = highlightElement.offsetHeight;
    const topPosition = event.clientY + window.scrollY - height / 2;

    highlightElement.style.top = `${topPosition}px`;
    highlightElement.style.display = 'block'; // Make sure it's visible
  };

  mouseLeaveListener = () => {
    if (!highlightElement) return;
    highlightElement.style.display = 'none';
  };

  document.addEventListener('mousemove', mouseMoveListener);
  document.addEventListener('mouseleave', mouseLeaveListener);
}

/**
 * Remove our mousemove + mouseleave listeners.
 */
function removeEventListeners() {
  if (mouseMoveListener) {
    document.removeEventListener('mousemove', mouseMoveListener);
    mouseMoveListener = null;
  }
  if (mouseLeaveListener) {
    document.removeEventListener('mouseleave', mouseLeaveListener);
    mouseLeaveListener = null;
  }
}

/**
 * Listen for storage changes and update highlight dynamically.
 */
chrome.storage.onChanged.addListener((changes) => {
  if (!highlightElement) return;

  if (changes.highlightColor) {
    highlightElement.style.backgroundColor = hexToRgba(
      changes.highlightColor.newValue,
      0.4
    );
  }
  if (changes.highlightHeight) {
    highlightElement.style.height = `${changes.highlightHeight.newValue}px`;
  }
});

/**
 * Enable the highlighting functionality.
 */
export async function enableHighlight(ctx: ContentScriptContext) {
  shadowUi = await createHighlighter(ctx);
  shadowUi.mount();
  highlightElement = shadowUi.shadow.querySelector('#highlighter') ?? null;
  console.log(highlightElement)

  // Start tracking mouse movements
  setupEventListeners();

}

/**
 * Disable (remove) the highlighting functionality.
 */
export function disableHighlight() {
  console.log('disableHighlight called');

  shadowUi?.remove();

  removeEventListeners();
}