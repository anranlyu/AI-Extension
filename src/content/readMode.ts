let originalBodyHTML: string | null = null;

// Extract relevant text from specific elements
const extractRelevantText = (): string => {
  const relevantElements = document.querySelectorAll('article, main, section, p, h1, h2, h3, h4, h5, h6');
  let extractedText = '';

  relevantElements.forEach((element) => {
    extractedText += element.textContent + '\n';
  });

  return extractedText.trim();
};

// Display processed text from LLM in the read mode container
export const displayProcessedText = (processedText: string) => {
  const readModeContainer = document.createElement('div');
  readModeContainer.id = 'read-mode-container';
  readModeContainer.style.cssText = `
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
    font-size: 18px;
    line-height: 1.6;
    color: #333;
    background-color: #f9f9f9;
  `;

  // Add the processed text to the container
  readModeContainer.innerHTML = processedText;

  // Clear the body and append the read mode container
  document.body.innerHTML = '';
  document.body.appendChild(readModeContainer);
};

export const enableReadMode = () => {
  // Save the original HTML of the page
  originalBodyHTML = document.body.innerHTML;

  // Extract relevant text
  const extractedText = extractRelevantText();
  console.log('extrat text:'+extractedText)

  // Send the extracted text to the background script for LLM processing
  chrome.runtime.sendMessage(
    { type: 'process_text_for_read_mode', text: extractedText }
  );
};

export const disableReadMode = () => {
  if (originalBodyHTML) {
    // Restore the original HTML of the page
    document.body.innerHTML = originalBodyHTML;
    originalBodyHTML = null;
  }
};