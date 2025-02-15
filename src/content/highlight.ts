const getOrCreateHighlightElement = () => {
  let highlightElement = document.querySelector('#highlighter') as HTMLDivElement;
  if (!highlightElement) {
      highlightElement = document.createElement('div');
      highlightElement.id = 'highlighter';
    highlightElement.className = [
      'absolute', 
      'w-full', 
      'h-[20px]', 
      'bg-yellow-200/50', 
      'pointer-events-none', 
      'z-[99999]' 
    ].join(' ');
    
    document.body.appendChild(highlightElement);
  }
  return highlightElement;
};


let mouseMoveListener: (event: MouseEvent) => void;
let mouseLeaveListener: () => void;

const setupEventListeners = () => {
  mouseMoveListener = (event: MouseEvent) => {
    const highlight = getOrCreateHighlightElement();
    const height = highlight.offsetHeight;
    const topPosition = event.clientY + window.scrollY - height/2;
    highlight.style.top = `${topPosition}px`;
    highlight.style.display = 'block';
  };

  mouseLeaveListener = () => {
    const highlight = getOrCreateHighlightElement();
    highlight.style.display = 'none';
  };

  document.addEventListener('mousemove', mouseMoveListener);
  document.addEventListener('mouseleave', mouseLeaveListener);
};

const removeEventListeners = () => {
  if (mouseMoveListener) {
    document.removeEventListener('mousemove', mouseMoveListener);
  }
  if (mouseLeaveListener) {
    document.removeEventListener('mouseleave', mouseLeaveListener);
  }
};


export const enableHighlight = () => {
  chrome.storage.local.get(['highlightColor', 'highlightHeight'], (result) => {
    const highlightElement = getOrCreateHighlightElement();
    
    if (result.color) {
      highlightElement.style.backgroundColor = hexToRgba(result.color, 0.4);
    }

    if (result.height) {
      highlightElement.style.height = `${result.height}px`;
    }

    highlightElement.style.visibility = 'visible';
    setupEventListeners();
  });
};


export const disableHighlight = () => {
    console.log('disablehighlight called');
  const highlightElement = document.querySelector('#highlighter');
  if (highlightElement) {
    highlightElement.remove();
  }
  removeEventListeners();
};





function hexToRgba(hex: string, alpha: number): string {
  const sanitizedHex = hex.replace(/^#/, '');
  const r = parseInt(sanitizedHex.substring(0, 2), 16);
  const g = parseInt(sanitizedHex.substring(2, 4), 16);
  const b = parseInt(sanitizedHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}