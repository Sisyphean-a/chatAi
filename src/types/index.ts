export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'file' | 'image';
  name: string;
  content: string;
  size: number;
  mimeType: string;
}

export interface ChatConfig {
  apiKey: string;
  apiUrl: string;
  proxyUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number | null;
  customHeaders?: Record<string, string>;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  config: ChatConfig;
  chat: ChatState;
  showSettings: boolean;
}
