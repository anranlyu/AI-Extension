import { createShadowRootUi } from 'wxt/client';
import TTSFloatingCard from "./ttsFloatingCard";
import React from 'react';
import ReactDOM from 'react-dom/client';

export async function createTTSFloatingUI(ctx: any) {
    const ui = await createShadowRootUi(ctx, {
        name: 'tts-floating-card',
        position: 'overlay',
        alignment: 'top-right',
        onMount(container) {
            container.style.position = 'fixed';
            container.style.top = '100px'; // Offset from the top
            container.style.right = '100px'; // Offset from the right
            container.style.padding = '10px'; // Add some padding
            container.style.zIndex = '9999';
            // Make sure it's on top of everything 
            // Create a root for React to render into
            const root = ReactDOM.createRoot(container);
            // Render the React component into the container
            root.render(React.createElement(TTSFloatingCard));

            // Drag functionality
            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;

            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                offsetX = e.clientX - container.getBoundingClientRect().left;
                offsetY = e.clientY - container.getBoundingClientRect().top;
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;

                container.style.left = x + 'px';
                container.style.top = y + 'px';
                container.style.right = '';
            });


        },
    });
    return ui;
}
