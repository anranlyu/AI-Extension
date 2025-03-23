import { isProbablyReaderable, Readability} from "@mozilla/readability";
import { renderReadModeOverlay } from "./readModeOverlay";
// import rs from 'text-readability';
import { getFleschReadingEase } from "./readability";
import { showFloatingOverlay } from "../translate";


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
  let textContent = '';
  let article: any;
  try {
        if (!isPageReadable()) {
          showFloatingOverlay('This page is not supported for Read Mode.');
          return null;
        }
        const url = window.location.href
        article = await fetchContent(url);
        // Switch to Readability
      if (article === null || !article.content?.trim()) {
          console.log('Switch to Readability')
          article = new Readability(document.cloneNode(true) as Document).parse();
          textContent = article.textContent;
        }
    
      console.log(article);
        
    } catch (error) {
      // Switch to Readability;
      article = new Readability(document.cloneNode(true) as Document).parse();
      textContent = article?.textContent;
    }
    textContent = new DOMParser().parseFromString(article.content, 'text/html').body.textContent || "";
    
    

      return {
          title: article.title?.trim() || 'Untitled',
          htmlContent: article.content?.trim() || 'No readable content found.',
          author: article.author?.trim() || 'Unknown Author',
          textContent:textContent
      };
};

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

export const updateReadModeContent = (newText: string) => {
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

  // Locate the element that holds the main article content.
  // This must match the same selector in your readModeOverlay, i.e., the `<div>` with classes:
  //   text-xl leading-8 flex flex-col gap-4
  const contentElement = shadowRoot.querySelector('#mainContent');

  if (!contentElement) {
    console.warn('Content element not found inside shadow root.');
    return;
  }

  // Replace its contents with the new text
  const formattedText = newText.replace(/\n/g, '<br>');
  contentElement.innerHTML = formattedText;


  const rewriteBtn = shadowRoot.getElementById('rewrite-btn');
  if (rewriteBtn) {
    const noticePanel = document.createElement('div');
    // Tailwind CSS classes for styling the notice panel.
    noticePanel.className = 'bg-blue-100 border border-blue-300 text-blue-800 p-4 rounded mt-4';
    noticePanel.innerText = 'The text has been rewritten by AI.';
    
    // Replace the button with the notice panel in its parent container.
    rewriteBtn.parentNode?.replaceChild(noticePanel, rewriteBtn);
  }
  console.log(rewriteBtn);
};




