// FloatingTooltip.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useFloating, offset, flip, shift } from '@floating-ui/react';

interface FloatingTooltipProps {
  content: React.ReactNode;
  referenceElement: HTMLElement | null;
  onClose: () => void;
  theme?: 'light' | 'dark'; // for future preference?
}

const FloatingTooltip: React.FC<FloatingTooltipProps> = ({
  content,
  referenceElement,
  onClose,
}) => {
  const { x, y, strategy, refs, update } = useFloating({
    middleware: [offset(8), flip(), shift({ padding: 5 })],
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  /* Resize?
  const [resize, setResize] = useState({width: 500, height: 200});
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  useEffect(() => {
    if (!isDragging && !isResizing && x !== null && y !== null) {
      setPosition({ x, y });
    }
  }, [x, y, isDragging, isResizing]);
*/

  useEffect(() => {
    if (!isDragging && x !== null && y !== null) {
      setPosition({ x, y });
    }
  }, [x, y, isDragging]);

  // Attach the external reference element.
  useEffect(() => {
    if (referenceElement) {
      refs.setReference(referenceElement);
    }
  }, [referenceElement, refs]);

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      e.preventDefault(); // Prevent text selection during drag
    };
    
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (isDragging) {
          setPosition({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          });
        }
      },
      [isDragging, dragOffset]
    );
    
    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);
    
    // Add/remove event listeners
    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
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
        // width: '50%',
        border: '3px solid #5563A2', // Thicker border with libery blue
        borderRadius: '8px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
        fontSize: '16px',
        lineHeight: '1.5',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none', // Prevent text selection during drag
        overflow: 'auto',
        zIndex: 99999,
        maxWidth: '400px', // limit width for better readability
      }}
      onMouseDown={handleMouseDown}
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
