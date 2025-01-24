console.log('content has been injected');
const parseHtml = (selector: string): string => {
  let selectorElement: HTMLElement | null;
  if (selector) {
    selectorElement = document.querySelector(selector);
    if (!selectorElement) return '';
  } else {
    selectorElement = document.documentElement;
  }

  const parser = new DOMParser();
  const clonedHtml = selectorElement.cloneNode(true) as HTMLElement;

  // Remove unwanted elements
  clonedHtml
    .querySelectorAll(
      'script, style, [hidden], [aria-hidden="true"], .screen-reader-text'
    )
    .forEach((el) => el.remove());

  const doc = parser.parseFromString(clonedHtml.outerHTML, 'text/html');
  return doc.body.innerText.replace(/\s+/g, ' ').trim();
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SUMMARY') {
    console.log('Received summarized text:', message.summary);
  }
});

const extractedText = parseHtml('body');
// chrome.runtime.sendMessage({ type: 'EXTRACTED_TEXT', text: extractedText });
chrome.runtime.sendMessage({ type: 'EXTRACTED_TEXT', text: extractedText });
