import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import FloatingToolbar from './FloatingToolbar';

export function setupFloatingToolbar() {
  const container = document.createElement('div');
  container.id = 'floating-toolbar-container';
  document.body.appendChild(container);

  let referenceElement: HTMLElement | null = null;

  // Find a reference element - this could be customized based on your specific need
  // For example, finding a specific text element or container
  function findReferenceElement() {
    // This is just an example - adjust to your specific needs
    return document.querySelector('.main-content') as HTMLElement;
  }

  const root = createRoot(container);

  function render() {
    // Update the reference element if needed
    referenceElement = findReferenceElement();

    root.render(<FloatingToolbar referenceElement={referenceElement} />);
  }

  // Initial render
  render();

  // Set up any event listeners if needed
  window.addEventListener('resize', render);

  // Clean up function
  return () => {
    window.removeEventListener('resize', render);
    document.body.removeChild(container);
  };
}
