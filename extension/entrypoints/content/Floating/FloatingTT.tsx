import React, { useEffect } from 'react';
import { useFloating, offset, flip, shift } from '@floating-ui/react';

interface FloatingTooltipProps {
  content: React.ReactNode;
  referenceElement: HTMLElement | null;
  onClose: () => void;
}

const FloatingTooltip: React.FC<FloatingTooltipProps> = ({
  content,
  referenceElement,
  onClose,
}) => {
  const { x, y, strategy, reference, floating } = useFloating({
    middleware: [offset(8), flip(), shift({ padding: 5 })],
  });

  // Attach the external reference element.
  useEffect(() => {
    if (referenceElement) {
      reference(referenceElement);
    }
  }, [referenceElement, reference]);

  return (
    <div
      ref={floating}
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
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: '#666',
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
