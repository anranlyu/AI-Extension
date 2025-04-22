import React from 'react';
import { createRoot } from 'react-dom/client';
import FloatingToolbar from './FloatingToolbar/FloatingToolbar';

let toolbarContainer: HTMLDivElement | null = null;
let toolbarRoot: any = null;

/**
 * Shows a floating toolbar in the read mode overlay
 * @param shadowRoot - The shadow root of the read mode overlay
 * @param textContent - The text content of the read mode
 * @param readingLevel - The reading level of the content
 */
export const showFloatingToolbar = (
  shadowRoot: ShadowRoot,
  textContent: string,
  readingLevel: number = 0
) => {
  console.log('Showing floating toolbar...');
  // Clean up any existing toolbar first
  hideFloatingToolbar();

  // Create the toolbar container
  toolbarContainer = document.createElement('div');
  toolbarContainer.id = 'floating-toolbar-container';
  shadowRoot.appendChild(toolbarContainer);

  // Get the reference element (the read mode overlay)
  const referenceElement = shadowRoot.getElementById('read-mode-overlay');
  console.log('Reference element:', referenceElement);

  if (!referenceElement) {
    console.error('Could not find read-mode-overlay element in shadow root');
    return;
  }

  // Create the toolbar
  toolbarRoot = createRoot(toolbarContainer);
  toolbarRoot.render(
    <FloatingToolbar
      referenceElement={referenceElement}
      textContent={textContent}
      readingLevel={readingLevel}
    />
  );
  console.log('Floating toolbar rendered');
};

/**
 * Hides the floating toolbar
 */
export const hideFloatingToolbar = () => {
  if (toolbarRoot) {
    toolbarRoot.unmount();
    toolbarRoot = null;
  }

  if (toolbarContainer && toolbarContainer.parentElement) {
    toolbarContainer.parentElement.removeChild(toolbarContainer);
    toolbarContainer = null;
  }
};
