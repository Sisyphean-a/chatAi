export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  isStreaming?: boolean; // 新增：标识消息是否正在流式传输
  reasoning?: ReasoningContent; // 新增：推理内容
}

// 新增：推理内容接口
export interface ReasoningContent {
  content: string; // 推理过程的文本内容
  isStreaming: boolean; // 推理是否正在进行
  isCollapsed: boolean; // 推理内容是否折叠
  summary?: string[]; // 推理摘要
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
  customModels?: string[]; // 新增：用户自定义的模型列表
  reasoningEnabled?: boolean; // 新增：是否启用推理功能
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  streamController?: AbortController; // 新增：用于控制流式传输
}

// 新增：对话会话接口
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  config: ChatConfig;
  conversations: Conversation[]; // 修改：从单个chat改为多个conversations
  currentConversationId: string | null; // 新增：当前对话ID
  showSettings: boolean;
}
