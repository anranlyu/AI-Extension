import { disableReadMode } from './readMode'; // Ensure disableReadMode is exported from your main module (or another common module)
import contentCss from '../content.css?inline';

export const renderReadModeOverlay = (
  shadowRoot: ShadowRoot,
  title: string,
  author: string,
  processedContent: string,
  numOptions: number,
) => {
  // Prepare the author markup only if needed.
  const authorParagraph =
    author === 'Unknown Author'
      ? ''
      : `<p class="text-lg italic text-gray-600 mb-4">${author}</p>`;
  
  let optionsHTML = '';
  for (let i = 1; i <= numOptions; i++) {
    optionsHTML += `<option value="option${i}">Option ${i}</option>`;
  }

  // Define the shadow DOM's HTML template.
  shadowRoot.innerHTML = `
    <style>${contentCss}</style>
    <div id="read-mode-overlay" class="fixed inset-0 bg-white text-gray-900 z-[99999] flex flex-col gap-4 justify-between items-center p-8 overflow-y-auto">
      <button id="read-mode-close" class="absolute top-6 right-8 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 shadow-lg">
        Close
      </button>
      
      <div class="max-w-5xl bg-gray-100 p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold mb-2">${title}</h1>
        <div class="flex justify-between w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <p class="font-normal text-gray-700 dark:text-gray-400">AI Reading Level Adjustment</p>
          <select id="read-mode-dropdown" class="inline-flex gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
            ${optionsHTML}
          </select>
        </div>
        ${authorParagraph}
        <div class="text-xl leading-8 flex flex-col gap-4">
          ${processedContent}
        </div>
      </div>
    </div>
  `;

  // Attach event listener to the close button.
  const closeButton = shadowRoot.getElementById('read-mode-close');
  if (closeButton) {
    closeButton.addEventListener('click', disableReadMode);
  }

  // Attach event listener(s) to the select element.
  const dropdown = shadowRoot.getElementById('read-mode-dropdown');
  if (dropdown) {
    // For a select element, consider using 'change' rather than 'click'.
    dropdown.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement;
      console.log('Selected value:', target.value);
      // Add any additional logic you need here.
    });
  }
};