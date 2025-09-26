/**
 * Ollama本地AI提供商实现
 */

import { BaseAIProvider } from './base';
import { ChatCompletionRequest, ChatCompletionResponse, AIProvider } from '../../../types';

export class OllamaProvider extends BaseAIProvider {
  constructor(config: any) {
    super('ollama' as AIProvider, {
      ...config,
      baseURL: config.baseURL || 'http://localhost:11434',
      model: config.model || 'llama3.1:8b'
    });
  }

  async generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.isConfigured()) {
      throw this.createError('Ollama provider not configured');
    }

    // 将对话消息转换为单一提示
    const prompt = this.convertMessagesToPrompt(request.messages);

    const url = `${this.baseURL}/api/generate`;
    const payload = {
      model: this.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: request.temperature || 0.7,
        num_predict: request.maxTokens || 4096,
        top_p: request.topP || 1.0
      }
    };

    try {
      const startTime = Date.now();
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseTime = Date.now() - startTime;

      return {
        id: `ollama-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: this.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: response.response || 'No response generated'
            },
            finishReason: response.done ? 'stop' : 'length'
          }
        ],
        usage: {
          promptTokens: response.prompt_eval_count || 0,
          completionTokens: response.eval_count || 0,
          totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0)
        },
        metadata: {
          provider: this.provider,
          responseTime,
          cached: false,
          retryCount: 0
        }
      };
    } catch (error: any) {
      throw this.createError(`Ollama API error: ${error.message}`, {
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

      // 检查Ollama是否运行
      const tagsUrl = `${this.baseURL}/api/tags`;
      const tagsResponse = await this.makeRequest(tagsUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // 检查模型是否可用
      const availableModels = tagsResponse.models || [];
      const modelExists = availableModels.some((m: any) => m.name === this.model);

      if (!modelExists) {
        return {
          success: false,
          latency: 0,
          model: this.model
        };
      }

      // 测试生成
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
    return !!(this.baseURL && this.model);
  }

  private convertMessagesToPrompt(messages: any[]): string {
    let prompt = '';

    for (const message of messages) {
      switch (message.role) {
        case 'system':
          prompt += `System: ${message.content}\n\n`;
          break;
        case 'user':
          prompt += `Human: ${message.content}\n\n`;
          break;
        case 'assistant':
          prompt += `Assistant: ${message.content}\n\n`;
          break;
      }
    }

    prompt += 'Assistant: ';
    return prompt;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const url = `${this.baseURL}/api/tags`;
      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return (response.models || []).map((model: any) => model.name);
    } catch (error) {
      return [];
    }
  }
}