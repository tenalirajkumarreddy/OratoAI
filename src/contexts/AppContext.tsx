'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ConversationSession, AISettings, VoiceSettings, Message } from '@/types';

interface AppState {
  currentSession: ConversationSession | null;
  sessions: ConversationSession[];
  aiSettings: AISettings;
  voiceSettings: VoiceSettings;
  isLoading: boolean;
  uploadedContext: string | null;
}

type AppAction =
  | { type: 'START_SESSION'; payload: ConversationSession }
  | { type: 'END_SESSION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: Message } }
  | { type: 'UPDATE_AI_SETTINGS'; payload: Partial<AISettings> }
  | { type: 'UPDATE_VOICE_SETTINGS'; payload: Partial<VoiceSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UPLOADED_CONTEXT'; payload: string | null };

const initialState: AppState = {
  currentSession: null,
  sessions: [],
  aiSettings: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 1000,
  },
  voiceSettings: {
    autoActivation: true,
    autoActivationDelay: 2, // 2 seconds delay after AI stops speaking
    silenceTimeout: 8, // Increased to 8 seconds for longer utterances
    language: 'en-US',
    accent: 'neutral',
    rate: 1,
    pitch: 1,
    volume: 1,
  },
  isLoading: false,
  uploadedContext: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        currentSession: action.payload,
        sessions: [...state.sessions, action.payload],
      };

    case 'END_SESSION':
      const updatedSessions = state.sessions.map(session =>
        session.id === action.payload
          ? { ...session, isActive: false, endTime: new Date() }
          : session
      );
      return {
        ...state,
        currentSession: null,
        sessions: updatedSessions,
      };

    case 'ADD_MESSAGE':
      const { sessionId, message } = action.payload;
      const updatedSessionsWithMessage = state.sessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              messages: [...session.messages, message],
              stats: {
                ...session.stats,
                totalMessages: session.messages.length + 1,
                corrections: session.stats.corrections + (message.metadata?.corrections?.length || 0),
              }
            }
          : session
      );
      
      return {
        ...state,
        sessions: updatedSessionsWithMessage,
        currentSession: state.currentSession?.id === sessionId
          ? updatedSessionsWithMessage.find(s => s.id === sessionId) || state.currentSession
          : state.currentSession,
      };

    case 'UPDATE_AI_SETTINGS':
      return {
        ...state,
        aiSettings: { ...state.aiSettings, ...action.payload },
      };

    case 'UPDATE_VOICE_SETTINGS':
      return {
        ...state,
        voiceSettings: { ...state.voiceSettings, ...action.payload },
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_UPLOADED_CONTEXT':
      return {
        ...state,
        uploadedContext: action.payload,
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
