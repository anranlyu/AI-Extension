import { isProbablyReaderable, Readability } from "@mozilla/readability";
import rs from "text-readability";

const isPageReadable = () => {
  return isProbablyReaderable(document);
};

const extractReadableContent = () => {
  if (!isPageReadable()) {
    console.warn('This page is not suitable for Read Mode.');
    return null;
  }

  const article = new Readability(document.cloneNode(true) as Document).parse();
  console.log(article);
  if (!article) return null;

  console.log(rs.fleschKincaidGrade(article.textContent));



  return {
    title: article.title || 'Untitled',
    content: article.content || '',
    excerpt: article.excerpt || '',
    author: article.byline || 'Unknown',
  };
};


export const enableReadMode = async () => {
  const extractedData = extractReadableContent();
  if (!extractedData) {
    console.warn('No readable content found.');
    return;
  }

  displayProcessedText(extractedData.title, extractedData.author, extractedData.content);
  chrome.storage.local.set({ readModeEnabled: true });
};

let originalPageStyle: HTMLStyleElement | null = null;

function hideOriginalPageElements() {
  // Inject a style to hide everything except the read mode container.
  originalPageStyle = document.createElement('style');
  originalPageStyle.id = 'hide-original-page';
  originalPageStyle.textContent = `
    body > :not(#read-mode-shadow-container) {
      display: none !important;
    }
  `;
  document.head.appendChild(originalPageStyle);
}

function restoreOriginalPageElements() {
  // Remove the injected style to restore the original page.
  const style = document.getElementById('hide-original-page');
  if (style) {
    style.remove();
  }
}

export const displayProcessedText = (title: string, author: string, content: string) => {
  // Create or get the container element for our read mode overlay.
  let container = document.getElementById('read-mode-shadow-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'read-mode-shadow-container';
    document.body.appendChild(container);
  }

  // Attach a Shadow DOM to completely isolate our overlay.
  const shadowRoot = container.shadowRoot || container.attachShadow({ mode: 'open' });

  // Process the content to update <img> and <p> tags.
  const processedContent = processContent(content);

  // Inject Tailwind CSS via CDN and our markup into the shadow DOM.
  shadowRoot.innerHTML = `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" />
    <div id="read-mode-overlay" class="fixed inset-0 bg-white text-gray-900 z-[99999] flex flex-col gap-4 items-center justify-start p-8 overflow-y-auto">
      <button id="read-mode-close" class="absolute top-6 right-8 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 shadow-lg">
        Close
      </button>
      <div class="max-w-5xl bg-gray-100 p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold mb-2">${title}</h1>
        <p class="text-lg italic text-gray-600 mb-4">${author}</p>
        <div class="text-xl leading-8 flex flex-col gap-4">
          ${processedContent}
        </div>
      </div>
    </div>
  `;

  // Add event listener for the close button inside the shadow DOM.
  const closeButton = shadowRoot.getElementById('read-mode-close');
  if (closeButton) {
    closeButton.addEventListener('click', disableReadMode);
  }

  // Hide the original page elements so that no popups or logos interfere.
  hideOriginalPageElements();
};

export const disableReadMode = () => {
  // Remove the shadow container that holds the read mode overlay.
  const container = document.getElementById('read-mode-shadow-container');
  if (container) {
    container.remove();
  }
  // Restore the original page elements.
  restoreOriginalPageElements();
};

/**
 * Process the given HTML string by modifying image and paragraph tags.
 * - For <img> tags: Removes inline styles and applies Tailwind classes to control sizing.
 * - For <p> tags: Adds extra gap between paragraphs and increased line height.
 */
function processContent(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Process all images.
  const images = tempDiv.querySelectorAll('img');
  images.forEach((img) => {
    img.removeAttribute('style');
    // Set fixed width, auto height, and add styling.
    img.classList.add('w-[400px]', 'h-auto', 'object-contain', 'rounded', 'my-4');
  });

  // Process all paragraphs.
  const paragraphs = tempDiv.querySelectorAll('p');
  paragraphs.forEach((p) => {
    // Add extra gap between paragraphs and increased line height.
    p.classList.add('mb-4', 'leading-8');
  });

  return tempDiv.innerHTML;
}









chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'update_read_mode') {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    message.readModeEnabled ? enableReadMode() : disableReadMode();
  }
});
