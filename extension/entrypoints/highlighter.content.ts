import { getLocalStorage, hexToRgba } from "./content/utilities";
import type { ContentScriptContext, ShadowRootContentScriptUi } from 'wxt/client';

// Global variables to manage the highlighter state
let highlightElement: HTMLElement | null = null;
let mouseMoveListener: ((event: MouseEvent) => void) | null = null;
let mouseLeaveListener: (() => void) | null = null;
let mouseEnterListener: ((event: MouseEvent) => void) | null = null;
let shadowUi: ShadowRootContentScriptUi<void> | null = null;

export default defineContentScript({
    matches: ['<all_urls>'],
    cssInjectionMode: 'ui',
    async main(ctx) {
        // Initialize default values first and wait for completion
        await initHighlight();
        console.log('Highlight settings initialized');

        // Check initial state on page load
        chrome.storage.local.get('highlightEnabled', (result) => {
            if (result.highlightEnabled) {
                enableHighlight(ctx);
            }
        });

        // Listen for changes in storage
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.highlightEnabled) {
                changes.highlightEnabled.newValue
                    ? enableHighlight(ctx)
                    : disableHighlight();
            }
        });

        // Listen for changes to highlight color or height
        chrome.storage.onChanged.addListener((changes) => {
            if (!highlightElement) return;

            // Get current opacity value if we need it
            const getCurrentOpacity = async () => {
                const { highlightOpacity } = await getLocalStorage(['highlightOpacity']);
                return parseFloat(highlightOpacity || '0.4');
            };

            if (changes.highlightColor) {
                // If only color changed, maintain the current opacity
                getCurrentOpacity().then(opacity => {
                    highlightElement!.style.backgroundColor = hexToRgba(
                        changes.highlightColor.newValue,
                        opacity
                    );
                });
            }
            
            if (changes.highlightOpacity) {
                // If opacity changed, need to update the background with current color
                getLocalStorage(['highlightColor']).then(({ highlightColor }) => {
                    highlightElement!.style.backgroundColor = hexToRgba(
                        highlightColor,
                        parseFloat(changes.highlightOpacity.newValue)
                    );
                });
            }
            
            if (changes.highlightHeight) {
                highlightElement.style.height = `${changes.highlightHeight.newValue}px`;
            }
        });
    }
});

/**
 * Initialize highlight settings with default values if not already set
 * Returns a promise that resolves when initialization is complete
 */
