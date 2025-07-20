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

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  response?: string;
  score?: number;
  duration?: number; // in seconds
  feedback?: string;
}

export interface InterviewSession {
  id: string;
  jobRole: string;
  customRole?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
  stressField?: string;
  additionalContext?: string;
  resume?: UploadedFile;
  questions: InterviewQuestion[];
  startTime: Date;
  endTime?: Date;
  status: 'setup' | 'active' | 'completed' | 'paused';
  currentQuestionIndex: number;
  overallScore?: number;
  report?: InterviewReport;
}

export interface InterviewReport {
  id: string;
  candidate: {
    name?: string;
    email?: string;
    phone?: string;
  };
  interviewDetails: {
    date: string;
    duration: string;
    resumeMatch: number; // percentage
    signalStrength: 'Good' | 'Average' | 'Poor';
  };
  competencies: {
    communication: {
      pronunciation: number;
      fluency: number;
      vocabulary: number;
      spokenEnglishUnderstanding: number;
      activeListening: number;
      grammar: number;
    };
    technical: {
      verbalCommunication: number;
      backgroundAndExperience: number;
      dataStructuresAndAlgorithms: number;
      operatingSystems: number;
      databaseSystems: number;
      computerNetworks: number;
      objectOrientedProgramming: number;
      coding: number;
    };
  };
  questions: InterviewQuestion[];
  overallScore: number;
  hiringDecision: 'Recommended' | 'Not Recommended';
  feedback: string;
}
