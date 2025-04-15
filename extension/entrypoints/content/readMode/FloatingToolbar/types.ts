import { ReactNode } from 'react';

export interface FloatingToolbarProps {
  referenceElement: HTMLElement | null;
  textContent?: string;
  readingLevel?: number;
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
  textContent?: string;
}

export interface ReadingLevelAdjustmentToolbarProps {
  onClose: () => void;
  initialOption?: number;
  textContent?: string;
  readingLevel: number;
}

export interface StandardToolbarProps {
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  onAdjustLengthClick: () => void;
  onReadingLevelClick: () => void;
  onTTSClick: () => void;
  resetTooltips?: boolean;
  isTTSActive?: boolean;
}

export interface TrackMarkerProps {
  selectedOption: number;
  onOptionChange: (option: number) => void;
  onSendClick: () => void;
  options: string[];
} 