import rateLimit from 'express-rate-limit';

// 通用限流器
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  max: 100, // 每个IP每15分钟最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: '15分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI聊天限流器（更严格）
export const aiChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟窗口
  max: 20, // 每个IP每分钟最多20个AI请求
  message: {
    error: 'AI聊天请求过于频繁，请稍后再试',
    retryAfter: '1分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 文件上传限流器
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时窗口
  max: 10, // 每个IP每小时最多10个上传请求
  message: {
    error: '文件上传过于频繁，请稍后再试',
    retryAfter: '1小时'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 创建角色限流器
export const createCharacterLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10分钟窗口
  max: 5, // 每个IP每10分钟最多创建5个角色
  message: {
    error: '创建角色过于频繁，请稍后再试',
    retryAfter: '10分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 配置更新限流器
export const configLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟窗口
  max: 10, // 每个IP每5分钟最多10个配置更新请求
  message: {
    error: '配置更新过于频繁，请稍后再试',
    retryAfter: '5分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
});