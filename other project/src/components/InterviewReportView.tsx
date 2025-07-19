'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Star, Clock, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { InterviewReport } from '@/types';
import { formatTime } from '@/lib/utils';

interface InterviewReportViewProps {
  report: InterviewReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InterviewReportView({ report, isOpen, onClose }: InterviewReportViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  if (!report) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const downloadReport = () => {
    const reportContent = `
INTERVIEW REPORT
===============

Date: ${report.timestamp.toLocaleDateString()}
Duration: ${formatTime(report.duration * 60)}
Questions Asked: ${report.totalQuestions}

OVERALL SCORE: ${report.overallScore}/100

SECTION SCORES:
- Technical Skills: ${report.sections.technical.score}/100
- Communication: ${report.sections.communication.score}/100
- Problem Solving: ${report.sections.problemSolving.score}/100
- Experience: ${report.sections.experience.score}/100

STRENGTHS:
${report.strengths.map(strength => `• ${strength}`).join('\n')}

AREAS FOR IMPROVEMENT:
${report.weaknesses.map(weakness => `• ${weakness}`).join('\n')}

RECOMMENDATIONS:
${report.recommendations.map(rec => `• ${rec}`).join('\n')}

DETAILED FEEDBACK:
${report.detailedFeedback}

SECTION FEEDBACK:

Technical Skills:
${report.sections.technical.feedback}
Improvements:
${report.sections.technical.improvements.map(imp => `• ${imp}`).join('\n')}

Communication:
${report.sections.communication.feedback}
Improvements:
${report.sections.communication.improvements.map(imp => `• ${imp}`).join('\n')}

Problem Solving:
${report.sections.problemSolving.feedback}
Improvements:
${report.sections.problemSolving.improvements.map(imp => `• ${imp}`).join('\n')}

Experience:
${report.sections.experience.feedback}
Improvements:
${report.sections.experience.improvements.map(imp => `• ${imp}`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${report.timestamp.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Interview Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                Duration: {formatTime(report.duration * 60)}
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                Questions: {report.totalQuestions}
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                Date: {report.timestamp.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-muted">
              <div className={`absolute inset-2 rounded-full ${getScoreBackground(report.overallScore)} opacity-20`}></div>
              <div className="text-center z-10">
                <div className={`text-3xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </div>
                <div className="text-sm text-muted-foreground">Overall</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'detailed' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('detailed')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Detailed Analysis
            </Button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Section Scores */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Section Scores</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(report.sections).map(([key, section]) => (
                    <div key={key} className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`font-bold ${getScoreColor(section.score)}`}>
                          {section.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBackground(section.score)}`}
                          style={{ width: `${section.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-green-600">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {report.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-red-600">
                    <TrendingDown className="h-5 w-5 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {report.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <ul className="space-y-2">
                    {report.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Tab */}
          {activeTab === 'detailed' && (
            <div className="space-y-6">
              {/* Overall Feedback */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Overall Feedback</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{report.detailedFeedback}</p>
                </div>
              </div>

              {/* Section Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Section Analysis</h3>
                <div className="space-y-4">
                  {Object.entries(report.sections).map(([key, section]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <span className={`font-bold ${getScoreColor(section.score)}`}>
                          {section.score}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{section.feedback}</p>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Improvements:</h5>
                        <ul className="space-y-1">
                          {section.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
