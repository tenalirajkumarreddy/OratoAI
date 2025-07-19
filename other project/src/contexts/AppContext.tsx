'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppConfig, UserSession, ConversationContext, Message } from '@/types';
import { generateSessionId } from '@/lib/utils';

interface AppState {
  config: AppConfig;
  sessions: Map<string, UserSession>;
  currentSession: UserSession | null;
  isRecording: boolean;
  isPlaying: boolean;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_CONFIG'; payload: Partial<AppConfig> }
  | { type: 'CREATE_SESSION'; payload: { mode: 'practice' | 'interview' | 'general' } }
  | { type: 'SET_CURRENT_SESSION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: Message } }
  | { type: 'UPDATE_SESSION_CONTEXT'; payload: { sessionId: string; context: Partial<ConversationContext> } }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'END_SESSION'; payload: string };

const initialConfig: AppConfig = {
  apiKey: '',
  apiUrl: '/api/chat',
  model: 'openai/gpt-3.5-turbo',
  voiceSettings: {
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: 'default',
    silenceTimeout: 6
  }
};

const initialState: AppState = {
  config: initialConfig,
  sessions: new Map(),
  currentSession: null,
  isRecording: false,
  isPlaying: false,
  isLoading: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      };

    case 'CREATE_SESSION': {
      const sessionId = generateSessionId();
      const newSession: UserSession = {
        id: sessionId,
        mode: action.payload.mode,
        context: { messages: [] },
        startTime: new Date(),
        isActive: true
      };
      const newSessions = new Map(state.sessions);
      newSessions.set(sessionId, newSession);
      return {
        ...state,
        sessions: newSessions,
        currentSession: newSession
      };
    }

    case 'SET_CURRENT_SESSION': {
      const session = state.sessions.get(action.payload);
      return {
        ...state,
        currentSession: session || null
      };
    }

    case 'ADD_MESSAGE': {
      const { sessionId, message } = action.payload;
      const session = state.sessions.get(sessionId);
      if (!session) return state;

      const updatedSession = {
        ...session,
        context: {
          ...session.context,
          messages: [...session.context.messages, message]
        }
      };

      const newSessions = new Map(state.sessions);
      newSessions.set(sessionId, updatedSession);

      return {
        ...state,
        sessions: newSessions,
        currentSession: state.currentSession?.id === sessionId ? updatedSession : state.currentSession
      };
    }

    case 'UPDATE_SESSION_CONTEXT': {
      const { sessionId, context } = action.payload;
      const session = state.sessions.get(sessionId);
      if (!session) return state;

      const updatedSession = {
        ...session,
        context: { ...session.context, ...context }
      };

      const newSessions = new Map(state.sessions);
      newSessions.set(sessionId, updatedSession);

      return {
        ...state,
        sessions: newSessions,
        currentSession: state.currentSession?.id === sessionId ? updatedSession : state.currentSession
      };
    }

    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload };

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'END_SESSION': {
      const session = state.sessions.get(action.payload);
      if (!session) return state;

      const updatedSession = { ...session, isActive: false };
      const newSessions = new Map(state.sessions);
      newSessions.set(action.payload, updatedSession);

      return {
        ...state,
        sessions: newSessions,
        currentSession: state.currentSession?.id === action.payload ? null : state.currentSession
      };
    }

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

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('english-platform-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        // Migration: ensure silenceTimeout exists in voiceSettings
        const migratedConfig = {
          ...config,
          voiceSettings: {
            ...config.voiceSettings,
            silenceTimeout: config.voiceSettings?.silenceTimeout || 6
          }
        };
        dispatch({ type: 'SET_CONFIG', payload: migratedConfig });
      } catch (error) {
        console.error('Failed to load config from localStorage, using defaults:', error);
        // Clear corrupt localStorage data
        localStorage.removeItem('english-platform-config');
      }
    }
  }, []);

  // Save config to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('english-platform-config', JSON.stringify(state.config));
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
    }
  }, [state.config]);

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
