import { disableReadMode} from './readMode'; // Ensure disableReadMode is exported from your main module (or another common module)
import contentCss from '../content.css?inline';

const ReadabilityLabels = ['Very Complex', 'Complex', 'Challenging', 'Somewhat Challenging', 'Moderately Accessible', 'Accessible', 'Highly Accessible'];

export const renderReadModeOverlay = (
  shadowRoot: ShadowRoot,
  title: string,
  author: string,
  htmlContent: string,
  textContent:string,
  numOptions: number,
) => {
  // Prepare the author markup only if needed.
  const authorParagraph =
    author === 'Unknown Author'
      ? ''
      : `<p class="text-lg italic text-gray-600 mb-4">${author}</p>`;
  
  let optionsHTML = '';
  for (let i = numOptions; i <= ReadabilityLabels.length - 1; i++) {
    if (i == numOptions) {
      optionsHTML += `<option value="${i}">(current level)${ ReadabilityLabels[i]}</option>`;
    } else {

      optionsHTML += `<option value="${i}">${ReadabilityLabels[i]}</option>`;
    }
  }

  // Define the shadow DOM's HTML template.
  shadowRoot.innerHTML = `
  
    <style>${contentCss}</style>
    <div id="read-mode-overlay" class="fixed inset-0 bg-white text-gray-900 z-[99999] flex flex-col gap-4 justify-between items-center p-8 overflow-y-auto">
      <button id="read-mode-close" class="absolute top-13 right-8 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 shadow-lg">
        Close
      </button>
      
      <div class="max-w-5xl bg-gray-100 p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold mb-2">${title}</h1>
        <div class="flex justify-between items-center w-full mb-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <p class="font-normal text-gray-700 dark:text-gray-400">AI Reading Level Adjustment</p>
          <select id="read-mode-dropdown" class="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" >
            ${optionsHTML}
          </select>
        </div>
        <button id="rewrite-btn" class="flex justify-center items-center text-white bg-blue-600 w-full pt-4 pb-4 mb-4 rounded-lg hidden"> Rewrite with AI</button>
        ${authorParagraph}
        <div id="mainContent" class="text-xl leading-8 flex flex-col gap-4">
          ${htmlContent}
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
  const dropdown = shadowRoot.getElementById('read-mode-dropdown') as HTMLSelectElement;
  const rewriteButton = shadowRoot.getElementById('rewrite-btn') as HTMLButtonElement;

  if (dropdown && rewriteButton) {
    // For a select element, consider using 'change' rather than 'click'.
    dropdown.addEventListener('change', () => {
      const selectedValue = dropdown.value;
      
      console.log('Selected value:', dropdown.value);
      // Add any additional logic you need here.
      if (parseInt(selectedValue) !== numOptions) {
        rewriteButton.classList.remove('hidden');
      } else {
        rewriteButton.classList.add('hidden');
      }
    });

    //Add listener to rewriteButton
    rewriteButton.addEventListener('click', () => {
      const selectedValue = dropdown.value;
      rewriteButton.innerHTML = `
        <span>The AI is writting</span>
        <svg class="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      `;
      rewriteButtonOnclick(textContent, parseInt(selectedValue));
    })
  }
};



const rewriteButtonOnclick = (textContent: string, selectedLevel: number) => {
  chrome.runtime.sendMessage({
    type: 'readMode_text',
    text: textContent,
    selectedLevel: selectedLevel,
  });
};


