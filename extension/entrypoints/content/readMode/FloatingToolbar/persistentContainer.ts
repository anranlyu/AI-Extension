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
            readModeContainer.shadowRoot.appendChild(container);
        }
        return container as HTMLElement;
    }
    
    // Fallback to main document if no shadow root found
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);
    }
    return container;
}
