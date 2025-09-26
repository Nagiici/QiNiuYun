/**
 * AI提供商统一导出
 */

export { BaseAIProvider } from './base';
export { GroqProvider } from './groq';
export { OllamaProvider } from './ollama';

// 导出提供商工厂
import { BaseAIProvider } from './base';
import { GroqProvider } from './groq';
import { OllamaProvider } from './ollama';
import { AIProvider } from '../../../types';

export class ProviderFactory {
  static createProvider(providerType: AIProvider, config: any): BaseAIProvider {
    switch (providerType) {
      case 'groq':
        return new GroqProvider(config);
      case 'ollama':
        return new OllamaProvider(config);
      default:
        throw new Error(`Unsupported provider: ${providerType}`);
    }
  }

  static getSupportedProviders(): AIProvider[] {
    return ['groq', 'ollama'];
  }
}