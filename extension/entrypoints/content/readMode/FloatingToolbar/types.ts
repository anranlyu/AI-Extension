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
  initialOption?: number;
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

export const TRANSLATION_OPTIONS = [
  'Arabic',
  'Bulgarian',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'English',
  'Estonian',
  'Finnish',
  'French',
  'German',
  'Greek',
  'Hungarian',
  'Italian',
  'Japanese',
  'Korean',
  'Latvian',
  'Lithuanian',
  'Macedonian',
  'Portuguese', 
  'Romanian',
  'Russian',
  'Spanish',
  'Swedish',
  'Turkish',
  'Ukrainian',
  'Vietnamese',
]; 