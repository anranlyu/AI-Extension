// persistentContainer.ts
export function getTooltipContainer(): HTMLElement {
    const containerId = 'persistent-tooltip-container';
    
    // First try to find the container in the shadow DOM
    const readModeContainer = document.getElementById('read-mode-shadow-container');
    if (readModeContainer?.shadowRoot) {
        let container = readModeContainer.shadowRoot.querySelector(`#${containerId}`);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'floating-tooltip-container'; // Add this class to match contentFloating.ts
            readModeContainer.shadowRoot.appendChild(container);
        }
        return container as HTMLElement;
    }
    
    // If no shadow root found, throw an error as we need the shadow DOM
    throw new Error('Could not find read mode shadow container');
}
