/**
 * AI提供商基础抽象类
 */

import { AIProvider, ChatCompletionRequest, ChatCompletionResponse, AIError } from '../../../types';

export abstract class BaseAIProvider {
  protected provider: AIProvider;
  protected apiKey?: string;
  protected baseURL: string;
  protected model: string;
  protected timeout: number;

  constructor(provider: AIProvider, config: any) {
    this.provider = provider;
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.model = config.model;
    this.timeout = config.timeout || 30000;
  }

  abstract generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  abstract testConnection(): Promise<{ success: boolean; latency: number; model: string }>;
  abstract isConfigured(): boolean;

  protected createError(message: string, details?: any): AIError {
    return {
      code: 'AI_SERVICE_ERROR',
      message,
      provider: this.provider,
      model: this.model,
      retryable: false,
      details
    };
  }

  protected async makeRequest(url: string, options: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw this.createError('Request timeout', { timeout: this.timeout });
      }

      throw this.createError(`Request failed: ${error.message}`, { originalError: error });
    }
  }

  protected buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AI-Character-Roleplay/1.0'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  public getProviderInfo() {
    return {
      provider: this.provider,
      model: this.model,
      baseURL: this.baseURL,
      configured: this.isConfigured()
    };
  }
}