// persistentContainer.ts
export function getTooltipContainer(): HTMLElement {
    const containerId = 'persistent-tooltip-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    return container;
  }
