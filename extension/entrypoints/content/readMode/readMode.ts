import { isProbablyReaderable, Readability} from "@mozilla/readability";
import { ReadabilityLabels, renderReadModeOverlay, rewrittenLevels } from "./readModeOverlay";
// import rs from 'text-readability';
import { getFleschReadingEase } from "./readability";
import { showFloatingOverlay } from "../translate";

/**
 * Checks if the current page is readable using Mozilla's Readability
 * @returns boolean indicating if the page is likely readable
 */
const isPageReadable = () => {
  return isProbablyReaderable(document);
};

/**
 * Fetches content from the backend API with fallback to Readability
 * @param url The URL to fetch content from
 * @returns Promise containing the article data or null if both methods fail
 */
const fetchContent = async (url: string) => {
  try {
    // Try backend API first
    const res = await fetch(`http://localhost:5000/parse?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    
    // If backend returns valid content, use it
    if (data && data.content?.trim()) {
      return data;
    }
  } catch (error) {
    console.warn('Backend API failed, falling back to Readability:', error);
  }

  // Fallback to Readability
  try {
    const article = new Readability(document.cloneNode(true) as Document).parse();
    if (article) {
      return {
        title: article.title,
        content: article.content,
        author: article.byline,
        textContent: article.textContent
      };
    }
  } catch (error) {
    console.error('Readability fallback failed:', error);
  }

  return null;
};

/**
 * Extracts readable content from the current page
 * @returns Promise containing the extracted content or null if extraction fails
 */
const extractReadableContent = async () => {
  if (!isPageReadable()) {
    showFloatingOverlay('This page is not supported for Read Mode.');
    return null;
  }

  const url = window.location.href;
  const article = await fetchContent(url);
  
  if (!article) {
    showFloatingOverlay('Unable to extract readable content from this page.');
    return null;
  }

  const textContent = new DOMParser()
    .parseFromString(article.content, 'text/html')
    .body.textContent || "";

  return {
    title: article.title?.trim() || 'Untitled',
    htmlContent: article.content?.trim() || 'No readable content found.',
    author: article.author?.trim() || 'Unknown Author',
    textContent: textContent
  };
};

/**
 * Enables read mode on the current page by:
 * 1. Hiding page scroll
 * 2. Extracting readable content
 * 3. Calculating reading level
 * 4. Displaying processed content
 * 5. Saving read mode state
 */
export const enableReadMode = async () => {
  document.body.style.overflow = 'hidden';
  const extractedData = await extractReadableContent();
  if (!extractedData) {
    console.warn('No readable content found.');
    return;
  }
  const readingLevel = getFleschReadingEase(extractedData.textContent);
  displayProcessedText(extractedData.title, extractedData.author, extractedData.htmlContent, extractedData.textContent,readingLevel);
  chrome.storage.local.set({ readModeEnabled: true });
};

/**
 * Displays processed text in a shadow DOM container with proper styling
 * @param title - The article title
 * @param author - The article author
 * @param rawHtmlContent - The raw HTML content to be processed
 * @param textContent - The plain text content
 * @param readingLevel - The calculated reading level
 */
export const displayProcessedText = (title: string, author: string, rawHtmlContent: string, textContent:string,readingLevel:number) => {
  let container = document.getElementById('read-mode-shadow-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'read-mode-shadow-container';
    document.body.appendChild(container);
  }

  const shadowRoot = container.shadowRoot || container.attachShadow({ mode: 'open' });
  const htmlContent = processContent(rawHtmlContent);

  // Render the overlay using the separate module.
  renderReadModeOverlay(shadowRoot, title, author, htmlContent,textContent,readingLevel);
};

/**
 * Disables read mode by:
 * 1. Removing the shadow container
 * 2. Restoring page scroll
 * 3. Saving read mode state
 */
export const disableReadMode = () => {
  // Remove the shadow container that holds the read mode overlay.
  const container = document.getElementById('read-mode-shadow-container');
  if (container) {
    container.remove();
  }

  chrome.storage.local.set({ readModeEnabled: false });

  document.body.style.overflow = '';
};

/**
 * Process the given HTML string by modifying image and paragraph tags.
 * - For <img> tags: Removes inline styles and applies Tailwind classes to control sizing.
 * - For <p> tags: Adds extra gap between paragraphs and increased line height.
 * - For <br> tags: Converts to Tailwind-spaced breaks
 * @param html - The HTML string to process
 * @returns Processed HTML string with Tailwind classes applied
 */
function processContent(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Add Tailwind classes to all paragraphs
  const paragraphs = tempDiv.querySelectorAll('p');
  paragraphs.forEach(p => {
    p.classList.add('mb-4', 'leading-7'); // Tailwind spacing classes
  });

  // Convert <br> tags to Tailwind-spaced breaks
  const brElements = tempDiv.querySelectorAll('br');
  brElements.forEach(br => {
    br.classList.add('block', 'h-4'); // Creates 1rem vertical space
  });

  // Process images (existing logic)
  const images = tempDiv.querySelectorAll('img');
  images.forEach(img => {
    img.classList.add('max-w-full', 'h-auto', 'my-4'); // Tailwind image classes
  });

  return tempDiv.innerHTML;
}

/**
 * Updates the read mode content with new text and updates UI elements accordingly
 * @param newText - The new text content to display
 * @param selectedLevel - The selected readability level
 */
export const updateReadModeContent = (newText: string, selectedLevel: number) => {
  const container = document.getElementById('read-mode-shadow-container');
  if (!container) {
    console.warn('Read Mode container not found.');
    return;
  }

  const shadowRoot = container.shadowRoot;
  if (!shadowRoot) {
    console.warn('Shadow root not found.');
    return;
  }

  const processedText = processContent(
    newText.replace(/\n/g, '<br>') // Preserve single newlines
  );

  // Update state with new rewritten content
  rewrittenLevels.set(selectedLevel, {
    content: processedText
  });

  // Update displayed content
  const contentElement = shadowRoot.querySelector('#mainContent');
  if (contentElement) {
    contentElement.innerHTML = processedText;
  }

  // Update UI elements
  
  const noticePanel = shadowRoot.getElementById('notice-panel');

  if (noticePanel) {
    // Only hide button/show panel for the CURRENTLY ACTIVE level
    
    noticePanel.classList.remove('hidden');
  }
};



