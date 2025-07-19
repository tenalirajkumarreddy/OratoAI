export interface AppConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  voiceSettings: {
    rate: number;
    pitch: number;
    volume: number;
    voice: string;
    silenceTimeout: number; // in seconds
  };
}

export interface UserSession {
  id: string;
  mode: 'practice' | 'interview' | 'general';
  context: ConversationContext;
  startTime: Date;
  isActive: boolean;
}

export interface ConversationContext {
  messages: Message[];
  currentTopic?: string;
  userProfile?: UserProfile;
  interviewSettings?: InterviewSettings;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'file';
  metadata?: {
    audioUrl?: string;
    corrections?: string[];
    score?: number;
    suggestions?: string[];
    fileName?: string;
    fileType?: string;
  };
}

export interface UserProfile {
  name?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  weakAreas: string[];
}

export interface InterviewSettings {
  role: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  focusAreas: string[];
  resume?: File;
  customInstructions?: string;
}

export interface InterviewReport {
  overallScore: number;
  sections: {
    technical: { score: number; feedback: string; improvements: string[] };
    communication: { score: number; feedback: string; improvements: string[] };
    problemSolving: { score: number; feedback: string; improvements: string[] };
    experience: { score: number; feedback: string; improvements: string[] };
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
  duration: number;
  totalQuestions: number;
  timestamp: Date;
}

export interface VoiceSettings {
  isEnabled: boolean;
  autoStart: boolean;
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
