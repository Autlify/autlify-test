// types/ai-chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url?: string;
  preview?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  context?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export type AIProvider = 'openai' | 'anthropic' | 'azure' | 'custom';

export interface LicenseConfig {
  maxTokens: number;
  temperature: number;
  streaming: boolean;
  usePlatformCost: boolean;
  contextWindow: number;
  model: string;
}