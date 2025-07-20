export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'file';
  metadata?: {
    corrections?: string[];
    score?: number;
    suggestions?: string[];
    fileName?: string;
    fileType?: string;
  };
}

export interface ConversationSession {
  id: string;
  messages: Message[];
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  stats: {
    totalMessages: number;
    corrections: number;
    averageScore: number;
    duration: number; // in minutes
  };
}

export interface AISettings {
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export interface VoiceSettings {
  autoActivation: boolean;
  autoActivationDelay: number; // in seconds (delay after AI stops speaking)
  silenceTimeout: number; // in seconds
  language: string;
  accent: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: Date;
}
