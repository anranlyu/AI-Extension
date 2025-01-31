let originalBodyHTML: string | null = null; // Store the original HTML of the page

export const enableReadMode = () => {
  // Save the original HTML of the page
  originalBodyHTML = document.body.innerHTML;

  // Extract all text content from the page
  const textContent = document.body.innerText;

  // Create a clean container for the text
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

  // Add the extracted text to the container
  readModeContainer.textContent = textContent;

  // Clear the body and append the clean container
  document.body.innerHTML = '';
  document.body.appendChild(readModeContainer);
};

export const disableReadMode = () => {
  if (originalBodyHTML) {
    // Restore the original HTML of the page
    document.body.innerHTML = originalBodyHTML;
    originalBodyHTML = null;
  }
};