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
      'openai/gpt-4-turbo',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-haiku',
      'deepseek/deepseek-chat',
      'google/gemini-pro-1.5',
      'google/gemini-flash-1.5',
      'meta-llama/llama-3.1-405b-instruct',
      'meta-llama/llama-3.1-70b-instruct',
      'meta-llama/llama-3.1-8b-instruct',
      'mistralai/mistral-large',
      'mistralai/mistral-medium',
      'cohere/command-r-plus',
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
  perplexity: {
    name: 'Perplexity',
    baseUrl: 'https://api.perplexity.ai/chat/completions',
    supportedModels: [
      'llama-3.1-sonar-small-128k-online',
      'llama-3.1-sonar-large-128k-online',
      'llama-3.1-sonar-huge-128k-online',
      'llama-3.1-8b-instruct',
      'llama-3.1-70b-instruct',
      'mixtral-8x7b-instruct',
      'codellama-34b-instruct',
    ],
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
      // Debug logging for API key
      console.log('🔑 API Key check:', this.apiKey ? `Present (${this.apiKey.length} chars)` : 'MISSING');
      console.log('🚀 Provider:', this.provider);
      console.log('🤖 Model:', this.model);
      
      // Validate API key format for different providers
      if (this.provider === 'openrouter' && this.apiKey && !this.apiKey.startsWith('sk-or-v1-')) {
        console.warn('⚠️ Warning: OpenRouter API keys should start with "sk-or-v1-"');
        console.log('🔍 Your key starts with:', this.apiKey.substring(0, 10));
        
        // Auto-detect provider based on key format
        if (this.apiKey.startsWith('sk-') && !this.apiKey.startsWith('sk-or-')) {
          console.warn('💡 Suggestion: Your key looks like a DeepSeek key. Try changing Provider to "DeepSeek" in Settings.');
        }
      }
      
      if (this.provider === 'deepseek' && this.apiKey && !this.apiKey.startsWith('sk-')) {
        console.warn('⚠️ Warning: DeepSeek API keys should start with "sk-"');
        console.log('🔍 Your key starts with:', this.apiKey.substring(0, 10));
      }
      
      if (this.provider === 'openai' && this.apiKey && !this.apiKey.startsWith('sk-')) {
        console.warn('⚠️ Warning: OpenAI API keys should start with "sk-"');
        console.log('🔍 Your key starts with:', this.apiKey.substring(0, 10));
      }

      const systemPrompt = this.getSystemPrompt(context);
      
      // Format messages for API
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      const requestBody: any = {
        model: this.model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Set authorization header based on provider
      console.log('🔧 Setting auth header for provider:', this.provider);
      if (this.provider === 'anthropic') {
        headers['x-api-key'] = this.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        console.log('🔐 Anthropic auth header set');
      } else {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        console.log('🔐 Bearer auth header set');
      }

      // Debug: Check if authorization header is set
      console.log('🔐 Authorization header set:', headers['Authorization'] ? 'YES' : 'NO');
      if (headers['Authorization']) {
        console.log('🎫 Auth format:', headers['Authorization'].substring(0, 20) + '...');
      }
      if (headers['x-api-key']) {
        console.log('🎫 Anthropic key format:', headers['x-api-key'].substring(0, 10) + '...');
      }

      // Add provider-specific headers
      if (this.provider === 'openrouter') {
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'Orato AI';
        // Removed X-Prefer-Quality header as it causes CORS issues
      } else if (this.provider === 'perplexity') {
        // Perplexity-specific headers and configuration
        headers['User-Agent'] = 'Orato-AI/1.0';
        // Enable search for online models if using sonar models
        if (requestBody.model.includes('sonar')) {
          requestBody.return_citations = true;
          requestBody.return_images = false;
          requestBody.return_related_questions = false;
        }
      }

      // Debug logging for headers (without showing actual API key)
      console.log('📡 Headers:', Object.keys(headers));
      console.log('🎯 Request URL:', this.baseUrl);

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

// Debug function for testing API connection - available in browser console
(window as any).testOpenRouterAPI = async (apiKey: string) => {
  console.log('🧪 Testing OpenRouter API connection...');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Orato AI Test'
        // Removed problematic headers that cause CORS issues
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in one word.' }
        ],
        temperature: 0.7,
        max_tokens: 10
      })
    });

    console.log('📡 Response status:', response.status);
    const data = await response.text();
    console.log('📄 Response data:', data);
    
    if (response.ok) {
      console.log('✅ API connection successful!');
      return JSON.parse(data);
    } else {
      console.log('❌ API connection failed');
      return { error: data };
    }
  } catch (error) {
    console.log('💥 Network error:', error);
    return { error: error };
  }
};
