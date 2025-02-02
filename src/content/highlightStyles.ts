export const injectHighlightStyles = () => {
  if (document.querySelector('style[data-highlight-styles]')) {
    console.log('Highlight styles already injected.');
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-highlight-styles', 'true');
  style.textContent = `
    .replaced-text {
      background-color: #e3f2fd;
      padding: 2px 4px;
      border-radius: 3px;
      border: 1px solid #90caf9;
    }

    .highlight-animation {
      animation: highlight-fade 2s ease-out;
    }

    @keyframes highlight-fade {
      0% {
        background-color: #fff176;
      }
      100% {
        background-color: #e3f2fd;
      }
    }
  `;
  document.head.appendChild(style);
};