const initHighlight = async (): Promise<void> => {
    return new Promise<void>((resolve) => {
        chrome.storage.local.get(['highlightColor', 'highlightHeight', 'highlightOpacity'], (items) => {
            const updates: Record<string, any> = {};
            let needsUpdate = false;
            
            if (!items.highlightColor) {
                updates.highlightColor = '#81C3D7';
                needsUpdate = true;
                console.log('Setting default highlight color: #81C3D7');
            }

            if (!items.highlightHeight) {
                updates.highlightHeight = '20';
                needsUpdate = true;
                console.log('Setting default highlight height: 20px');
            }
            
            if (!items.highlightOpacity) {
                updates.highlightOpacity = '0.4';
                needsUpdate = true;
                console.log('Setting default highlight opacity: 0.4');
            }

            if (needsUpdate) {
                chrome.storage.local.set(updates, () => {
                    console.log('Default highlight settings saved:', updates);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    });
};

/**
 * Create the highlighter UI within a shadow DOM
 */
async function createHighlighter(ctx: ContentScriptContext) {
    // Ensure default values are set first
    await new Promise<void>((resolve) => {
        chrome.storage.local.get(['highlightColor', 'highlightHeight', 'highlightOpacity'], (items) => {
            const updates: Record<string, any> = {};
            
            if (!items.highlightColor) {
                updates.highlightColor = '#81C3D7';
            }
            
            if (!items.highlightHeight) {
                updates.highlightHeight = '20';
            }
            
            if (!items.highlightOpacity) {
                updates.highlightOpacity = '0.4';
            }
            
            if (Object.keys(updates).length > 0) {
                chrome.storage.local.set(updates, resolve);
            } else {
                resolve();
            }
        });
    });
    
    // Now retrieve the values, which should include our defaults if they were missing
    const { highlightColor = '#81C3D7', highlightHeight = '20', highlightOpacity = '0.4' } = 
        await getLocalStorage([
        'highlightColor',
        'highlightHeight',
            'highlightOpacity',
    ]);

    return createShadowRootUi(ctx, {
        name: 'tailwind-shadow-root-highlighter',
        position: 'inline',
        anchor: 'body',
        append: 'first',
        onMount: (uiContainer) => {
            const highlighter = document.createElement('div');
            highlighter.classList.add(
                'absolute',
                'w-full',
                'pointer-events-none',
            );
            highlighter.id = "highlighter";
            
            // Set initial styles for the highlighter with guaranteed default values
            const opacity = parseFloat(highlightOpacity);
            highlighter.style.backgroundColor = hexToRgba(highlightColor, opacity);
            highlighter.style.height = `${highlightHeight}px`;
            
            // Ensure proper stacking context for highest z-index
            highlighter.style.position = 'fixed'; // Change to fixed for better stacking context
            highlighter.style.left = '0';
            highlighter.style.right = '0';
            highlighter.style.zIndex = '2000000'; // Between read mode overlay (1000000) and toolbar/buttons (2147483646)
            highlighter.style.willChange = 'transform'; // Optimize for animations
            highlighter.style.pointerEvents = 'none';
            highlighter.style.borderRadius = '2px'; // Slightly rounded edges
            highlighter.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)'; // Subtle shadow
            
            // Ensure proper layering using CSS transformations
            highlighter.style.transform = 'translateZ(0)'; // Force GPU acceleration and create a new stacking context
            
            // Debug info
            console.log('Highlighter created with:', {
                color: highlightColor,
                opacity: opacity,
                computedColor: hexToRgba(highlightColor, opacity),
                zIndex: highlighter.style.zIndex
            });
            
            // Initially hide until mouse moves
            highlighter.style.display = 'none';
            
            uiContainer.append(highlighter);
        },
    });
}

/**
 * Set up mousemove and mouseleave listeners to position the highlight
 */
function setupEventListeners() {
    // Handler for mouse movement - position the highlighter
    mouseMoveListener = (event: MouseEvent) => {
        if (!highlightElement) return;

        // Position the highlight bar directly at the mouse Y position
        // With fixed positioning, we use clientY instead of pageY/scrollY
        const height = highlightElement.offsetHeight;
        const topPosition = event.clientY - height / 2;

        // Apply styles to make highlight follow cursor smoothly
        highlightElement.style.top = `${topPosition}px`;
        highlightElement.style.display = 'block';
        highlightElement.style.transition = 'top 0.05s ease-out'; // Smooth follow with minimal delay
    };

    // Handler for mouse leaving the page - hide the highlighter
    mouseLeaveListener = () => {
        if (!highlightElement) return;
        highlightElement.style.display = 'none';
    };

    // Handler for mouse entering the page - show the highlighter
    mouseEnterListener = (event: MouseEvent) => {
        if (!highlightElement) return;
        highlightElement.style.display = 'block';
        
        // Position immediately without waiting for mousemove
        const height = highlightElement.offsetHeight;
        const topPosition = event.clientY - height / 2;
        highlightElement.style.top = `${topPosition}px`;
    };

    // Add event listeners with passive: true for better performance
    document.addEventListener('mousemove', mouseMoveListener, { passive: true });
    document.addEventListener('mouseleave', mouseLeaveListener);
    document.addEventListener('mouseenter', mouseEnterListener, { passive: true });
}

/**
 * Remove event listeners for mouse movement
 */
function removeEventListeners() {
    if (mouseMoveListener) {
        document.removeEventListener('mousemove', mouseMoveListener);
        mouseMoveListener = null;
    }
    if (mouseLeaveListener) {
        document.removeEventListener('mouseleave', mouseLeaveListener);
        mouseLeaveListener = null;
    }
    
    // Clean up the mouseenter listener if it exists
    if (mouseEnterListener) {
        document.removeEventListener('mouseenter', mouseEnterListener);
        mouseEnterListener = null;
    }
}

/**
 * Enable the highlighting functionality
 */
async function enableHighlight(ctx: ContentScriptContext) {
    // Create and mount the highlighter UI
    shadowUi = await createHighlighter(ctx);
    shadowUi.mount();
    
    // Get reference to the highlighter element
    highlightElement = shadowUi.shadow.querySelector('#highlighter');
    
    // Start tracking mouse movements
    setupEventListeners();
}

/**
 * Disable the highlighting functionality
 */
function disableHighlight() {
    // Remove the UI
    if (shadowUi) {
        shadowUi.remove();
        shadowUi = null;
    }

    // Stop tracking mouse movements
    removeEventListeners();
    
    // Clear the reference to the highlighter element
    highlightElement = null;
}

