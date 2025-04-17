import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  // Use refs to store state that shouldn't trigger re-renders
  const initialPositionSetRef = useRef(false);
  const tooltipRef = useRef<HTMLElement | null>(null);
  const positionRef = useRef({ x: 250, y: 250 });
  
  // Regular state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Default fallback position
  
  const TOOLTIP_WIDTH = 600; 

  // Use useFloating only for initial positioning, then never again
  const { x, y, refs } = useFloating({
    strategy: "fixed",
    middleware: [offset(8), flip(), shift({ padding: 5 })],
    transform: false,
    placement: "bottom"
  });

  // Initialize position just once on mount
  useEffect(() => {
    // Set the reference element once
    if (referenceElement && !initialPositionSetRef.current) {
      refs.setReference(referenceElement);

      // Get the initial position based on the reference element
      const refRect = referenceElement.getBoundingClientRect();
      const initialX = refRect.left;
      const initialY = refRect.bottom + 8; // 8px offset

      // Apply viewport constraints to initial position
      const { x: constrainedX, y: constrainedY } = constrainToViewport(initialX, initialY);

      // Set both the state and ref
      setPosition({ x: constrainedX, y: constrainedY });
      positionRef.current = { x: constrainedX, y: constrainedY };

      initialPositionSetRef.current = true;
    }

    // Store the floating ref for boundary detection
    if (refs.floating.current) {
      tooltipRef.current = refs.floating.current;
    }

    // Clean up function that runs when component unmounts
    return () => {
      // Nothing to clean up here now
    };
  }, [referenceElement]); // Only run when referenceElement changes or on mount

  // To make tooltip stay within viewport boundaries
  const constrainToViewport = (newX: number, newY: number): { x: number, y: number } => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const maxX = viewportWidth - TOOLTIP_WIDTH - 20;
    const constrainedX = Math.min(Math.max(10, newX), maxX);
    
    const tooltipHeight = tooltipRef.current?.offsetHeight || 200;
    
    const maxY = viewportHeight - tooltipHeight - 20;
    const constrainedY = Math.min(Math.max(10, newY), maxY);
    
    return { x: constrainedX, y: constrainedY };
  };
  
  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on the close button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    });

    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const rawX = e.clientX - dragOffset.x;
        const rawY = e.clientY - dragOffset.y;
        
        // Apply viewport constraints
        const { x: constrainedX, y: constrainedY } = constrainToViewport(rawX, rawY);
        
        // Update React state
        setPosition({
          x: constrainedX,
          y: constrainedY,
        });
        positionRef.current = { x: constrainedX, y: constrainedY };

        // Direct DOM update for smoother dragging
        if (refs.floating.current) {
          const element = refs.floating.current as HTMLElement;
          element.style.transform = 'none';
          element.style.top = `${constrainedY}px`;
          element.style.left = `${constrainedX}px`;
        }
      }
    },
    [isDragging, dragOffset, refs.floating]
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
  
  // Apply viewport constraints on initial positioning
  useEffect(() => {
    if (initialPositionSetRef.current) {
      const { x: constrainedX, y: constrainedY } = constrainToViewport(position.x, position.y);
      if (constrainedX !== position.x || constrainedY !== position.y) {
        setPosition({ x: constrainedX, y: constrainedY });
      }
    }
  }, [position.x, position.y]);
  
  return (
    <div
      ref={refs.setFloating}
      className="text-white rounded-lg shadow-lg text-base leading-relaxed"
      style={{
        color: 'white',
        position: 'fixed',
        top: `${positionRef.current.y}px`,
        left: `${positionRef.current.x}px`,
        transform: 'none',
        pointerEvents: 'auto',
        backgroundColor: '#16775c',
        border: '3px solid #97c481',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: 2147483646, // Ensure it's above everything else
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
        width: `${TOOLTIP_WIDTH}px`,
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        opacity: 1, // Ensure it's visible
        visibility: 'visible', // Ensure it's visible
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header with close button */}
      <div
        style={{
          position: 'relative',
          height: '40px',
          width: '100%',
          backgroundColor: '#16775c',
          borderBottom: '2px solid #97c481',
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
            color: '#fff',
            zIndex: 2,
            padding: '5px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#e0e0e0')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
        >
          ✕
        </button>
      </div>

      {/* Content area with padding and scrolling */}
      <div 
        className="overflow-auto w-full"
        style={{
          padding: '20px',
          zIndex: 1,
          maxHeight: 'calc(70vh - 40px)',
          backgroundColor: '#16775c',
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default FloatingTooltip;