import React from 'react';
import { createRoot } from 'react-dom/client';
import FloatingToolbar from './FloatingToolbar';
import { getTextContent } from '../readMode';

export const renderFloatingToolbar = (referenceElement: HTMLElement | null) => {
  // Create container for the toolbar
  const container = document.createElement('div');
  container.id = 'floating-toolbar-container';
  document.body.appendChild(container);

  // Get text content
  const textContent = getTextContent();

  // Create root and render toolbar
  const root = createRoot(container);
  root.render(
    <FloatingToolbar
      referenceElement={referenceElement}
      textContent={textContent}
    />
  );

  // Return cleanup function
  return () => {
    root.unmount();
    container.remove();
  };
}; 