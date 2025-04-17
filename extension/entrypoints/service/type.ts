export interface Message {
  auth?: any;
  type: string;
  text?: string;
  dyslexiaFontEnabled?: boolean;
  readModeEnabled?: boolean;
  translateEnabled?: boolean;
  selectedLevel?: number;
  tabId?: number;
  enabled?: boolean;
  targetLanguage?: string;
}


export interface StorageValues {
  llm?: string;
  apiKey?: string;
  simplifyTextEnabled?: boolean;
  dyslexiaFontEnabled?: boolean;
  readModeEnabled?: boolean;
  highlightEnabled?: boolean;
  translateEnabled?: boolean;
  targetLanguage?: string;
  TTSenabled?: boolean;
  readModeTabStates?: Record<number, boolean>;
}