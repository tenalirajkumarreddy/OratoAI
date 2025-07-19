import { useState } from "react";
import { Upload, Clock, Target, FileText, Download, Settings, Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const Interview = () => {
  const [interviewState, setInterviewState] = useState<'setup' | 'active' | 'completed'>('setup');
  const [role, setRole] = useState("software-developer");
  const [difficulty, setDifficulty] = useState("medium");
  const [timeLimit, setTimeLimit] = useState("30");
  const [stressField, setStressField] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10);

  const roleOptions = [
    { value: "software-developer", label: "Software Developer" },
    { value: "frontend-developer", label: "Frontend Developer" },
    { value: "backend-developer", label: "Backend Developer" },
    { value: "fullstack-developer", label: "Fullstack Developer" },
    { value: "devops-engineer", label: "DevOps Engineer" },
    { value: "data-scientist", label: "Data Scientist" },
    { value: "product-manager", label: "Product Manager" },
    { value: "custom", label: "Custom Role" },
  ];

  const difficultyOptions = [
    { value: "easy", label: "Easy", color: "bg-success" },
    { value: "medium", label: "Medium", color: "bg-warning" },
    { value: "hard", label: "Hard", color: "bg-destructive" },
  ];

  const startInterview = () => {
    setInterviewState('active');
    setCurrentQuestion("Tell me about yourself and your experience in software development.");
  };

  const endInterview = () => {
    setInterviewState('completed');
  };

  if (interviewState === 'setup') {
    return (
      <div className="min-h-screen bg-background font-inter">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              AI Interview Simulator
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
                        <p className="text-sm text-muted-foreground">PDF format recommended</p>
                      </div>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
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
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Stress Test Field (Optional)</Label>
                  <Input 
                    placeholder="e.g., System Design, Algorithms"
                    value={stressField}
                    onChange={(e) => setStressField(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Additional Context</Label>
                <Textarea 
                  placeholder="Any specific topics you'd like to focus on or additional information..."
                  className="bg-input border-border"
                  rows={4}
                />
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  size="lg" 
                  onClick={startInterview}
                  className="px-8 py-3 text-lg font-semibold shadow-elegant hover:shadow-glow transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Interview
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (interviewState === 'active') {
    return (
      <div className="min-h-screen bg-background font-inter">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Interview Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Interview in Progress</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <Badge variant="outline">Question {questionNumber}/{totalQuestions}</Badge>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>25:30 remaining</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{role.replace('-', ' ')}</span>
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
                    <Badge className={difficultyOptions.find(d => d.value === difficulty)?.color}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-foreground text-lg leading-relaxed">
                    {currentQuestion}
                  </p>
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
                        className="w-20 h-20 rounded-full shadow-elegant hover:shadow-glow transition-all duration-300"
                      >
                        <Pause className="w-8 h-8" />
                      </Button>
                      <p className="text-sm text-muted-foreground">Click to start/stop recording</p>
                    </div>
                  </div>

                  {/* Text Alternative */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Or type your answer:</Label>
                    <Textarea 
                      placeholder="Type your response here..."
                      className="bg-input border-border min-h-32"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline">
                      Skip Question
                    </Button>
                    <Button>
                      Next Question
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
                    <span className="text-sm font-medium">{questionNumber - 1}/{totalQuestions}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time Elapsed</span>
                    <span className="text-sm font-medium">4:30</span>
                  </div>
                </div>
              </Card>

              {/* Quick Notes */}
              <Card className="p-6 bg-card border-border shadow-card">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Notes</h3>
                <Textarea 
                  placeholder="Jot down key points..."
                  className="bg-input border-border min-h-24"
                />
              </Card>

              {/* Interview Tips */}
              <Card className="p-6 bg-card border-border shadow-card">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• Use specific examples from your experience</li>
                  <li>• Structure your answers (STAR method)</li>
                  <li>• Ask clarifying questions if needed</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed state will be handled separately
  return null;
};

export default Interview;