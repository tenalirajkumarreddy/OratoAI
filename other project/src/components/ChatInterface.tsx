'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { FileUpload } from '@/components/FileUpload';
import { Send, Upload, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useSpeechSynthesis } from '@/hooks/useSpeech';
import { Message, UploadedFile } from '@/types';
import { AIService } from '@/lib/aiService';
import { cn, formatTime } from '@/lib/utils';

interface ChatInterfaceProps {
  mode: 'practice' | 'interview' | 'general';
  onComplete?: () => void;
}

export function ChatInterface({ mode, onComplete }: ChatInterfaceProps) {
  const { state, dispatch } = useApp();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const [textInput, setTextInput] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentSession = state.currentSession;
  const messages = currentSession?.context.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send initial AI greeting when session starts
  useEffect(() => {
    if (currentSession && messages.length === 0 && !state.isLoading) {
      const sendInitialGreeting = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
          const aiService = new AIService(state.config.apiKey, state.config.apiUrl, state.config.model);
          
          // Create a greeting message based on mode
          let greetingPrompt = "";
          switch (mode) {
            case 'practice':
              greetingPrompt = "Start a conversation by greeting the user and asking what they'd like to practice or talk about in English today.";
              break;
            case 'interview':
              greetingPrompt = `Start an interview by greeting the candidate and asking them to introduce themselves. The interview is for a ${currentSession.context.interviewSettings?.role || 'Software Developer'} position at ${currentSession.context.interviewSettings?.difficulty || 'medium'} difficulty level.`;
              break;
            default:
              greetingPrompt = "Greet the user warmly and ask what's on their mind or how you can help them today.";
          }

          const response = await aiService.sendMessage(
            [{ 
              id: 'greeting_prompt', 
              role: 'user', 
              content: greetingPrompt, 
              timestamp: new Date(),
              type: 'text'
            }],
            mode,
            { 
              interviewSettings: currentSession.context.interviewSettings,
              uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined
            }
          );

          // Add AI greeting message
          const greetingMessage: Message = {
            id: `msg_greeting_${Date.now()}`,
            role: 'assistant',
            content: response.content,
            timestamp: new Date(),
            type: 'text',
          };

          dispatch({ 
            type: 'ADD_MESSAGE', 
            payload: { 
              sessionId: currentSession.id, 
              message: greetingMessage 
            } 
          });

          // Speak the greeting
          if (state.config.voiceSettings) {
            speak(response.content);
          }
        } catch (error) {
          console.error('Failed to send initial greeting:', error);
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      };

      sendInitialGreeting();
    }
  }, [currentSession, messages.length, mode, state.isLoading, state.config.apiKey, state.config.voiceSettings, uploadedFiles, dispatch, speak]);

  const handleSendMessage = async (content: string, type: 'text' | 'voice' = 'text') => {
    if (!currentSession || !content.trim()) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      type,
    };

    dispatch({ 
      type: 'ADD_MESSAGE', 
      payload: { 
        sessionId: currentSession.id, 
        message: userMessage 
      } 
    });

    try {
      // Send to AI
      const aiService = new AIService(state.config.apiKey, state.config.apiUrl, state.config.model);
      const response = await aiService.sendMessage(
        [...messages, userMessage],
        mode,
        { 
          interviewSettings: currentSession.context.interviewSettings,
          uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined
        }
      );

      // Add AI response
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        type: 'text',
        metadata: {
          corrections: response.corrections,
          score: response.score,
          suggestions: response.suggestions,
        },
      };

      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
          sessionId: currentSession.id, 
          message: aiMessage 
        } 
      });

      // Speak the response
      speak(response.content);

    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API settings and try again.',
        timestamp: new Date(),
        type: 'text',
      };

      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
          sessionId: currentSession.id, 
          message: errorMessage 
        } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleSendMessage(textInput);
      setTextInput('');
    }
  };

  const handleVoiceSubmit = (transcript: string) => {
    if (transcript.trim()) {
      handleSendMessage(transcript, 'voice');
    }
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    if (files.length > 0 && currentSession) {
      const fileContent = files.map(f => `[File: ${f.name}]\n${f.content}`).join('\n\n');
      handleSendMessage(`I've uploaded ${files.length} file(s). Here's the content:\n\n${fileContent}`);
    }
  };

  const getMessageDisplayContent = (message: Message) => {
    if (mode === 'practice' && message.role === 'assistant' && message.metadata) {
      let content = message.content;
      
      if (message.metadata.corrections) {
        content += '\n\n📝 Corrections:';
        message.metadata.corrections.forEach(correction => {
          content += `\n• ${correction}`;
        });
      }
      
      if (message.metadata.score !== undefined) {
        content += `\n\n⭐ Score: ${message.metadata.score}/10`;
      }
      
      if (message.metadata.suggestions) {
        content += '\n\n💡 Suggestions:';
        message.metadata.suggestions.forEach(suggestion => {
          content += `\n• ${suggestion}`;
        });
      }
      
      return content;
    }
    
    return message.content;
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No active session. Please start a new session.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">
                {mode === 'practice' && 'English Practice Mode'}
                {mode === 'interview' && 'Interview Mode'}
                {mode === 'general' && 'General Conversation'}
              </h3>
              <p>Start by typing a message or using voice input</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2 break-words",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="whitespace-pre-wrap">
                  {getMessageDisplayContent(message)}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>{formatTime(Math.floor((Date.now() - message.timestamp.getTime()) / 1000))} ago</span>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => isSpeaking ? stop() : speak(message.content)}
                    >
                      {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {state.isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload */}
      {showFileUpload && (
        <div className="border-t p-4">
          <FileUpload onFilesUploaded={handleFilesUploaded} />
        </div>
      )}

      {/* Voice Recorder */}
      <div className="border-t p-4">
        <VoiceRecorder
          onTranscriptChange={() => {}}
          onRecordingComplete={handleVoiceSubmit}
          isDisabled={state.isLoading}
          autoStartAfterSpeech={true}
        />
      </div>

      {/* Text Input */}
      <div className="border-t p-4">
        <form onSubmit={handleTextSubmit} className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={cn(showFileUpload && "bg-accent")}
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your message..."
            disabled={state.isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!textInput.trim() || state.isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
