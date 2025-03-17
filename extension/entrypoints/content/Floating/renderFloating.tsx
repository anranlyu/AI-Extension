// renderFloating.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import FloatingTooltip from './FloatingTT';
import { getTooltipContainer } from './persistentContainer';

interface TooltipData {
  content: React.ReactNode;
  referenceElement: HTMLElement | null;
}

export function showTooltip(data: TooltipData) {
  const container = getTooltipContainer();

  const closeTooltip = () => {
    ReactDOM.unmountComponentAtNode(container);
  };

  ReactDOM.render(
    <FloatingTooltip
      content={data.content}
      referenceElement={data.referenceElement}
      onClose={closeTooltip}
    />,
    container
  );
}
