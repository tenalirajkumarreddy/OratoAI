import { Message } from '@/types';

export interface AIResponse {
  content: string;
  corrections?: string[];
  score?: number;
  suggestions?: string[];
}

export interface AIProviderConfig {
  name: string;
  baseUrl: string;
  supportedModels: string[];
  requiresAuth: boolean;
}

export const AI_PROVIDERS: Record<string, AIProviderConfig> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    supportedModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4-turbo'],
    requiresAuth: true,
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    supportedModels: [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'deepseek/deepseek-chat',
      'google/gemini-pro',
      'meta-llama/llama-3.1-405b-instruct',
    ],
    requiresAuth: true,
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    supportedModels: ['deepseek-chat', 'deepseek-coder'],
    requiresAuth: true,
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    supportedModels: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    requiresAuth: true,
  },
};

export class AIService {
  private apiKey: string;
  private provider: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, provider: string = 'openai', model: string = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.provider = provider;
    this.model = model;
    this.baseUrl = AI_PROVIDERS[provider]?.baseUrl || AI_PROVIDERS.openai.baseUrl;
  }

  async sendMessage(messages: Message[], context?: string): Promise<AIResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(context);
      
      // Format messages for API
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      const requestBody = {
        model: this.model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Set authorization header based on provider
      if (this.provider === 'anthropic') {
        headers['x-api-key'] = this.apiKey;
        headers['anthropic-version'] = '2023-06-01';
      } else {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      // Add provider-specific headers
      if (this.provider === 'openrouter') {
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'Speak with Spark AI';
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`AI API error (${response.status}): ${errorData}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.content?.[0]?.text || '';
      
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  private getSystemPrompt(context?: string): string {
    const basePrompt = `You are an advanced English conversation AI assistant designed to help users improve their English speaking skills. Your primary goal is to maintain engaging conversations while gently correcting grammar, vocabulary, and pronunciation issues.

CONVERSATION GUIDELINES:
- Keep conversations natural and flowing
- Ask follow-up questions to maintain engagement
- Provide gentle corrections in a supportive way
- Suggest better expressions when appropriate
- Give encouragement and positive feedback
- Rate responses from 1-10 for fluency and accuracy when appropriate
- Use format for corrections: "That's good! A more natural way to say it would be: '[correction]'"

RESPONSE STYLE:
- Be conversational and friendly
- Maintain enthusiasm and encouragement
- Ask open-ended questions to continue dialogue
- Provide cultural context when relevant
- Keep responses concise but informative`;

    if (context) {
      return `${basePrompt}

ADDITIONAL CONTEXT:
The user has provided the following context/document to discuss:
${context}

Please reference this context in your conversations and help the user practice discussing this topic in English.`;
    }

    return basePrompt;
  }

  private parseAIResponse(content: string): AIResponse {
    const response: AIResponse = { content };

    // Extract corrections and suggestions from response
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

    return response;
  }
}
