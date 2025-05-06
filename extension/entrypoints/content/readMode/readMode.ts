import { isProbablyReaderable, Readability} from "@mozilla/readability";
import { ReadabilityLabels, renderReadModeOverlay, rewrittenLevels, unsupportedReadModeOverlay } from "./readModeOverlay";
// import rs from 'text-readability';
import { getFleschReadingEase } from "./readability";
import { hideFloatingToolbar } from './renderFloatingToolbar'; // Import hideFloatingToolbar

// Add a flag to track rendering state
let isReadModeUIRendered = false;

/**
 * Checks if the current page is readable using Mozilla's Readability
 * @returns boolean indicating if the page is likely readable
 */
const isPageReadable = () => {
  return isProbablyReaderable(document);
};

/**
 * Fetches and parses content using backend or Readability fallback
 * @param url - The URL of the page to parse
 * @returns Parsed content object or null
 */
const fetchContent = async (url: string) => {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5001' 
      : 'https://ai-extension-5vii.onrender.com';
    
    // Try backend API first
    const res = await fetch(`${baseUrl}/parse?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    
    // If backend returns valid content, use it
    if (data && data.content?.trim() && data.content.includes("<p>") && data.word_count > 20) {
      return data;
    }
  } catch (error) {
    console.warn('Backend API failed, falling back to Readability:', error);
  }

  // Fallback to Readability
  try {
    console.log("Falling back to Readability");
    const article = new Readability(document.cloneNode(true) as Document).parse();
    if (article && article.content && article.content.includes("<p>")) {
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
export const extractReadableContent = async () => {
  if (!isPageReadable()) {
    console.warn('This page is not supported for Read Mode.');
    return null;
  }

  const url = window.location.href;
  const article = await fetchContent(url);
  
  if (!article) {
    console.warn('Unable to extract readable content from this page.');
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
 * 1. Checking if already rendered
 * 2. Hiding page scroll
 * 3. Extracting readable content
 * 4. Calculating reading level
 * 5. Displaying processed content
 */
export const enableReadMode = async () => {
  // Check if already enabled/rendered to prevent double execution
  // Check specifically for the overlay element within the shadow root
  if (isReadModeUIRendered && document.getElementById('read-mode-shadow-container')?.shadowRoot?.getElementById('read-mode-overlay')) {
      console.log("[readMode.ts] enableReadMode called but UI already rendered. Skipping.");
      return;
  }
  console.log("[readMode.ts] Enabling Read Mode UI...");

  document.body.style.overflow = 'hidden';
  const extractedData = await extractReadableContent();
  
  // Create container for shadow DOM regardless of content extraction success
  let container = document.getElementById('read-mode-shadow-container');
  if (!container) {
    console.log("[readMode.ts] Creating shadow container.");
    container = document.createElement('div');
    container.id = 'read-mode-shadow-container';
    document.body.appendChild(container);
  } else {
    console.log("[readMode.ts] Found existing shadow container.");
  }
  
  const shadowRoot = container.shadowRoot || container.attachShadow({ mode: 'open' });
  
  // Clear previous content just in case
  shadowRoot.innerHTML = ''; 
  hideFloatingToolbar(); // Ensure any orphaned toolbar is hidden before rendering new content

  if (!extractedData) {
    // Display "not supported" message when content extraction fails
    console.warn('No readable content found for Read Mode.');
    unsupportedReadModeOverlay(shadowRoot);
    isReadModeUIRendered = true; // Mark as rendered even for unsupported

  } else {
    // Process readable content as normal
    console.log("[readMode.ts] Rendering Read Mode content.");
    const readingLevel = getFleschReadingEase(extractedData.textContent);
    const htmlContent = processContent(extractedData.htmlContent);
  
    // Render the overlay using the separate module
    renderReadModeOverlay(
      shadowRoot, 
      extractedData.title, 
      extractedData.author, 
      htmlContent, 
      extractedData.textContent, 
      readingLevel
    );
    isReadModeUIRendered = true; // Mark as rendered
  }
};

/**
 * Disables read mode by:
 * 1. Hiding the floating toolbar
 * 2. Removing the shadow container
 * 3. Restoring page scroll
 * 4. Resetting the rendered flag
 */
export const disableReadMode = () => {
  const container = document.getElementById('read-mode-shadow-container');
  if (container) {
      // Explicitly hide the toolbar FIRST to ensure its cleanup runs
      console.log("[readMode.ts] Hiding floating toolbar before removing container.");
      hideFloatingToolbar(); 
      
      console.log("[readMode.ts] Removing shadow container.");
      container.remove();
  }
  document.body.style.overflow = '';
  isReadModeUIRendered = false; // Reset the flag
  console.log("[readMode.ts] Disabled Read Mode UI.");
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
 */
export const updateReadModeContent = (newText: string) => {
  // console.log('[updateReadModeContent] Called with newText:', newText); // Remove log

  const container = document.getElementById('read-mode-shadow-container');
  if (!container) {
    console.warn('[updateReadModeContent] Read Mode container not found.'); // Keep warn
    return;
  }

  const shadowRoot = container.shadowRoot;
  if (!shadowRoot) {
    console.warn('[updateReadModeContent] Shadow root not found.'); // Keep warn
    return;
  }

  // Check if newText is valid before processing
  if (typeof newText !== 'string' || newText.trim() === '') {
    console.warn('[updateReadModeContent] Received invalid or empty text. Aborting update.'); // Keep warn
    return;
  }

  const processedText = processContent(
    newText.replace(/\n/g, '<br>') // Preserve single newlines
  );
  // console.log('[updateReadModeContent] Processed text:', processedText); // Remove log

  // Update displayed content
  const contentElement = shadowRoot.querySelector('#mainContent');
  if (contentElement) {
    // console.log('[updateReadModeContent] Found #mainContent element. Updating innerHTML...'); // Remove log
    contentElement.innerHTML = processedText;
    // console.log('[updateReadModeContent] #mainContent innerHTML updated.'); // Remove log
  } else {
    console.warn('[updateReadModeContent] #mainContent element not found!'); // Keep warn
  }

  // Update UI elements
  const noticePanel = shadowRoot.getElementById('notice-panel');
  if (noticePanel) {
    // console.log('[updateReadModeContent] Making notice panel visible.'); // Remove log
    noticePanel.classList.remove('hidden');
  } else {
    console.warn('[updateReadModeContent] #notice-panel element not found.'); // Keep warn
  }
};



