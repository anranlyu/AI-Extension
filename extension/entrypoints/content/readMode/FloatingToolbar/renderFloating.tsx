import React from 'react';
import { createRoot } from 'react-dom/client';
import FloatingTooltip from './FloatingTT';
import { getTooltipContainer } from './persistentContainer';

interface TooltipData {
  content: React.ReactNode;
  referenceElement: HTMLElement | null;
  preserveReferenceElement?: boolean;
}

// Store a reference to the root
let tooltipRoot: any = null;
let referenceElementCleanup: HTMLElement | null = null;

export function showTooltip(data: TooltipData) {
  // Get the container in the correct DOM context
  const container = getTooltipContainer();
  
  // Store reference for cleanup
  referenceElementCleanup = data.referenceElement;

  // Clear previous tooltip if it exists
  if (tooltipRoot) {
    hideTooltip();
  }

  // Create root once
  tooltipRoot = createRoot(container);

  const closeTooltip = () => {
    hideTooltip();
  };

  // Render the tooltip with a small delay to ensure the container is ready
  setTimeout(() => {
    tooltipRoot.render(
      <FloatingTooltip
        content={data.content}
        referenceElement={data.referenceElement}
        onClose={closeTooltip}
      />
    );
  }, 0);
}

export function hideTooltip() {
  if (tooltipRoot) {
    tooltipRoot.unmount();
    tooltipRoot = null;
  }
  
  // Clean up reference element
  if (referenceElementCleanup) {
    referenceElementCleanup.remove();
    referenceElementCleanup = null;
  }
}