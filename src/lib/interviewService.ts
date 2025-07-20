import { InterviewQuestion, InterviewSession, InterviewReport, UploadedFile } from '@/types';
import { AIService } from './aiService';

export class InterviewService {
  private aiService: AIService;
  private questions: InterviewQuestion[] = [];

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async generateQuestions(session: InterviewSession): Promise<InterviewQuestion[]> {
    const { jobRole, customRole, difficulty, stressField, resume, additionalContext } = session;
    
    const roleText = customRole || jobRole.replace('-', ' ');
    const resumeContext = resume?.content ? `\n\nCandidate's Resume:\n${resume.content}` : '';
    const stressContext = stressField ? `\n\nFocus heavily on: ${stressField}` : '';
    const additionalInfo = additionalContext ? `\n\nAdditional Context: ${additionalContext}` : '';

    const prompt = `Generate 15 interview questions for a ${roleText} position at ${difficulty} difficulty level.

Requirements:
- Start with "Tell me about yourself" as the first question
- Include 2-3 basic introduction/background questions
- Include 4-5 role-specific technical questions
- Include 2-3 behavioral questions (STAR method scenarios)
- Include 1-2 problem-solving questions
- Include 1-2 situational/hypothetical questions
- End with "Do you have any questions for us?"

${stressContext}
${resumeContext}
${additionalInfo}

Return ONLY a JSON array of questions in this format:
[
  {
    "question": "Tell me about yourself and your experience in software development.",
    "category": "Introduction",
    "difficulty": "easy"
  }
]

Categories should be: Introduction, Technical, Behavioral, Problem-Solving, Situational, Closing`;

    try {
      const response = await this.aiService.sendMessage([
        { id: '1', role: 'user', content: prompt, timestamp: new Date(), type: 'text' }
      ]);

      // Parse the AI response to extract questions
      const questionsData = this.parseQuestionsFromResponse(response.content);
      
      return questionsData.map((q, index) => ({
        id: `q-${index + 1}`,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard'
      }));
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.getFallbackQuestions(roleText, difficulty);
    }
  }

  private parseQuestionsFromResponse(content: string): any[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: parse manually if JSON format is not perfect
      const lines = content.split('\n').filter(line => line.trim());
      const questions = [];
      
      for (const line of lines) {
        if (line.includes('"question"') || line.toLowerCase().includes('tell me') || 
            line.toLowerCase().includes('describe') || line.toLowerCase().includes('how') ||
            line.toLowerCase().includes('what') || line.toLowerCase().includes('why')) {
          
          const questionText = line.replace(/^\d+\.\s*/, '').replace(/['"]/g, '').trim();
          if (questionText.length > 10) {
            questions.push({
              question: questionText,
              category: this.categorizeQuestion(questionText),
              difficulty: 'medium'
            });
          }
        }
      }
      
      return questions;
    } catch (error) {
      console.error('Error parsing questions:', error);
      return [];
    }
  }

  private categorizeQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('tell me about yourself') || lowerQuestion.includes('introduce')) {
      return 'Introduction';
    }
    if (lowerQuestion.includes('technical') || lowerQuestion.includes('algorithm') || 
        lowerQuestion.includes('code') || lowerQuestion.includes('system')) {
      return 'Technical';
    }
    if (lowerQuestion.includes('time when') || lowerQuestion.includes('situation') || 
        lowerQuestion.includes('example of')) {
      return 'Behavioral';
    }
    if (lowerQuestion.includes('problem') || lowerQuestion.includes('challenge')) {
      return 'Problem-Solving';
    }
    if (lowerQuestion.includes('would you') || lowerQuestion.includes('how would')) {
      return 'Situational';
    }
    if (lowerQuestion.includes('questions for us') || lowerQuestion.includes('any questions')) {
      return 'Closing';
    }
    
