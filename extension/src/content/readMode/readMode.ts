import { isProbablyReaderable, Readability} from "@mozilla/readability";
import { renderReadModeOverlay } from "./readModeOverlay";


const isPageReadable = () => {
  return isProbablyReaderable(document);
};

const fetchContent = async (url:string) => {
  const res = await fetch(`http://localhost:5000/parse?url=${encodeURIComponent(url)}`)
  const data = await res.json();
  if (data.error) {
    return null;
  }
  return data;
}

const extractReadableContent = async () => {
  try {
        if (!isPageReadable()) {
          console.warn('This page is not suitable for Read Mode.');
          return null;
        }
        const url = window.location.href
        let article = await fetchContent(url);

    
        // Switch to Readability
        if (article === null || !article.content?.trim()) {
          article = new Readability(document.cloneNode(true) as Document).parse();
        }
        
      

        return {
            title: article.title?.trim() || 'Untitled',
            content: article.content?.trim() || 'No readable content found.',
            author: article.author?.trim() || 'Unknown Author',
        };
    } catch (error) {
        console.error('Error extracting content:', error);
        return null;
    }
};

export const enableReadMode = async () => {
  const extractedData = await extractReadableContent();
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
  let container = document.getElementById('read-mode-shadow-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'read-mode-shadow-container';
    document.body.appendChild(container);
  }



  const shadowRoot = container.shadowRoot || container.attachShadow({ mode: 'open' });
  const processedContent = processContent(content);

  // Render the overlay using the separate module.
  renderReadModeOverlay(shadowRoot, title, author, processedContent,7);

  hideOriginalPageElements();
};


export const disableReadMode = () => {
  // Remove the shadow container that holds the read mode overlay.
  const container = document.getElementById('read-mode-shadow-container');
  if (container) {
    container.remove();
  }

  chrome.storage.local.get(
    ['readModeEnabled'], () => {
      chrome.storage.local.set({ readModeEnabled: false })
  })

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
    img.removeAttribute('width');
    // Set fixed width, auto height, and add styling.
    img.classList.add('custom-img-size');
  });

  // Process all paragraphs.
  const paragraphs = tempDiv.querySelectorAll('p');
  paragraphs.forEach((p) => {
    // Add extra gap between paragraphs and increased line height.
    p.classList.add('mb-8', 'leading-8');
  });

  return tempDiv.innerHTML;
}

