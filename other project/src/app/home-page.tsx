'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/ChatInterface';
import { InterviewSetup } from '@/components/InterviewSetup';
import { InterviewReportView } from '@/components/InterviewReportView';
import { SettingsDialog } from '@/components/SettingsDialog';
import { MessageSquare, Briefcase, Users, Settings, Clock, Star } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { InterviewSettings, InterviewReport } from '@/types';
import { AIService } from '@/lib/aiService';
import { formatTime } from '@/lib/utils';

export default function Home() {
  const { state, dispatch } = useApp();
  const [currentMode, setCurrentMode] = useState<'practice' | 'interview' | 'general' | null>(null);
  const [interviewReport, setInterviewReport] = useState<InterviewReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);

  const handleModeSelect = (mode: 'practice' | 'interview' | 'general') => {
    dispatch({ type: 'CREATE_SESSION', payload: { mode } });
    setCurrentMode(mode);
  };

  const handleInterviewStart = (settings: InterviewSettings) => {
    dispatch({ type: 'CREATE_SESSION', payload: { mode: 'interview' } });
    if (state.currentSession) {
      dispatch({ 
        type: 'UPDATE_SESSION_CONTEXT', 
        payload: { 
          sessionId: state.currentSession.id,
          context: { interviewSettings: settings } 
        } 
      });
    }
    setCurrentMode('interview');
    setInterviewStartTime(new Date());
  };

  const handleInterviewComplete = async () => {
    if (!state.currentSession || currentMode !== 'interview') return;

    const session = state.currentSession;
    const settings = session.context.interviewSettings;
    const messages = session.context.messages;

    if (!settings || messages.length === 0) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const aiService = new AIService(state.config.apiKey, state.config.apiUrl, state.config.model);
      const duration = interviewStartTime 
        ? Math.floor((Date.now() - interviewStartTime.getTime()) / 1000 / 60)
        : settings.duration;
      
      const report = await aiService.generateInterviewReport(messages, settings, duration);
      setInterviewReport(report);
      setShowReport(true);
      
      // End the current session
      dispatch({ type: 'END_SESSION', payload: session.id });
      setCurrentMode(null);
      setInterviewStartTime(null);
      
    } catch (error) {
      console.error('Error generating interview report:', error);
      alert('Failed to generate interview report. Please check your API settings.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleBackToHome = () => {
    if (state.currentSession) {
      dispatch({ type: 'END_SESSION', payload: state.currentSession.id });
    }
    setCurrentMode(null);
    setInterviewStartTime(null);
  };

  const getActiveSessions = () => {
    return Array.from(state.sessions.values()).filter(session => session.isActive);
  };

  const getModeDescription = (mode: 'practice' | 'interview' | 'general') => {
    switch (mode) {
      case 'practice':
        return 'Practice English conversation with AI corrections and feedback';
      case 'interview':
        return 'Mock interview with personalized questions and detailed report';
      case 'general':
        return 'General conversation and assistance with document uploads';
    }
  };

  const getModeIcon = (mode: 'practice' | 'interview' | 'general') => {
    switch (mode) {
      case 'practice':
        return <MessageSquare className="h-5 w-5" />;
      case 'interview':
        return <Briefcase className="h-5 w-5" />;
      case 'general':
        return <Users className="h-5 w-5" />;
    }
  };

  // Home Screen
  if (!currentMode || !state.currentSession) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  English Speaking Platform
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered English communication practice and interview preparation
                </p>
              </div>
              <SettingsDialog />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Improve Your English Communication</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practice speaking, get real-time corrections, prepare for interviews, 
              and enhance your communication skills with AI-powered assistance.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(['practice', 'interview', 'general'] as const).map((mode) => (
              <div key={mode} className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {getModeIcon(mode)}
                  <h3 className="text-xl font-semibold ml-3 capitalize">{mode} Mode</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  {getModeDescription(mode)}
                </p>
                {mode === 'interview' ? (
                  <InterviewSetup onStartInterview={handleInterviewStart} />
                ) : (
                  <Button 
                    onClick={() => handleModeSelect(mode)}
                    className="w-full"
                    size="lg"
                  >
                    Start {mode} Session
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Active Sessions */}
          {getActiveSessions().length > 0 && (
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Active Sessions
              </h3>
              <div className="space-y-2">
                {getActiveSessions().map(session => (
                  <div key={session.id} className="flex items-center justify-between bg-card p-3 rounded border">
                    <div>
                      <span className="font-medium capitalize">{session.mode} Session</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        Started {formatTime(Math.floor((Date.now() - session.startTime.getTime()) / 1000))} ago
                      </span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => {
                        dispatch({ type: 'SET_CURRENT_SESSION', payload: session.id });
                        setCurrentMode(session.mode);
                      }}
                    >
                      Resume
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Setup Notice */}
          {!state.config.apiKey && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-8">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Setup Required</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Please configure your AI API key in settings to start using the platform.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Interview Report Modal */}
        <InterviewReportView
          report={interviewReport}
          isOpen={showReport}
          onClose={() => setShowReport(false)}
        />
      </div>
    );
  }

  // Active Session View
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Session Header */}
      <header className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleBackToHome}>
              ← Back to Home
            </Button>
            <div className="flex items-center space-x-2">
              {getModeIcon(currentMode)}
              <h2 className="text-lg font-semibold capitalize">{currentMode} Mode</h2>
              {interviewStartTime && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(Math.floor((Date.now() - interviewStartTime.getTime()) / 1000))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentMode === 'interview' && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleInterviewComplete}
                disabled={!state.currentSession?.context.messages.length}
              >
                End Interview
              </Button>
            )}
            <SettingsDialog />
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1">
        <ChatInterface 
          mode={currentMode}
          onComplete={currentMode === 'interview' ? handleInterviewComplete : undefined}
        />
      </div>

      {/* Interview Report Modal */}
      <InterviewReportView
        report={interviewReport}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </div>
  );
}
