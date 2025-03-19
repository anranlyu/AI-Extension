// FloatingTooltip.tsx
import React, { useEffect } from 'react';
import { useFloating, offset, flip, shift } from '@floating-ui/react';

interface FloatingTooltipProps {
  content: React.ReactNode;
  referenceElement: HTMLElement | null;
  onClose: () => void;
  theme?: 'light' | 'dark';
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
        background: 'rgba(255, 255, 255, 0.95)',
        color: '#333',
        padding: '1.5rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
        fontSize: '16px',
        lineHeight: '1.5',
        zIndex: 99999,
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
          color: '#666',
          animation: 'fadeIn 0.2s ease-in-out',
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = '#000')}
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
