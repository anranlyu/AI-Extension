import { disableReadMode} from './readMode'; // Ensure disableReadMode is exported from your main module (or another common module)
import contentCss from '../content.css?inline';
import { showFloatingToolbar, hideFloatingToolbar } from './renderFloatingToolbar';

export const ReadabilityLabels = ['Very Complex', 'Complex', 'Challenging', 'Somewhat Challenging', 'Moderately Accessible', 'Accessible', 'Highly Accessible'];
// state.ts
export const rewrittenLevels = new Map<number, {
  content: string;

}>();
export let originalHtmlContent = '';


export const renderReadModeOverlay = (
  shadowRoot: ShadowRoot,
  title: string,
  author: string,
  htmlContent: string,
  textContent:string,
  readingLevel: number,
) => {

  originalHtmlContent = htmlContent;
  
  // Prepare the author markup only if needed.
  const authorParagraph =
    author === 'Unknown Author'
      ? ''
      : `<p class="text-lg italic text-gray-600 mb-4">${author}</p>`;

  // Define the shadow DOM's HTML template.
  shadowRoot.innerHTML = `
  
    <style>${contentCss}</style>
    <div id="read-mode-overlay" class="fixed inset-0 bg-white text-gray-900 z-[99999] flex flex-col gap-4 justify-between items-center p-8 overflow-y-auto">
      <button id="read-mode-close" class="absolute top-13 right-8 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 shadow-lg">
        Close
      </button>
      
      <div class="max-w-5xl bg-gray-100 p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold mb-2">${title}</h1>
        <div class="button-container">
          <div id="notice-panel" class="bg-blue-100 border border-blue-300 text-blue-800 p-4 rounded mt-4 hidden flex justify-between items-center">
            <div>This article has been rewritten by AI to a new reading level, which may impact its accuracy.</div>
            <button id="restore-original" class="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200">
              Restore Original
            </button>
          </div>
        </div>
        ${authorParagraph}
        <div id="mainContent" class="text-xl leading-8 flex flex-col gap-4 space-y-4">
          ${htmlContent}
        </div>
      </div>
    </div>
  `;

  // First wait for the DOM to be fully rendered, then show the floating toolbar
  setTimeout(() => {
    showFloatingToolbar(shadowRoot, textContent, readingLevel);
  }, 100);

  // Attach event listener to the close button.
  const closeButton = shadowRoot.getElementById('read-mode-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      hideFloatingToolbar();
      disableReadMode();
    });
  }

  // Attach event listener to the restore original button
  const restoreButton = shadowRoot.getElementById('restore-original');
  if (restoreButton) {
    restoreButton.addEventListener('click', () => {
      const contentElement = shadowRoot.querySelector('#mainContent');
      if (contentElement) {
        contentElement.innerHTML = originalHtmlContent;
        const noticePanel = shadowRoot.getElementById('notice-panel');
        if (noticePanel) {
          noticePanel.classList.add('hidden');
        }
      }
    });
  }
};



