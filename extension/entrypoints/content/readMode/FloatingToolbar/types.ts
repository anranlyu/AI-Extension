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

export interface FloatingToolbarProps {
  referenceElement: HTMLElement | null;
  textContent?: string;
  readingLevel?: number;
}

export interface ToolbarButtonProps {
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  resetTooltip?: boolean;
}

export interface TrackMarkerProps {
  selectedOption: number;
  onOptionChange: (option: number) => void;
  onSendClick: () => void;
  options?: string[];
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

export interface TranslationToolbarProps {
  onClose: () => void;
  textContent?: string;
}

export interface StandardToolbarProps {
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  onAdjustLengthClick: () => void;
  onReadingLevelClick: () => void;
  onTranslateClick: () => void;
  onTTSClick: () => void;
  resetTooltips?: boolean;
  isTTSActive?: boolean;
  isTranslationMode?: boolean;
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

export interface TrackMarkerProps {
  selectedOption: number;
  onOptionChange: (option: number) => void;
  onSendClick: () => void;
  options: string[];
}
