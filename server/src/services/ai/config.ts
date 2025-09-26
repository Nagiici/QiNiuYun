/**
 * AI服务配置管理
 */

import { AIProvider, AIProviderConfig, AIConfiguration } from '../../types';

export class AIConfigManager {
  private static instance: AIConfigManager;
  private config: AIConfiguration;

  private constructor() {
    this.config = this.initializeConfig();
  }

  public static getInstance(): AIConfigManager {
    if (!AIConfigManager.instance) {
      AIConfigManager.instance = new AIConfigManager();
    }
    return AIConfigManager.instance;
  }

  private initializeConfig(): AIConfiguration {
    return {
      currentProvider: (process.env.AI_CURRENT_PROVIDER as AIProvider) || 'groq',
      providers: {
        groq: {
          apiKey: process.env.GROQ_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1',
          model: 'llama-3.1-70b-versatile',
          maxTokens: 8192,
          temperature: 0.7,
          timeout: 30000
        },
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
          model: 'gpt-3.5-turbo',
          maxTokens: 4096,
          temperature: 0.7,
          timeout: 30000
        },
        cohere: {
          apiKey: process.env.COHERE_API_KEY,
          baseURL: 'https://api.cohere.ai/v1',
          model: 'command-light',
          maxTokens: 4096,
          temperature: 0.7,
          timeout: 30000
        },
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY,
          baseURL: 'https://api.anthropic.com/v1',
          model: 'claude-3-haiku-20240307',
          maxTokens: 4096,
          temperature: 0.7,
          timeout: 30000
        },
        ollama: {
          baseURL: process.env.OLLAMA_URL || 'http://localhost:11434',
          model: 'llama3.1:8b',
          maxTokens: 8192,
          temperature: 0.7,
          timeout: 60000
        }
      },
      fallbackProviders: ['groq', 'openai', 'cohere'],
      globalSettings: {
        maxContextLength: 32000,
        defaultTemperature: 0.7,
        enableFallback: true,
        enableCaching: true,
        enableRateLimiting: true
      }
    };
  }

  public getConfig(): AIConfiguration {
    return this.config;
  }

  public getProviderConfig(provider: AIProvider): AIProviderConfig | null {
    return this.config.providers[provider] || null;
  }

  public getCurrentProvider(): AIProvider {
    return this.config.currentProvider;
  }

  public setCurrentProvider(provider: AIProvider): void {
    if (this.config.providers[provider]) {
      this.config.currentProvider = provider;
    } else {
      throw new Error(`Provider ${provider} is not configured`);
    }
  }

  public updateProviderConfig(provider: AIProvider, config: Partial<AIProviderConfig>): void {
    if (this.config.providers[provider]) {
      this.config.providers[provider] = {
        ...this.config.providers[provider],
        ...config
      };
    } else {
      throw new Error(`Provider ${provider} is not configured`);
    }
  }

  public isProviderConfigured(provider: AIProvider): boolean {
    const config = this.config.providers[provider];
    if (!config) return false;

    // Ollama 不需要 API key
    if (provider === 'ollama') {
      return !!config.baseURL;
    }

    return !!config.apiKey;
  }

  public getConfiguredProviders(): AIProvider[] {
    return Object.keys(this.config.providers).filter(
      provider => this.isProviderConfigured(provider as AIProvider)
    ) as AIProvider[];
  }

  public getProviderStatus(provider: AIProvider) {
    const config = this.config.providers[provider];
    if (!config) {
      return { configured: false, model: '', available: false };
    }

    return {
      configured: this.isProviderConfigured(provider),
      model: config.model || '',
      available: this.isProviderConfigured(provider)
    };
  }

  public getAllProvidersStatus() {
    const status: Record<AIProvider, any> = {} as any;

    Object.keys(this.config.providers).forEach(provider => {
      status[provider as AIProvider] = this.getProviderStatus(provider as AIProvider);
    });

    return {
      currentProvider: this.config.currentProvider,
      providers: status
    };
  }

  public validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const configuredProviders = this.getConfiguredProviders();

    if (configuredProviders.length === 0) {
      errors.push('No AI providers are configured');
    }

    if (!this.isProviderConfigured(this.config.currentProvider)) {
      errors.push(`Current provider ${this.config.currentProvider} is not configured`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 安全地返回配置信息（不暴露API密钥）
  public getSafeConfig() {
    const safeProviders: Record<string, any> = {};

    Object.keys(this.config.providers).forEach(provider => {
      const config = this.config.providers[provider as AIProvider];
      safeProviders[provider] = {
        configured: this.isProviderConfigured(provider as AIProvider),
        model: config.model,
        baseURL: config.baseURL,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        timeout: config.timeout
        // 不包含 apiKey
      };
    });

    return {
      currentProvider: this.config.currentProvider,
      providers: safeProviders,
      globalSettings: this.config.globalSettings
    };
  }
}