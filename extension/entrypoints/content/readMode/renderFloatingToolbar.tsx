import React from 'react';
import { createRoot } from 'react-dom/client';
import FloatingToolbar from './FloatingToolbar';

// Store a reference to the root
let toolbarRoot: any = null;
// Store the text content for later use
let currentTextContent: string = '';

export function showFloatingToolbar(
  shadowRoot: ShadowRoot,
  textContent: string = ''
) {
  // Store the text content
  currentTextContent = textContent;

  // Clear previous toolbar if it exists
  if (toolbarRoot) {
    hideFloatingToolbar();
  }

  // Get the overlay element as reference
  const referenceElement = shadowRoot.getElementById('read-mode-overlay');

  if (!referenceElement) {
    console.error('Read mode overlay not found for toolbar positioning');
    return;
  }

  // Create container inside the shadow root
  let container = shadowRoot.getElementById('floating-toolbar-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'floating-toolbar-container';
    container.style.position = 'fixed';
    container.style.zIndex = '999999';
    shadowRoot.appendChild(container);
  }

  // Create root once
  toolbarRoot = createRoot(container);

  toolbarRoot.render(
    <FloatingToolbar
      referenceElement={referenceElement}
      textContent={currentTextContent}
    />
  );
}

export function hideFloatingToolbar() {
  if (toolbarRoot) {
    toolbarRoot.unmount();
    toolbarRoot = null;
  }
}
