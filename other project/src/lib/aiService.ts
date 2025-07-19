import { Message, InterviewSettings, InterviewReport } from '@/types';

export interface AIResponse {
  content: string;
  corrections?: string[];
  score?: number;
  suggestions?: string[];
}

export class AIService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey: string, apiUrl: string = '/api/chat', model: string = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.model = model;
  }

  async sendMessage(
    messages: Message[],
    mode: 'practice' | 'interview' | 'general',
    context?: any
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(mode, context);
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: mode === 'practice' ? 0.7 : 0.9,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.choices[0].message.content, mode);
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  private getSystemPrompt(mode: 'practice' | 'interview' | 'general', context?: any): string {
    const basePrompt = `You are an advanced English communication AI assistant designed to help users improve their English speaking skills. Always respond in a helpful, encouraging, and constructive manner.`;

    switch (mode) {
      case 'practice':
        return `${basePrompt}

PRACTICE MODE:
- Help users practice English conversation
- Correct grammar, pronunciation hints (in text), and vocabulary mistakes gently
- Provide suggestions for better expressions
- Keep conversations engaging and natural
- Ask follow-up questions to maintain dialogue
- Give encouragement and positive feedback
- When correcting, use format: "That's good! A more natural way to say it would be: '[correction]'"
- Rate responses from 1-10 for fluency and accuracy
- Suggest improvements for vocabulary and grammar`;

      case 'interview':
        const interviewSettings = context?.interviewSettings as InterviewSettings;
        return `${basePrompt}

INTERVIEW MODE:
- You are conducting a job interview for a ${interviewSettings?.role || 'Software Developer'} position
- Difficulty level: ${interviewSettings?.difficulty || 'medium'}
- Ask relevant technical and behavioral questions
- Evaluate responses professionally
- Focus areas: ${interviewSettings?.focusAreas?.join(', ') || 'general technical skills, problem-solving, communication'}
- Ask follow-up questions based on responses
- Be professional but friendly
- Evaluate: technical knowledge, communication skills, problem-solving ability, experience relevance
- Provide constructive feedback
- Keep interview engaging and realistic
${interviewSettings?.customInstructions ? `\nAdditional instructions: ${interviewSettings.customInstructions}` : ''}`;

      case 'general':
      default:
        return `${basePrompt}

GENERAL MODE:
- Engage in natural conversation
- Provide helpful responses to questions
- Correct language mistakes when appropriate
- Be supportive and educational
- Adapt to the user's communication style
- Provide explanations when needed`;
    }
  }

  private parseAIResponse(content: string, mode: 'practice' | 'interview' | 'general'): AIResponse {
    const response: AIResponse = { content };

    if (mode === 'practice') {
      // Extract corrections and suggestions from practice responses
      const correctionMatch = content.match(/\[CORRECTION\]([\s\S]*?)\[\/CORRECTION\]/);
      const scoreMatch = content.match(/\[SCORE\](\d+)\/10\[\/SCORE\]/);
      const suggestionsMatch = content.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/);

      if (correctionMatch) {
        response.corrections = [correctionMatch[1].trim()];
      }
      if (scoreMatch) {
        response.score = parseInt(scoreMatch[1]);
      }
      if (suggestionsMatch) {
        response.suggestions = suggestionsMatch[1].split('\n').filter(s => s.trim());
      }
    }

    return response;
  }

  async generateInterviewReport(
    messages: Message[],
    settings: InterviewSettings,
    duration: number
  ): Promise<InterviewReport> {
    try {
      const reportPrompt = `
Analyze this interview session and generate a comprehensive report.

Interview Details:
- Role: ${settings.role}
- Difficulty: ${settings.difficulty}
- Duration: ${duration} minutes
- Focus Areas: ${settings.focusAreas.join(', ')}

Interview Conversation:
${messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}

Generate a detailed interview report with:
1. Overall score (0-100)
2. Section scores for technical, communication, problem-solving, and experience
3. Strengths and weaknesses
4. Specific recommendations for improvement
5. Detailed feedback

Format the response as JSON with the following structure:
{
  "overallScore": number,
  "sections": {
    "technical": {"score": number, "feedback": string, "improvements": [string]},
    "communication": {"score": number, "feedback": string, "improvements": [string]},
    "problemSolving": {"score": number, "feedback": string, "improvements": [string]},
    "experience": {"score": number, "feedback": string, "improvements": [string]}
  },
  "strengths": [string],
  "weaknesses": [string],
  "recommendations": [string],
  "detailedFeedback": string
}`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are an expert interview evaluator. Provide detailed, constructive feedback.' },
            { role: 'user', content: reportPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Report generation error: ${response.status}`);
      }

      const data = await response.json();
      const reportData = JSON.parse(data.choices[0].message.content);

      return {
        ...reportData,
        duration,
        totalQuestions: messages.filter(m => m.role === 'assistant').length,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error generating interview report:', error);
      throw error;
    }
  }
}