    return 'General';
  }

  private getFallbackQuestions(role: string, difficulty: string): InterviewQuestion[] {
    const baseQuestions = [
      { question: "Tell me about yourself and your experience in software development.", category: "Introduction", difficulty: "easy" },
      { question: "What interests you most about this role?", category: "Introduction", difficulty: "easy" },
      { question: "Walk me through your most challenging project.", category: "Behavioral", difficulty: "medium" },
      { question: "How do you stay updated with new technologies?", category: "Technical", difficulty: "easy" },
      { question: "Describe your approach to debugging a complex issue.", category: "Technical", difficulty: "medium" },
      { question: "Tell me about a time you had to work with a difficult team member.", category: "Behavioral", difficulty: "medium" },
      { question: "How would you explain a technical concept to a non-technical person?", category: "Situational", difficulty: "medium" },
      { question: "What are your salary expectations?", category: "General", difficulty: "easy" },
      { question: "Where do you see yourself in 5 years?", category: "General", difficulty: "easy" },
      { question: "Do you have any questions for us?", category: "Closing", difficulty: "easy" }
    ];

    return baseQuestions.map((q, index) => ({
      id: `fallback-${index + 1}`,
      question: q.question,
      category: q.category,
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard'
    }));
  }

  async evaluateResponse(question: InterviewQuestion, response: string, resume?: UploadedFile): Promise<{
    score: number;
    feedback: string;
  }> {
    const resumeContext = resume?.content ? `\n\nCandidate's Resume Context:\n${resume.content}` : '';
    
    const prompt = `Evaluate this interview response on a scale of 1-10:

Question: "${question.question}"
Category: ${question.category}
Candidate's Response: "${response}"
${resumeContext}

Provide evaluation considering:
- Relevance and completeness of the answer
- Communication clarity and structure
- Technical accuracy (if applicable)
- Use of specific examples
- Professional demeanor in language

Return your evaluation in this exact format:
SCORE: [number 1-10]
FEEDBACK: [detailed feedback in 2-3 sentences]`;

    try {
      const aiResponse = await this.aiService.sendMessage([
        { id: '1', role: 'user', content: prompt, timestamp: new Date(), type: 'text' }
      ]);

      const scoreMatch = aiResponse.content.match(/SCORE:\s*(\d+)/i);
      const feedbackMatch = aiResponse.content.match(/FEEDBACK:\s*(.+)/is);

      const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
      const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'Good response. Consider providing more specific examples.';

      return { score, feedback };
    } catch (error) {
      console.error('Error evaluating response:', error);
      return {
        score: 5,
        feedback: 'Unable to evaluate response at this time. Please continue with the next question.'
      };
    }
  }

  generateReport(session: InterviewSession): InterviewReport {
    const answeredQuestions = session.questions.filter(q => q.response && q.response.trim());
    const averageScore = answeredQuestions.length > 0 
      ? answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / answeredQuestions.length 
      : 0;

    // Extract candidate info from resume if available
    const candidateInfo = this.extractCandidateInfo(session.resume?.content || '');

    // Calculate competency scores based on question categories and responses
    const competencies = this.calculateCompetencies(session.questions);

    // Determine hiring decision based on overall performance
    const hiringDecision = averageScore >= 6 ? 'Recommended' : 'Not Recommended';

    const report: InterviewReport = {
      id: `report-${session.id}`,
      candidate: candidateInfo,
      interviewDetails: {
        date: session.startTime.toLocaleDateString(),
        duration: this.calculateDuration(session.startTime, session.endTime),
        resumeMatch: Math.round(averageScore * 10), // Convert to percentage
        signalStrength: averageScore >= 7 ? 'Good' : averageScore >= 5 ? 'Average' : 'Poor'
      },
      competencies,
      questions: session.questions,
      overallScore: Math.round(averageScore * 10),
      hiringDecision,
      feedback: this.generateOverallFeedback(session.questions, averageScore)
    };

    return report;
  }

  private extractCandidateInfo(resumeContent: string): { name?: string; email?: string; phone?: string } {
    const info: any = {};
    
    // Extract email
    const emailMatch = resumeContent.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) info.email = emailMatch[0];

    // Extract phone
    const phoneMatch = resumeContent.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch) info.phone = phoneMatch[0];

    // Extract name (simple heuristic)
    const lines = resumeContent.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // If first line looks like a name (2-3 words, title case, no numbers)
      if (firstLine.split(' ').length <= 3 && /^[A-Z][a-zA-Z\s]*$/.test(firstLine)) {
        info.name = firstLine;
      }
    }

    return info;
  }

  private calculateCompetencies(questions: InterviewQuestion[]) {
    const answeredQuestions = questions.filter(q => q.response && q.score);
    
    // Default values
    const competencies = {
      communication: {
        pronunciation: 65,
        fluency: 65,
        vocabulary: 55,
        spokenEnglishUnderstanding: 65,
        activeListening: 65,
        grammar: 62
      },
      technical: {
        verbalCommunication: 60,
        backgroundAndExperience: 77,
        dataStructuresAndAlgorithms: 67,
        operatingSystems: 47,
        databaseSystems: 65,
        computerNetworks: 70,
        objectOrientedProgramming: 35,
        coding: 80
      }
    };

    // Adjust based on actual responses
    if (answeredQuestions.length > 0) {
      const avgScore = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / answeredQuestions.length;
      const multiplier = avgScore / 10;

      // Adjust communication scores
      Object.keys(competencies.communication).forEach(key => {
        competencies.communication[key] = Math.round(competencies.communication[key] * multiplier);
      });

      // Adjust technical scores based on technical questions
      const technicalQuestions = answeredQuestions.filter(q => 
        q.category === 'Technical' || q.category === 'Problem-Solving'
      );
      
      if (technicalQuestions.length > 0) {
        const techAvg = technicalQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / technicalQuestions.length;
        const techMultiplier = techAvg / 10;
        
        Object.keys(competencies.technical).forEach(key => {
          competencies.technical[key] = Math.round(competencies.technical[key] * techMultiplier);
        });
      }
    }

    return competencies;
  }

  private calculateDuration(startTime: Date, endTime?: Date): string {
    const end = endTime || new Date();
    const diffMs = end.getTime() - startTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private generateOverallFeedback(questions: InterviewQuestion[], averageScore: number): string {
    const answeredQuestions = questions.filter(q => q.response);
    
    if (averageScore >= 8) {
      return `Excellent performance with strong technical knowledge and clear communication. Demonstrated effective problem-solving skills and provided specific examples. Shows great potential for the role.`;
    } else if (averageScore >= 6) {
      return `Good overall performance with solid understanding of key concepts. Communication was clear and responses showed relevant experience. Some areas could benefit from more detailed examples and deeper technical explanations.`;
    } else if (averageScore >= 4) {
      return `Average performance with basic understanding of concepts. Communication needs improvement and responses lacked specific examples. Technical explanations could be more precise and structured.`;
    } else {
      return `Below average performance with limited demonstration of required skills. Significant improvement needed in technical knowledge and communication clarity. Consider additional preparation and practice.`;
    }
  }
}
