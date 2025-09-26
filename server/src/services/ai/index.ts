/**
 * AI服务统一导出
 */

// 配置管理
export { AIConfigManager } from './config';

// 服务管理
export { AIServiceManager } from './manager';
export { CharacterService } from './character';
export { EmotionService } from './emotion';

// 提供商
export * from './providers';

// 创建单例实例，方便直接使用
export const aiServiceManager = AIServiceManager.getInstance();
export const aiConfigManager = AIConfigManager.getInstance();
export const characterService = new CharacterService();
export const emotionService = new EmotionService();