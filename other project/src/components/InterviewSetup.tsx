'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUpload } from '@/components/FileUpload';
import { Briefcase, Clock, Target, Brain } from 'lucide-react';
import { InterviewSettings, UploadedFile } from '@/types';

interface InterviewSetupProps {
  onStartInterview: (settings: InterviewSettings) => void;
}

const defaultRoles = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'QA Engineer',
  'Mobile Developer',
  'UI/UX Designer',
];

const defaultFocusAreas = [
  'Technical Skills',
  'Problem Solving',
  'System Design',
  'Algorithms & Data Structures',
  'Database Design',
  'Cloud Technologies',
  'Communication Skills',
  'Leadership',
  'Project Experience',
  'Team Collaboration',
];

export function InterviewSetup({ onStartInterview }: InterviewSetupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<InterviewSettings>({
    role: 'Software Developer',
    difficulty: 'medium',
    duration: 30,
    focusAreas: ['Technical Skills', 'Problem Solving'],
    customInstructions: '',
  });
  const [resumeUploaded, setResumeUploaded] = useState(false);

  const handleRoleChange = (role: string) => {
    setSettings(prev => ({ ...prev, role }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setSettings(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleResumeUpload = (files: UploadedFile[]) => {
    if (files.length > 0) {
      const resumeFile = files[0];
      setSettings(prev => ({
        ...prev,
        resume: resumeFile as any // Convert to File type for the interface
      }));
      setResumeUploaded(true);
    }
  };

  const handleStartInterview = () => {
    if (settings.focusAreas.length === 0) {
      alert('Please select at least one focus area');
      return;
    }
    
    onStartInterview(settings);
    setIsOpen(false);
  };

  const getDifficultyDescription = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return 'Basic questions, suitable for junior roles';
      case 'medium':
        return 'Intermediate questions, suitable for mid-level roles';
      case 'hard':
        return 'Advanced questions, suitable for senior roles';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <Briefcase className="h-5 w-5 mr-2" />
          Start Interview Mode
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Setup</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Position/Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {defaultRoles.map(role => (
                <Button
                  key={role}
                  variant={settings.role === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleChange(role)}
                  className="justify-start"
                >
                  {role}
                </Button>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Custom role..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      handleRoleChange(target.value.trim());
                      target.value = '';
                    }
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: <span className="font-medium">{settings.role}</span>
            </p>
          </div>

          {/* Difficulty & Duration */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Difficulty Level
              </label>
              <div className="space-y-2">
                {(['easy', 'medium', 'hard'] as const).map(level => (
                  <Button
                    key={level}
                    variant={settings.difficulty === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, difficulty: level }))}
                    className="w-full justify-start"
                  >
                    <span className="capitalize">{level}</span>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {getDifficultyDescription(settings.difficulty)}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Duration (minutes)
              </label>
              <Input
                type="number"
                min="15"
                max="120"
                value={settings.duration}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  duration: parseInt(e.target.value) || 30 
                }))}
                placeholder="30"
              />
              <div className="space-y-1">
                <div className="flex space-x-1">
                  {[15, 30, 45, 60].map(duration => (
                    <Button
                      key={duration}
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, duration }))}
                      className="text-xs"
                    >
                      {duration}m
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Focus Areas */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Focus Areas (Select multiple)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {defaultFocusAreas.map(area => (
                <Button
                  key={area}
                  variant={settings.focusAreas.includes(area) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFocusAreaToggle(area)}
                  className="justify-start text-xs"
                >
                  {area}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {settings.focusAreas.length > 0 ? settings.focusAreas.join(', ') : 'None'}
            </p>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Custom Instructions (Optional)</label>
            <Textarea
              value={settings.customInstructions}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                customInstructions: e.target.value 
              }))}
              placeholder="Any specific requirements or areas you want the interviewer to focus on..."
              rows={3}
            />
          </div>

          {/* Resume Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Upload Resume (Recommended)</label>
            <FileUpload
              onFilesUploaded={handleResumeUpload}
              maxFiles={1}
              maxSize={5 * 1024 * 1024} // 5MB
            />
            <p className="text-xs text-muted-foreground">
              Upload your resume for personalized questions based on your experience
            </p>
          </div>

          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Interview Summary:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Role: <span className="font-medium text-foreground">{settings.role}</span></p>
              <p>• Difficulty: <span className="font-medium text-foreground capitalize">{settings.difficulty}</span></p>
              <p>• Duration: <span className="font-medium text-foreground">{settings.duration} minutes</span></p>
              <p>• Focus Areas: <span className="font-medium text-foreground">{settings.focusAreas.join(', ') || 'None selected'}</span></p>
              <p>• Resume: <span className="font-medium text-foreground">{resumeUploaded ? 'Uploaded' : 'Not uploaded'}</span></p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartInterview}
              disabled={settings.focusAreas.length === 0}
            >
              Start Interview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
