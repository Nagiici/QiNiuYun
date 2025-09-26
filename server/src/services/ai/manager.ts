/**
 * AI服务管理器
 * 统一管理所有AI提供商和服务
 */

import { BaseAIProvider, ProviderFactory } from './providers';
import { AIConfigManager } from './config';
import { CharacterService } from './character';
import { EmotionService } from './emotion';
import {
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  Character,
  Message,
  AIError
} from '../../types';

export class AIServiceManager {
  private static instance: AIServiceManager;
  private configManager: AIConfigManager;
  private characterService: CharacterService;
  private emotionService: EmotionService;
  private providers: Map<AIProvider, BaseAIProvider> = new Map();

  private constructor() {
    this.configManager = AIConfigManager.getInstance();
    this.characterService = new CharacterService();
    this.emotionService = new EmotionService();
    this.initializeProviders();
  }

  public static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  private initializeProviders(): void {
    const config = this.configManager.getConfig();
    const supportedProviders = ProviderFactory.getSupportedProviders();

    supportedProviders.forEach(providerType => {
      try {
        const providerConfig = config.providers[providerType];
        if (providerConfig) {
          const provider = ProviderFactory.createProvider(providerType, providerConfig);
          this.providers.set(providerType, provider);
        }
      } catch (error) {
        console.warn(`Failed to initialize provider ${providerType}:`, error);
      }
    });
  }

  public async generateCharacterResponse(
    character: Character,
    userMessage: string,
    conversationHistory: Message[] = [],
    context?: any
  ): Promise<{
    response: string;
    emotion?: string;
    metadata: any;
  }> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No active AI provider available');
    }

    // 构建系统提示
    const systemPrompt = this.characterService.buildSystemPrompt(character, context);

    // 构建对话历史
    const messages = this.buildConversationMessages(
      systemPrompt,
      conversationHistory,
      userMessage
    );

    try {
      const startTime = Date.now();

      // 生成AI回复
      const response = await provider.generateChatCompletion({
        model: provider.getProviderInfo().model,
        messages,
        temperature: this.getTemperatureForCharacter(character),
        maxTokens: 4096
      });

      const responseTime = Date.now() - startTime;
      const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

      // 分析情感
      let emotion: string | undefined;
      try {
        const emotionResult = await this.emotionService.analyzeEmotion(aiResponse);
        emotion = emotionResult.primary_emotion;
      } catch (error) {
        console.warn('Failed to analyze emotion:', error);
      }

      return {
        response: aiResponse,
        emotion,
        metadata: {
          provider: provider.getProviderInfo().provider,
          model: provider.getProviderInfo().model,
          responseTime,
          tokensUsed: response.usage?.totalTokens || 0,
          character: {
            id: character.id,
            name: character.name
          }
        }
      };
    } catch (error: any) {
      console.error('AI generation failed:', error);

      // 尝试降级处理
      if (this.configManager.getConfig().globalSettings.enableFallback) {
        return this.tryFallbackResponse(character, userMessage, error);
      }

      throw error;
    }
  }

  private async tryFallbackResponse(
    character: Character,
    userMessage: string,
    originalError: any
  ) {
    const fallbackProviders = this.configManager.getConfig().fallbackProviders || [];

    for (const providerType of fallbackProviders) {
      const provider = this.providers.get(providerType);
      if (provider && provider.isConfigured()) {
        try {
          console.log(`Trying fallback provider: ${providerType}`);

          const systemPrompt = this.characterService.buildSystemPrompt(character);
          const response = await provider.generateChatCompletion({
            model: provider.getProviderInfo().model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            maxTokens: 2048
          });

          const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

          return {
            response: aiResponse,
            emotion: 'neutral',
            metadata: {
              provider: providerType,
              model: provider.getProviderInfo().model,
              fallback: true,
              originalError: originalError.message
            }
          };
        } catch (fallbackError) {
          console.warn(`Fallback provider ${providerType} also failed:`, fallbackError);
          continue;
        }
      }
    }

    // 如果所有提供商都失败，返回预设回复
    return this.getEmergencyResponse(character);
  }

  private getEmergencyResponse(character: Character) {
    const emergencyResponses = [
      "抱歉，我现在遇到了一些技术问题，请稍后再试。",
      "我需要一点时间整理思绪，请稍等片刻。",
      "系统暂时不稳定，但我很快就会回来和你聊天。",
      "让我先调整一下状态，马上就好。"
    ];

    const randomResponse = emergencyResponses[Math.floor(Math.random() * emergencyResponses.length)];

    return {
      response: randomResponse,
      emotion: 'apologetic',
      metadata: {
        provider: 'emergency',
        model: 'fallback',
        emergency: true
      }
    };
  }

  public async testProviderConnection(providerType: AIProvider): Promise<{
    success: boolean;
    latency: number;
    model: string;
    error?: string;
  }> {
    const provider = this.providers.get(providerType);
    if (!provider) {
      return {
        success: false,
        latency: 0,
        model: '',
        error: `Provider ${providerType} not initialized`
      };
    }

    try {
      const result = await provider.testConnection();
      return result;
    } catch (error: any) {
      return {
        success: false,
        latency: 0,
        model: provider.getProviderInfo().model,
        error: error.message
      };
    }
  }

  public getProviderStatus() {
    return this.configManager.getAllProvidersStatus();
  }

  public async analyzeEmotion(text: string) {
    return this.emotionService.analyzeEmotion(text);
  }

  private getActiveProvider(): BaseAIProvider | null {
    const currentProvider = this.configManager.getCurrentProvider();
    return this.providers.get(currentProvider) || null;
  }

  private buildConversationMessages(
    systemPrompt: string,
    history: Message[],
    userMessage: string
  ) {
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // 添加对话历史（最近的20条消息）
    const recentHistory = history.slice(-20);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  private getTemperatureForCharacter(character: Character): number {
    const personality = character.personality_data;
    if (!personality) return 0.7;

    // 根据角色性格调整温度
    const baseTemperature = 0.7;
    const creativityFactor = (personality.creativity || 50) / 100;
    const energyFactor = (personality.energy || 50) / 100;

    return Math.min(1.0, baseTemperature + (creativityFactor * 0.2) + (energyFactor * 0.1));
  }

  // 更新配置
  public updateConfiguration(newConfig: any) {
    // 重新初始化提供商
    this.providers.clear();
    this.initializeProviders();
  }

  // 获取统计信息
  public getStatistics() {
    const providers = Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      configured: provider.isConfigured(),
      info: provider.getProviderInfo()
    }));

    return {
      totalProviders: this.providers.size,
      configuredProviders: providers.filter(p => p.configured).length,
      currentProvider: this.configManager.getCurrentProvider(),
      providers
    };
  }
}