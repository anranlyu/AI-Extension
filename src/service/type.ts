export interface Message {
  type: string;
  text: string;
  dyslexiaFontEnabled: boolean;
  readModeEnabled: boolean;
}

export interface StorageValues {
  llm?: string;
  apiKey?: string;
  simplifyTextEnabled?: boolean;
  dyslexiaFontEnabled?: boolean;
  readModeEnabled?: boolean;
  highlightEnabled?: boolean;
}