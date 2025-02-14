// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Parser from '@postlight/parser'

const extractReadableContent = async () => {
    try {

        const article = await Parser.parse();

        console.log('Extracted article:', article);

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
}

export const displayProcessedText = (title: string, author: string, content: string) => {
  let overlay = document.getElementById('read-mode-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'read-mode-overlay';
    overlay.className = `
    fixed inset-0 bg-white bg-opacity-95 text-gray-900 
    z-[99999] flex flex-col gap-4 items-center justify-start 
    p-8 overflow-y-auto
    `;

    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.className = `
      absolute top-6 right-8 px-4 py-2 bg-red-600 text-gray-900 rounded-md
      hover:bg-red-700 transition duration-200 shadow-lg
    `;
    closeButton.onclick = disableReadMode;

    const articleContainer = document.createElement('div');
    articleContainer.className = 'max-w-3xl bg-gray-100 p-6 rounded-lg shadow-lg';

    articleContainer.innerHTML = `
      <h1 class="text-2xl font-bold mb-2">${title}</h1>
      <p class="text-sm italic text-gray-600 mb-4">${author}</p>
      <div class="text-lg leading-7 flex flex-col gap-4">${content}</div>
    `;

    overlay.appendChild(closeButton);
    overlay.appendChild(articleContainer);
    document.body.appendChild(overlay);
  }
};


export const disableReadMode = () => {
  document.getElementById('read-mode-overlay')?.remove();
  chrome.storage.local.set({ readModeEnabled: false });
};


chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'update_read_mode') {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    message.readModeEnabled ? enableReadMode() : disableReadMode();
  }
});