// Shared types and constants for the FloatingToolbar components

export interface FloatingToolbarProps {
  referenceElement: HTMLElement | null;
}

// Length adjustment options
export const LENGTH_OPTIONS = [
  'longest',
  'longer',
  'keep current length',
  'shorter',
  'shortest',
]; 