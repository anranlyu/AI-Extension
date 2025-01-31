export const injectHighlightStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .replaced-text {
      background-color: #e3f2fd; /* Light blue background */
      padding: 2px 4px;
      border-radius: 3px;
      border: 1px solid #90caf9; /* Light blue border */
    }

    .highlight-animation {
      animation: highlight-fade 2s ease-out;
    }

    @keyframes highlight-fade {
      0% {
        background-color: #fff176; /* Bright yellow for initial highlight */
      }
      100% {
        background-color: #e3f2fd; /* Back to light blue */
      }
    }
  `;
  document.head.appendChild(style);
};