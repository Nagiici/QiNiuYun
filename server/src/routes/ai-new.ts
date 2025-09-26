/**
 * 重构后的AI服务路由
 * 使用模块化的AI服务架构
 */

import express from 'express';
import { validate, chatMessageSchema, aiConfigSchema } from '../middleware/validation';
import { aiChatLimiter, configLimiter } from '../middleware/rateLimiter';
import { longCacheMiddleware } from '../middleware/cache';
import { aiServiceManager, aiConfigManager, emotionService } from '../services/ai';
import { DatabaseService } from '../database';
import { ErrorFormatter, createError } from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';

export const aiRouterNew = express.Router();

// ==================== 聊天对话相关 ====================

/**
 * AI对话生成
 */
aiRouterNew.post('/chat',
  aiChatLimiter,
  validate(chatMessageSchema),
  asyncHandler(async (req, res) => {
    const { message, character_id, session_id, character_data } = req.body;

    if (!message || !character_id) {
      throw createError.validation('Message and character_id are required');
    }

    let character;

    // 如果character_id是999且提供了character_data，使用临时角色数据（用于测试预览）
    if (character_id === 999 && character_data) {
      character = character_data;
    } else {
      // 获取数据库中的角色信息
      character = await DatabaseService.getCharacterById(character_id);
      if (!character) {
        throw createError.notFound('Character', character_id);
      }
    }

    // 获取对话历史
    let conversationHistory = [];
    if (session_id) {
      conversationHistory = await DatabaseService.getMessagesBySessionId(session_id);
    }

    // 生成AI回复
    const result = await aiServiceManager.generateCharacterResponse(
      character,
      message,
      conversationHistory
    );

    // 如果有session_id，保存消息到数据库
    if (session_id && character_id !== 999) {
      // 保存用户消息
      await DatabaseService.insertMessage({
        session_id,
        sender: 'user',
        message_type: 'text',
        content: message,
        timestamp: new Date().toISOString()
      });

      // 保存AI回复
      await DatabaseService.insertMessage({
        session_id,
        sender: 'ai',
        message_type: 'text',
        content: result.response,
        emotion: result.emotion,
        timestamp: new Date().toISOString()
      });
    }

    res.json(ErrorFormatter.formatSuccessResponse({
      response: result.response,
      emotion: result.emotion,
      metadata: result.metadata
    }));
  })
);

/**
 * 情感分析
 */
aiRouterNew.post('/emotion',
  aiChatLimiter,
  asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
      throw createError.validation('Message is required');
    }

    const emotionResult = await emotionService.analyzeEmotion(message);

    res.json(ErrorFormatter.formatSuccessResponse(emotionResult));
  })
);

// ==================== AI配置相关 ====================

/**
 * 获取AI配置状态
 */
aiRouterNew.get('/config',
  configLimiter,
  longCacheMiddleware(300), // 缓存5分钟
  asyncHandler(async (req, res) => {
    const status = aiConfigManager.getAllProvidersStatus();

    res.json(ErrorFormatter.formatSuccessResponse(status));
  })
);

/**
 * 更新AI配置
 */
aiRouterNew.post('/config',
  configLimiter,
  validate(aiConfigSchema),
  asyncHandler(async (req, res) => {
    const { provider, config } = req.body;

    if (!provider || !config) {
      throw createError.validation('Provider and config are required');
    }

    // 更新配置
    aiConfigManager.updateProviderConfig(provider, config);

    // 通知服务管理器更新
    aiServiceManager.updateConfiguration(aiConfigManager.getConfig());

    res.json(ErrorFormatter.formatSuccessResponse({
      message: 'AI configuration updated successfully',
      provider,
      status: aiConfigManager.getProviderStatus(provider)
    }));
  })
);

/**
 * 测试AI提供商连接
 */
aiRouterNew.post('/test-connection',
  configLimiter,
  asyncHandler(async (req, res) => {
    const { provider, config } = req.body;

    if (!provider) {
      throw createError.validation('Provider is required');
    }

    let testResult;

    if (config) {
      // 临时测试配置
      const tempManager = new (await import('../services/ai/manager')).AIServiceManager();
      testResult = await tempManager.testProviderConnection(provider);
    } else {
      // 测试当前配置
      testResult = await aiServiceManager.testProviderConnection(provider);
    }

    res.json(ErrorFormatter.formatSuccessResponse(testResult));
  })
);

// ==================== 语音服务相关 ====================

/**
 * 文本转语音
 */
aiRouterNew.post('/tts',
  aiChatLimiter,
  asyncHandler(async (req, res) => {
    const { text, voice = 'zh-CN' } = req.body;

    if (!text) {
      throw createError.validation('Text is required');
    }

    // 目前返回模拟数据，实际实现需要集成TTS服务
    res.json(ErrorFormatter.formatSuccessResponse({
      audio_url: '/api/tts/dummy_audio.mp3',
      message: 'TTS service is not implemented yet',
      text,
      voice
    }));
  })
);

/**
 * 语音转文本
 */
aiRouterNew.post('/speech-to-text',
  aiChatLimiter,
  asyncHandler(async (req, res) => {
    const { audio_data, language = 'zh-CN' } = req.body;

    if (!audio_data) {
      throw createError.validation('Audio data is required');
    }

    // 目前返回模拟数据，实际实现需要集成STT服务
    res.json(ErrorFormatter.formatSuccessResponse({
      text: 'Speech-to-text service is not implemented yet',
      confidence: 0,
      language,
      message: 'STT service placeholder'
    }));
  })
);

// ==================== 系统信息相关 ====================

/**
 * 获取AI服务统计信息
 */
aiRouterNew.get('/stats',
  longCacheMiddleware(60), // 缓存1分钟
  asyncHandler(async (req, res) => {
    const stats = aiServiceManager.getStatistics();
    const validation = aiConfigManager.validateConfiguration();

    res.json(ErrorFormatter.formatSuccessResponse({
      ...stats,
      configuration: validation,
      timestamp: new Date().toISOString()
    }));
  })
);

/**
 * 健康检查
 */
aiRouterNew.get('/health',
  asyncHandler(async (req, res) => {
    const configuredProviders = aiConfigManager.getConfiguredProviders();
    const currentProvider = aiConfigManager.getCurrentProvider();
    const validation = aiConfigManager.validateConfiguration();

    const health = {
      status: validation.valid ? 'healthy' : 'unhealthy',
      configured_providers: configuredProviders.length,
      current_provider: currentProvider,
      issues: validation.errors
    };

    res.json(ErrorFormatter.formatSuccessResponse(health));
  })
);

// ==================== 开发和调试相关 ====================

/**
 * 获取提供商详细信息（开发模式）
 */
if (process.env.NODE_ENV === 'development') {
  aiRouterNew.get('/debug/providers',
    asyncHandler(async (req, res) => {
      const config = aiConfigManager.getSafeConfig();
      const stats = aiServiceManager.getStatistics();

      res.json(ErrorFormatter.formatSuccessResponse({
        configuration: config,
        statistics: stats,
        supported_providers: Object.keys(config.providers)
      }));
    })
  );

  /**
   * 重新初始化AI服务（开发模式）
   */
  aiRouterNew.post('/debug/reinitialize',
    asyncHandler(async (req, res) => {
      aiServiceManager.updateConfiguration(aiConfigManager.getConfig());

      res.json(ErrorFormatter.formatSuccessResponse({
        message: 'AI services reinitialized',
        timestamp: new Date().toISOString()
      }));
    })
  );
}