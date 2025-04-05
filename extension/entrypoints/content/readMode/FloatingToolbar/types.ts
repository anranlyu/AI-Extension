import { ReactNode } from 'react';

export interface FloatingToolbarProps {
  referenceElement: HTMLElement | null;
}

export interface ToolbarButtonProps {
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  showTooltip?: boolean;
  isActive?: boolean;
  className?: string;
  resetTooltip?: boolean;
}

export interface LengthAdjustmentToolbarProps {
  onClose: () => void;
  initialOption?: number;
}

export interface StandardToolbarProps {
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  onAdjustLengthClick: () => void;
  resetTooltips?: boolean;
}

export interface TrackMarkerProps {
  selectedOption: number;
  onOptionChange: (option: number) => void;
  onSendClick: () => void;
} 