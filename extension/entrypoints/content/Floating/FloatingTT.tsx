import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFloating, offset, flip, shift } from '@floating-ui/react';
import '../../content/content.css';

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
  
  // Regular state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Default fallback position
  
  const TOOLTIP_WIDTH = 600; 

  // Use useFloating only for initial positioning, then never again
  const { x, y, refs } = useFloating({
    strategy: "fixed",
    middleware: [offset(8), flip(), shift({ padding: 5 })],
  });
  
  useEffect(() => {
    if (!initialPositionSetRef.current && x !== null && y !== null) {
      setPosition({ x, y });
      initialPositionSetRef.current = true;
    }
  }, [x, y]);
  
  // Attach the reference element only once, and disconnect from automatic updates
  useEffect(() => {
    if (referenceElement && !initialPositionSetRef.current) {
      refs.setReference(referenceElement);
    }
    
    // Store the floating ref for boundary detection
    if (refs.floating.current) {
      tooltipRef.current = refs.floating.current;
    }
    return () => {
    };
  }, [referenceElement, refs]);
  
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
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    
    // Mark position as set to prevent any floating UI updates
    initialPositionSetRef.current = true;
    
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
        
        // Direct DOM update for smoother dragging
        if (refs.floating.current) {
          const element = refs.floating.current as HTMLElement;
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
      className="text-white p-6 rounded-lg shadow-lg text-base leading-relaxed"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'none',
        backgroundColor: 'rgba(13, 170, 142, 0.90)', // Persian green background
        border: '3px solid #5563A2', // liberty blue
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: 99999,
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
        width: `${TOOLTIP_WIDTH}px`, // Fixed width
        maxHeight: '70vh', // Maximum height as percentage of viewport
        overflow: 'auto', // scrolling
        display: 'flex',
        flexDirection: 'column',
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
          color: '#fff',
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = '#e0e0e0')}
        onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
      >
        ✕
      </button>
      <div 
        style={{ marginTop: '10px' }}
        className="overflow-auto w-full"
      >
        {content}
      </div>
    </div>
  );
};

export default FloatingTooltip;