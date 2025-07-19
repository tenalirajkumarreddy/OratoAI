import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Square, Play, Pause, Upload, FileText, StopCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/useSpeech";
import { AIService } from "@/lib/aiService";
import { FileUpload } from "@/components/FileUpload";
import { Message, ConversationSession, UploadedFile } from "@/types";

const Practice = () => {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  
  // Speech hooks
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSpeaking, voices } = useSpeechSynthesis();
  
  // Component state
  const [textInput, setTextInput] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isWaitingForSpeech, setIsWaitingForSpeech] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoActivateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current session messages
  const messages = state.currentSession?.messages || [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle transcript changes
  useEffect(() => {
    if (transcript.trim() && isListening) {
      // Reset silence timeout when speech is detected
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // Set new silence timeout
      silenceTimeoutRef.current = setTimeout(() => {
        if (isListening && transcript.trim()) {
          stopListening();
          handleSendMessage(transcript, 'voice');
        }
      }, state.voiceSettings.silenceTimeout * 1000);
    }
  }, [transcript, isListening, state.voiceSettings.silenceTimeout]);

  // Auto-activate microphone after AI finishes speaking
  useEffect(() => {
    if (!isSpeaking && sessionStarted && state.voiceSettings.autoActivation && messages.length > 0) {
      // Check if the last message was from AI
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant' && !isListening) {
        setIsWaitingForSpeech(true);
        
        autoActivateTimeoutRef.current = setTimeout(() => {
          setIsWaitingForSpeech(false);
          if (!isListening) {
            startListening();
          }
        }, 1500); // Wait 1.5 seconds after AI stops speaking
      }
    }
    
    return () => {
      if (autoActivateTimeoutRef.current) {
        clearTimeout(autoActivateTimeoutRef.current);
      }
    };
  }, [isSpeaking, sessionStarted, state.voiceSettings.autoActivation, messages, isListening, startListening]);

  // Start session and send initial greeting
  const handleStartSession = async () => {
    if (!state.aiSettings.apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please configure your AI API key in Settings first.",
        variant: "destructive",
      });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Create new session
      const newSession: ConversationSession = {
        id: `session_${Date.now()}`,
        messages: [],
        startTime: new Date(),
        isActive: true,
        stats: {
          totalMessages: 0,
          corrections: 0,
          averageScore: 0,
          duration: 0,
        }
      };

      dispatch({ type: 'START_SESSION', payload: newSession });

      // Send initial greeting to AI
      const aiService = new AIService(
        state.aiSettings.apiKey,
        state.aiSettings.provider,
        state.aiSettings.model
      );

      const greetingPrompt = state.uploadedContext 
        ? `Start a friendly conversation and ask the user what they'd like to discuss about the uploaded document: "${state.uploadedContext.substring(0, 200)}..."`
        : "Start a friendly conversation by greeting the user and asking what they'd like to practice or talk about in English today.";

      const initialMessage: Message = {
        id: 'greeting_prompt',
        role: 'user',
        content: greetingPrompt,
        timestamp: new Date(),
        type: 'text'
      };

      const response = await aiService.sendMessage([initialMessage], state.uploadedContext || undefined);
      
      // Add AI greeting message
      const greetingMessage: Message = {
        id: `msg_${Date.now()}`,
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
        payload: { sessionId: newSession.id, message: greetingMessage }
      });

      // Speak the greeting
      speak(response.content, {
        rate: state.voiceSettings.rate,
        pitch: state.voiceSettings.pitch,
        volume: state.voiceSettings.volume,
      });

      setSessionStarted(true);
      
      toast({
        title: "Session started",
        description: "Your practice session is now active. Start speaking!",
      });

    } catch (error) {
      console.error('Failed to start session:', error);
      toast({
        title: "Failed to start session",
        description: "Please check your API settings and try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // End current session
  const handleEndSession = () => {
    if (state.currentSession) {
      // Calculate session stats
      const duration = Math.floor((Date.now() - state.currentSession.startTime.getTime()) / 1000 / 60);
      const corrections = state.currentSession.messages.reduce(
        (total, msg) => total + (msg.metadata?.corrections?.length || 0), 0
      );
      
      dispatch({ type: 'END_SESSION', payload: state.currentSession.id });
      setSessionStarted(false);
      stopListening();
      stopSpeaking();
      
      toast({
        title: "Session ended",
        description: `Duration: ${duration} minutes, Messages: ${state.currentSession.messages.length}, Corrections: ${corrections}`,
      });
    }
  };

  // Send message (voice or text)
  const handleSendMessage = async (content: string, type: 'text' | 'voice' = 'text') => {
    if (!state.currentSession || !content.trim()) return;

    try {
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
        payload: { sessionId: state.currentSession.id, message: userMessage }
      });

      // Send to AI
      const aiService = new AIService(
        state.aiSettings.apiKey,
        state.aiSettings.provider,
        state.aiSettings.model
      );

      const allMessages = [...state.currentSession.messages, userMessage];
      const response = await aiService.sendMessage(allMessages, state.uploadedContext || undefined);

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
        payload: { sessionId: state.currentSession.id, message: aiMessage }
      });

      // Speak the response
      speak(response.content, {
        rate: state.voiceSettings.rate,
        pitch: state.voiceSettings.pitch,
        volume: state.voiceSettings.volume,
      });

      // Clear text input if it was a text message
      if (type === 'text') {
        setTextInput("");
      }
      
      // Reset transcript if it was a voice message
      if (type === 'voice') {
        resetTranscript();
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Handle file upload
  const handleFileProcessed = (content: string, file: UploadedFile) => {
    dispatch({ type: 'SET_UPLOADED_CONTEXT', payload: content });
    setShowFileUpload(false);
    
    toast({
      title: "File processed",
      description: `${file.name} is now available for discussion. Start a session to talk about it!`,
    });
  };

  // Manual microphone toggle
  const handleMicrophoneToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        handleSendMessage(transcript, 'voice');
      }
    } else {
      if (isSpeaking) {
        stopSpeaking();
      }
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Practice English Communication
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Improve your English speaking skills with AI-powered conversations. Get real-time feedback and corrections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Messages Area */}
            <Card className="h-96 p-6 bg-card border-border shadow-card overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-16">
                    <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Start a practice session to begin</p>
                    <p className="text-sm">Click "Start Session" below to begin your English practice</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-sm p-4 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                            {message.type === 'voice' && (
                              <Badge variant="outline" className="text-xs">
                                Voice
                              </Badge>
                            )}
                          </div>
                          {message.metadata?.corrections && (
                            <div className="mt-2 text-xs bg-orange-100 dark:bg-orange-900 p-2 rounded">
                              <strong>Suggestion:</strong> {message.metadata.corrections[0]}
                            </div>
                          )}
                          {message.metadata?.score && (
                            <div className="mt-1 text-xs">
                              <Badge variant="secondary">
                                Score: {message.metadata.score}/10
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </Card>

            {/* Input Controls */}
            <Card className="p-6 bg-card border-border shadow-card">
              <div className="space-y-4">
                {!sessionStarted ? (
                  /* Session Start */
                  <div className="text-center space-y-4">
                    <Button
                      size="lg"
                      onClick={handleStartSession}
                      disabled={state.isLoading}
                      className="px-8 py-4 text-lg font-semibold shadow-elegant hover:shadow-glow transition-all duration-300"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {state.isLoading ? 'Starting...' : 'Start Practice Session'}
                    </Button>
                    
                    {state.uploadedContext && (
                      <div className="text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Document ready for discussion
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Voice Control */}
                    <div className="flex items-center justify-center space-x-4">
                      {!isSupported ? (
                        <div className="text-center text-muted-foreground">
                          <p>Speech recognition not supported in this browser</p>
                          <p className="text-xs">Please use Chrome for the best experience</p>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <Button
                            size="lg"
                            variant={isListening ? "destructive" : "default"}
                            onClick={handleMicrophoneToggle}
                            disabled={state.isLoading}
                            className={`w-16 h-16 rounded-full transition-all duration-300 ${
                              isListening ? 'shadow-glow animate-pulse' : 'hover:scale-105'
                            }`}
                          >
                            {isListening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                          </Button>
                          
                          <div className="text-center">
                            {isWaitingForSpeech ? (
                              <div className="flex items-center gap-2 text-yellow-500">
                                <div className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <p className="text-sm font-medium">Getting ready to listen...</p>
                              </div>
                            ) : isListening ? (
                              <div className="flex items-center gap-2 text-red-500">
                                <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
                                <p className="text-sm font-medium">Listening... Speak now</p>
                              </div>
                            ) : isSpeaking ? (
                              <div className="flex items-center gap-2 text-blue-500">
                                <div className="animate-pulse w-3 h-3 bg-blue-500 rounded-full"></div>
                                <p className="text-sm font-medium">AI Speaking...</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-medium">Click to speak</p>
                                <p className="text-xs text-muted-foreground">
                                  Auto-activation: {state.voiceSettings.autoActivation ? 'On' : 'Off'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Live Transcript */}
                    {transcript && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Live Transcript:</h4>
                        <p className="text-sm">{transcript}</p>
                      </div>
                    )}

                    <Separator />

                    {/* Text Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Or type your message:</label>
                      <div className="flex space-x-2">
                        <Textarea
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Type your message here..."
                          className="bg-input border-border"
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (textInput.trim()) {
                                handleSendMessage(textInput, 'text');
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTextInput("")}
                          disabled={!textInput.trim() || state.isLoading}
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSendMessage(textInput, 'text')}
                          disabled={!textInput.trim() || state.isLoading}
                        >
                          Send Message
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Session Controls */}
                    <div className="flex justify-center space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          stopListening();
                          stopSpeaking();
                        }}
                        disabled={!isListening && !isSpeaking}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleEndSession}
                      >
                        <StopCircle className="w-4 h-4 mr-2" />
                        End Session
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Stats */}
            {sessionStarted && state.currentSession && (
              <Card className="p-4 bg-card border-border shadow-card">
                <h3 className="text-lg font-semibold text-foreground mb-3">Session Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Messages:</span>
                    <span className="text-foreground">{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="text-foreground">
                      {Math.floor((Date.now() - state.currentSession.startTime.getTime()) / 1000 / 60)}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Corrections:</span>
                    <span className="text-foreground">
                      {messages.reduce((total, msg) => total + (msg.metadata?.corrections?.length || 0), 0)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* File Upload */}
            <Card className="p-4 bg-card border-border shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">Upload Content</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {showFileUpload ? 'Hide' : 'Upload'}
                </Button>
              </div>

              {state.uploadedContext && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Document loaded</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_UPLOADED_CONTEXT', payload: null })}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {state.uploadedContext.substring(0, 100)}...
                  </p>
                </div>
              )}

              {showFileUpload && (
                <FileUpload
                  onFileProcessed={handleFileProcessed}
                  maxFiles={1}
                  maxFileSize={10}
                />
              )}
            </Card>

            {/* Tips */}
            <Card className="p-4 bg-card border-border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-3">Practice Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Speak clearly and at a natural pace</li>
                <li>• The AI will automatically correct your grammar</li>
                <li>• Upload documents to practice discussing specific topics</li>
                <li>• Use voice input for the most natural practice</li>
                <li>• Auto-activation keeps the conversation flowing</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;