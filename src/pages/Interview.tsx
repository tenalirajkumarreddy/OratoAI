import { useState, useEffect, useRef } from "react";
import { Upload, Clock, Target, FileText, Download, Settings, Play, Pause, Square, Mic, MicOff, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { InterviewSession, InterviewQuestion, UploadedFile } from "@/types";
import { InterviewService } from "@/lib/interviewService";
import { AIService } from "@/lib/aiService";
import { extractTextFromPDF, validateFileType, formatFileSize } from "@/lib/fileProcessing";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/useSpeech";
import InterviewReportComponent from "@/components/InterviewReport";

const Interview = () => {
  const { state } = useApp();
  const { toast } = useToast();
  const [interviewState, setInterviewState] = useState<'setup' | 'active' | 'completed'>('setup');
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [role, setRole] = useState("software-developer");
  const [customRole, setCustomRole] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [timeLimit, setTimeLimit] = useState("30");
  const [stressField, setStressField] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [resume, setResume] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentResponse, setCurrentResponse] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const interviewServiceRef = useRef<InterviewService | null>(null);

  // Speech hooks
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const { speak, stop: stopSpeaking } = useSpeechSynthesis();

  // Initialize interview service
  useEffect(() => {
    if (state.aiSettings.apiKey && state.aiSettings.provider) {
      const aiService = new AIService(
        state.aiSettings.apiKey,
        state.aiSettings.provider,
        state.aiSettings.model
      );
      interviewServiceRef.current = new InterviewService(aiService);
    }
  }, [state.aiSettings]);

  // Handle transcript changes during interview
  useEffect(() => {
    if (transcript && isAnswering) {
      setCurrentResponse(transcript);
    }
  }, [transcript, isAnswering]);

  // Timer for interview
  useEffect(() => {
    if (interviewState === 'active' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewState, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFileType(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or image file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      let content = "";
      
      if (file.type === 'application/pdf') {
        content = await extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        content = `Image uploaded: ${file.name}. Size: ${formatFileSize(file.size)}`;
      } else {
        // For text files and documents
        const reader = new FileReader();
        content = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.readAsText(file);
        });
      }

      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        content,
        uploadedAt: new Date()
      };

      setResume(uploadedFile);
      toast({
        title: "Resume uploaded successfully",
        description: `${file.name} (${formatFileSize(file.size)})`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process the uploaded file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startInterview = async () => {
    if (!state.aiSettings.apiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your AI API key in Settings before starting the interview.",
        variant: "destructive"
      });
      return;
    }

    const session: InterviewSession = {
      id: Date.now().toString(),
      jobRole: role,
      customRole: role === 'custom' ? customRole : undefined,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      timeLimit: parseInt(timeLimit),
      stressField: stressField || undefined,
      additionalContext: additionalContext || undefined,
      resume,
      questions: [],
      startTime: new Date(),
      status: 'active',
      currentQuestionIndex: 0
    };

    setCurrentSession(session);
    setTimeRemaining(parseInt(timeLimit) * 60); // Convert minutes to seconds
    setInterviewState('active');
    
    // Generate questions
    try {
      if (interviewServiceRef.current) {
        toast({
          title: "Generating questions...",
          description: "Please wait while we prepare your personalized interview questions."
        });
        
        const questions = await interviewServiceRef.current.generateQuestions(session);
        session.questions = questions;
        setCurrentSession({ ...session });
        
        // Read first question aloud
        if (questions.length > 0) {
          speak(questions[0].question, {
            rate: state.voiceSettings.rate,
            pitch: state.voiceSettings.pitch,
            volume: state.voiceSettings.volume
          });
        }
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const endInterview = async () => {
    if (currentSession && interviewServiceRef.current) {
      currentSession.endTime = new Date();
      currentSession.status = 'completed';
      
      // Generate final report
      const report = interviewServiceRef.current.generateReport(currentSession);
      currentSession.report = report;
      
      setCurrentSession({ ...currentSession });
      setInterviewState('completed');
      stopSpeaking();
      stopListening();
    }
  };

  const startAnswering = () => {
    setIsAnswering(true);
    resetTranscript();
    startListening();
    stopSpeaking(); // Stop question being read
  };

  const stopAnswering = async () => {
    setIsAnswering(false);
    stopListening();
    
    const response = currentResponse || transcript;
    if (!response.trim()) {
      toast({
        title: "No response recorded",
        description: "Please provide an answer before moving to the next question.",
        variant: "destructive"
      });
      return;
    }

    if (currentSession && interviewServiceRef.current) {
      setIsEvaluating(true);
      
      try {
        const currentQuestion = currentSession.questions[currentQuestionIndex];
        const evaluation = await interviewServiceRef.current.evaluateResponse(
          currentQuestion, 
          response, 
          currentSession.resume
        );

        // Update question with response and score
        currentQuestion.response = response;
        currentQuestion.score = evaluation.score;
        currentQuestion.feedback = evaluation.feedback;

        setCurrentSession({ ...currentSession });
        nextQuestion();
      } catch (error) {
        console.error('Error evaluating response:', error);
        toast({
          title: "Evaluation Error",
          description: "Failed to evaluate your response. Moving to next question.",
          variant: "destructive"
        });
        nextQuestion();
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const nextQuestion = () => {
    if (currentSession) {
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex >= currentSession.questions.length) {
        // Interview complete
        endInterview();
        return;
      }

      setCurrentQuestionIndex(nextIndex);
      setCurrentResponse("");
      resetTranscript();
      
      // Read next question
      const nextQuestion = currentSession.questions[nextIndex];
      speak(nextQuestion.question, {
        rate: state.voiceSettings.rate,
        pitch: state.voiceSettings.pitch,
        volume: state.voiceSettings.volume
      });
    }
  };

  const skipQuestion = () => {
    nextQuestion();
  };

  const roleOptions = [
    { value: "software-developer", label: "Software Developer" },
    { value: "frontend-developer", label: "Frontend Developer" },
    { value: "backend-developer", label: "Backend Developer" },
    { value: "fullstack-developer", label: "Fullstack Developer" },
    { value: "devops-engineer", label: "DevOps Engineer" },
    { value: "data-scientist", label: "Data Scientist" },
    { value: "product-manager", label: "Product Manager" },
    { value: "ui-ux-designer", label: "UI/UX Designer" },
    { value: "business-analyst", label: "Business Analyst" },
    { value: "custom", label: "Custom Role" },
  ];

  const difficultyOptions = [
    { value: "easy", label: "Easy", color: "bg-green-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "hard", label: "Hard", color: "bg-red-500" },
  ];

  // Show completed interview report
  if (interviewState === 'completed' && currentSession?.report) {
    return (
      <InterviewReportComponent
        report={currentSession.report}
        onDownload={() => {
          // TODO: Implement PDF download
          toast({
            title: "Download feature",
            description: "PDF download will be implemented soon."
          });
        }}
        onStartNew={() => {
          setInterviewState('setup');
          setCurrentSession(null);
          setCurrentQuestionIndex(0);
          setCurrentResponse("");
          setResume(null);
          resetTranscript();
        }}
      />
    );
  }

  if (interviewState === 'setup') {
    return (
      <div className="min-h-screen bg-background font-inter">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Orato AI Interview Simulator
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Practice job interviews with AI. Get personalized questions based on your resume and role.
            </p>
          </div>

          <Card className="p-8 bg-card border-border shadow-elegant">
            <div className="space-y-8">
              {/* Resume Upload */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Upload Resume</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {resume ? (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 mx-auto text-success" />
                      <p className="font-medium">{resume.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(resume.size)}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setResume(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium mb-2">Upload your resume</p>
                        <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, or image formats supported</p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Choose File'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Interview Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Job Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {roleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {role === 'custom' && (
                    <Input 
                      placeholder="Enter custom role..."
                      className="bg-input border-border"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {difficultyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${option.color}`} />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Time Limit (minutes)</Label>
                  <Input 
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="bg-input border-border"
                    min="10"
                    max="120"
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 20-45 minutes for comprehensive interview
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Stress Test Field (Optional)</Label>
                  <Input 
                    placeholder="e.g., System Design, Algorithms, React"
                    value={stressField}
                    onChange={(e) => setStressField(e.target.value)}
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Focus area for additional challenging questions
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Additional Context</Label>
                <Textarea 
                  placeholder="Any specific topics you'd like to focus on, company information, or additional context..."
                  className="bg-input border-border"
                  rows={4}
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                />
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  size="lg" 
                  onClick={startInterview}
                  className="px-8 py-3 text-lg font-semibold shadow-elegant hover:shadow-glow transition-all duration-300"
                  disabled={!state.aiSettings.apiKey || (role === 'custom' && !customRole)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Interview
                </Button>
              </div>
              
              {!state.aiSettings.apiKey && (
                <p className="text-center text-sm text-muted-foreground">
                  Please configure your AI API key in Settings to start the interview.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (interviewState === 'active' && currentSession) {
    const currentQuestion = currentSession.questions[currentQuestionIndex];
    const totalQuestions = currentSession.questions.length;

    return (
      <div className="min-h-screen bg-background font-inter">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Interview Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Interview in Progress</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <Badge variant="outline">Question {currentQuestionIndex + 1}/{totalQuestions}</Badge>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(timeRemaining)} remaining</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{currentSession.customRole || currentSession.jobRole.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
              <Button variant="destructive" onClick={endInterview}>
                <Square className="w-4 h-4 mr-2" />
                End Interview
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Interview Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Question */}
              <Card className="p-6 bg-card border-border shadow-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Current Question</h3>
                    <Badge className={difficultyOptions.find(d => d.value === currentSession.difficulty)?.color}>
                      {currentSession.difficulty.charAt(0).toUpperCase() + currentSession.difficulty.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-foreground text-lg leading-relaxed">
                    {currentQuestion?.question || 'Loading question...'}
                  </p>
                  {currentQuestion?.category && (
                    <Badge variant="outline">{currentQuestion.category}</Badge>
                  )}
                </div>
              </Card>

              {/* Response Area */}
              <Card className="p-6 bg-card border-border shadow-card">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Your Response</h3>
                  
                  {/* Voice Control */}
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-4">
                      <Button
                        size="lg"
                        onClick={isAnswering ? stopAnswering : startAnswering}
                        disabled={isEvaluating}
                        className="w-20 h-20 rounded-full shadow-elegant hover:shadow-glow transition-all duration-300"
                        variant={isAnswering ? "destructive" : "default"}
                      >
                        {isEvaluating ? (
                          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isAnswering ? (
                          <MicOff className="w-8 h-8" />
                        ) : (
                          <Mic className="w-8 h-8" />
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        {isEvaluating ? 'Evaluating response...' : 
                         isAnswering ? 'Recording... Click to stop' : 'Click to start recording'}
                      </p>
                    </div>
                  </div>

                  {/* Current transcript */}
                  {(transcript || currentResponse) && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Current response:</p>
                      <p className="text-foreground">{currentResponse || transcript}</p>
                    </div>
                  )}

                  {/* Text Alternative */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Or type your answer:</Label>
                    <Textarea 
                      placeholder="Type your response here..."
                      className="bg-input border-border min-h-32"
                      value={currentResponse}
                      onChange={(e) => setCurrentResponse(e.target.value)}
                      disabled={isAnswering}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={skipQuestion}>
                      <SkipForward className="w-4 h-4 mr-2" />
                      Skip Question
                    </Button>
                    <Button 
                      onClick={stopAnswering}
                      disabled={!currentResponse.trim() || isEvaluating}
                    >
                      {isEvaluating ? 'Processing...' : 'Submit & Next'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Interview Progress */}
              <Card className="p-6 bg-card border-border shadow-card">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Questions Completed</span>
                    <span className="text-sm font-medium">{currentQuestionIndex}/{totalQuestions}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time Remaining</span>
                    <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
              </Card>

              {/* Interview Details */}
              <Card className="p-6 bg-card border-border shadow-card">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Interview Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span>{currentSession.customRole || currentSession.jobRole.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="capitalize">{currentSession.difficulty}</span>
                  </div>
                  {currentSession.stressField && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Focus Area:</span>
                      <span>{currentSession.stressField}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Interview Tips */}
              <Card className="p-6 bg-card border-border shadow-card">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• Use specific examples from your experience</li>
                  <li>• Structure your answers (STAR method)</li>
                  <li>• Take a moment to think before answering</li>
                  <li>• Ask clarifying questions if needed</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading or error state
  return (
    <div className="min-h-screen bg-background font-inter flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading interview...</p>
      </div>
    </div>
  );
};

export default Interview;