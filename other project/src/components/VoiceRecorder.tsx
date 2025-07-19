'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Play, Pause } from 'lucide-react';
import { useSpeechRecognition, useSpeechSynthesis } from '@/hooks/useSpeech';
import { useApp } from '@/contexts/AppContext';
import { cn, formatTime } from '@/lib/utils';

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  onRecordingComplete: (transcript: string) => void;
  isDisabled?: boolean;
  autoStartAfterSpeech?: boolean;
}

export function VoiceRecorder({ 
  onTranscriptChange, 
  onRecordingComplete, 
  isDisabled = false,
  autoStartAfterSpeech = true
}: VoiceRecorderProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isWaitingForSpeech, setIsWaitingForSpeech] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get state and settings from context
  const { state } = useApp();
  const silenceTimeout = state.config.voiceSettings.silenceTimeout * 1000; // Convert to milliseconds
  const currentSession = state.currentSession;
  const messages = currentSession?.context.messages || [];
  
  const { 
    transcript, 
    isListening, 
    isSupported, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();
  
  const { isSpeaking } = useSpeechSynthesis();

  // Update transcript in real-time
  useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  // Handle recording timer
  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isListening]);

  // Handle silence detection and auto-stop
  useEffect(() => {
    if (isListening && transcript.trim()) {
      // Reset silence timer when new speech is detected
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // Set a new silence timer using configurable timeout
      silenceTimeoutRef.current = setTimeout(() => {
        if (isListening && transcript.trim()) {
          handleStopRecording();
        }
      }, silenceTimeout); // Use configurable silence timeout
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [transcript, isListening, silenceTimeout]);

  // Auto-start recording when AI stops speaking (better conversation flow control)
  useEffect(() => {
    if (autoStartAfterSpeech && !isSpeaking && !isListening && !isDisabled) {
      // Only auto-start if there are messages in the conversation (not the very first interaction)
      // This ensures the first message always requires manual start
      if (messages.length > 0) {
        // Check if the last message was from the AI (assistant)
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          setIsWaitingForSpeech(true);
          const timeout = setTimeout(() => {
            setIsWaitingForSpeech(false);
            startListening();
          }, 1500); // Wait 1.5 seconds after AI stops speaking

          return () => clearTimeout(timeout);
        }
      }
    }
  }, [isSpeaking, autoStartAfterSpeech, isListening, isDisabled, startListening, messages]);

  const handleStartRecording = () => {
    resetTranscript();
    setRecordingTime(0);
    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
    if (transcript.trim()) {
      onRecordingComplete(transcript.trim());
    }
    
    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Speech recognition is not supported in your browser
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Recording Status */}
      <div className="flex items-center space-x-4">
        {isWaitingForSpeech && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm">Preparing to listen...</span>
          </div>
        )}
        
        {isListening && (
          <div className="flex items-center space-x-2 text-red-500">
            <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium">Recording: {formatTime(recordingTime)}</span>
          </div>
        )}
        
        {isSpeaking && (
          <div className="flex items-center space-x-2 text-blue-500">
            <div className="animate-pulse w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">AI Speaking...</span>
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="flex items-center space-x-2">
        {!isListening ? (
          <Button
            onClick={handleStartRecording}
            disabled={isDisabled || isSpeaking || isWaitingForSpeech}
            size="lg"
            className={cn(
              "rounded-full w-16 h-16",
              "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            )}
          >
            <Mic className="h-6 w-6" />
          </Button>
        ) : (
          <Button
            onClick={handleStopRecording}
            size="lg"
            variant="destructive"
            className="rounded-full w-16 h-16"
          >
            <Square className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="w-full p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Live Transcript:</h4>
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {!isListening 
            ? "Click the microphone to start speaking" 
            : `Speak clearly. Recording will stop automatically after ${state.config.voiceSettings.silenceTimeout} seconds of silence.`
          }
        </p>
      </div>
    </div>
  );
}
