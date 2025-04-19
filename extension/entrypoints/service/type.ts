export interface Message {
  auth: any;
  type: string;
  text: string;
  dyslexiaFontEnabled: boolean;
  readModeEnabled: boolean;
  translateEnabled: boolean;
  selectedLevel: number;
  targetLanguage?: string;
  tabId?: number;
  enabled?: boolean;
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