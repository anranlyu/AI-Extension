export type VoiceOption = "alloy" | "ash" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer";

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
  voice?: VoiceOption
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