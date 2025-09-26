/**
 * Groq AI提供商实现
 */

import { BaseAIProvider } from './base';
import { ChatCompletionRequest, ChatCompletionResponse, AIProvider } from '../../../types';

export class GroqProvider extends BaseAIProvider {
  constructor(config: any) {
    super('groq' as AIProvider, {
      ...config,
      baseURL: config.baseURL || 'https://api.groq.com/openai/v1',
      model: config.model || 'llama-3.1-70b-versatile'
    });
  }

  async generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.isConfigured()) {
      throw this.createError('Groq provider not configured');
    }

    const url = `${this.baseURL}/chat/completions`;
    const payload = {
      model: this.model,
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 4096,
      top_p: request.topP || 1.0,
      frequency_penalty: request.frequencyPenalty || 0,
      presence_penalty: request.presencePenalty || 0,
      stream: false
    };

    try {
      const startTime = Date.now();
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(payload)
      });

      const responseTime = Date.now() - startTime;

      return {
        id: response.id || `groq-${Date.now()}`,
        object: 'chat.completion',
        created: response.created || Math.floor(Date.now() / 1000),
        model: response.model || this.model,
        choices: response.choices || [],
        usage: response.usage || {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        metadata: {
          provider: this.provider,
          responseTime,
          cached: false,
          retryCount: 0
        }
      };
    } catch (error: any) {
      throw this.createError(`Groq API error: ${error.message}`, {
        originalError: error,
        request: payload
      });
    }
  }

  async testConnection(): Promise<{ success: boolean; latency: number; model: string }> {
    if (!this.isConfigured()) {
      return { success: false, latency: 0, model: this.model };
    }

    try {
      const startTime = Date.now();

      await this.generateChatCompletion({
        model: this.model,
        messages: [
          { role: 'user', content: 'Hello, please respond with just "OK"' }
        ],
        maxTokens: 10,
        temperature: 0
      });

      const latency = Date.now() - startTime;
      return { success: true, latency, model: this.model };
    } catch (error) {
      return { success: false, latency: 0, model: this.model };
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.baseURL && this.model);
  }

  protected buildHeaders(): Record<string, string> {
    const headers = super.buildHeaders();

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }
}