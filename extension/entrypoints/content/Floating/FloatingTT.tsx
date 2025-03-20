// FloatingTooltip.tsx
import React, { useEffect } from 'react';
import { useFloating, offset, flip, shift } from '@floating-ui/react';

interface FloatingTooltipProps {
  content: React.ReactNode;
  referenceElement: HTMLElement | null;
  onClose: () => void;
  theme?: 'light' | 'dark'; // for future preference
}

const FloatingTooltip: React.FC<FloatingTooltipProps> = ({
  content,
  referenceElement,
  onClose,
}) => {
  const { x, y, strategy, refs, update } = useFloating({
    middleware: [offset(8), flip(), shift({ padding: 5 })],
  });

  // Attach the external reference element.
  useEffect(() => {
    if (referenceElement) {
      refs.setReference(referenceElement);
    }
  }, [referenceElement, refs]);


  return (
    <div
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        background: 'rgba(13, 170, 142, 0.90)', // Persian green background
        color: '#fff', // White text
        padding: '1.5rem',
        border: '3px solid #5563A2', // Thicker border with libery blue
        borderRadius: '8px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)', // Enhanced shadow
        fontSize: '16px',
        lineHeight: '1.5',
        zIndex: 99999,
        maxWidth: '400px', // limit width for better readability
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: '#fff', // White color for the close button to match text
          animation: 'fadeIn 0.2s ease-in-out',
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = '#e0e0e0')} // Slightly darker on hover
        onMouseOut={(e) => (e.currentTarget.style.color = '#666')}
      >
        ✕
      </button>
      <div style={{ marginTop: '10px' }}>
        {content}
      </div>
    </div>
  );
};

export default FloatingTooltip;
