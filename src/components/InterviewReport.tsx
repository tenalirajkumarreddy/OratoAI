import React from 'react';
import { InterviewReport } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, User, Clock, Trophy, Star, Users, Target } from 'lucide-react';

interface InterviewReportComponentProps {
  report: InterviewReport;
  onDownload?: () => void;
  onStartNew?: () => void;
}

const InterviewReportComponent: React.FC<InterviewReportComponentProps> = ({
  report,
  onDownload,
  onStartNew
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Orato AI Logo */}
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Orato AI</h1>
                <p className="text-blue-100">Interview Report</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Interview Date</p>
              <p className="font-semibold">{report.interviewDetails.date}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 mr-2" />
                <span className="text-sm">Resume Match</span>
              </div>
              <div className="text-2xl font-bold">{report.interviewDetails.resumeMatch}%</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 mr-2" />
                <span className="text-sm">Duration</span>
              </div>
              <div className="text-2xl font-bold">{report.interviewDetails.duration}</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 mr-2" />
                <span className="text-sm">Overall Score</span>
              </div>
              <div className="text-2xl font-bold">{report.overallScore}/100</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 mr-2" />
                <span className="text-sm">Signal Strength</span>
              </div>
              <div className="text-2xl font-bold">{report.interviewDetails.signalStrength}</div>
            </div>
          </div>
        </div>

        {/* Candidate Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Candidate Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name:</label>
              <p className="font-semibold">{report.candidate.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email:</label>
              <p className="font-semibold">{report.candidate.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Mobile:</label>
              <p className="font-semibold">{report.candidate.phone || 'Not provided'}</p>
            </div>
          </div>
        </Card>

        {/* Communication Competencies */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Communication</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(report.competencies.communication).map(([skill, score]) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium capitalize">
                    {skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                    {score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Skill-specific Rating */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Skill Specific Rating</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Skill</th>
                  <th className="text-center py-3 px-4 font-medium">Rating</th>
                  <th className="text-center py-3 px-4 font-medium">Feedback</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {Object.entries(report.competencies.technical).map(([skill, score], index) => (
                  <tr key={skill} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 capitalize">
                      {skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 mr-1 ${
                                i < Math.floor(score / 10) ? getProgressColor(score) : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {score.toFixed(1)}/10
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={score >= 70 ? 'default' : score >= 50 ? 'secondary' : 'destructive'}>
                        {score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'Needs Improvement'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Questions and Evaluation */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Questions and Evaluation</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Asked Questions</th>
                  <th className="text-center py-3 px-4 font-medium">Skill Matched</th>
                </tr>
              </thead>
              <tbody>
                {report.questions.map((question, index) => (
                  <tr key={question.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4">{question.question}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline">{question.category}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Technical Competencies */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Technical Competencies</h2>
          <div className="space-y-4">
            {Object.entries(report.competencies.technical).map(([skill, score]) => {
              const feedback = score >= 70 
                ? `Strong understanding of ${skill.replace(/([A-Z])/g, ' $1').toLowerCase()} with effective practical application.`
                : score >= 50
                ? `Good grasp of ${skill.replace(/([A-Z])/g, ' $1').toLowerCase()} concepts, but could benefit from more practice.`
                : `Limited understanding of ${skill.replace(/([A-Z])/g, ' $1').toLowerCase()}. Significant improvement needed.`;

              return (
                <div key={skill} className="border-l-4 border-teal-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold capitalize text-lg">
                      {skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(score / 10) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`font-bold ${getScoreColor(score)}`}>
                        {score}/100
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Overall Feedback */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Feedback</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">{report.feedback}</p>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <span className="font-semibold">Hiring Decision:</span>
                <Badge 
                  variant={report.hiringDecision === 'Recommended' ? 'default' : 'destructive'}
                  className="px-3 py-1"
                >
                  {report.hiringDecision}
                </Badge>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Generated using Orato AI</p>
                <p>Report is generated using GenAI and the content should be carefully re-validated before taking any hiring decision.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-center space-x-4 pt-6">
          {onDownload && (
            <Button onClick={onDownload} variant="outline" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </Button>
          )}
          {onStartNew && (
            <Button onClick={onStartNew} size="lg">
              Start New Interview
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewReportComponent;
