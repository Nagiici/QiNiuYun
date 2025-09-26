import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

// 创建不同TTL的缓存实例
const shortCache = new NodeCache({ stdTTL: 300 }); // 5分钟
const mediumCache = new NodeCache({ stdTTL: 1800 }); // 30分钟
const longCache = new NodeCache({ stdTTL: 3600 }); // 1小时

// 生成缓存键
const generateCacheKey = (req: Request): string => {
  const { method, originalUrl, body } = req;
  const bodyStr = method === 'POST' ? JSON.stringify(body) : '';
  return `${method}:${originalUrl}:${bodyStr}`;
};

// 短期缓存中间件（5分钟）- 适用于频繁变化的数据
export const shortCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const cacheKey = generateCacheKey(req);
  const cachedData = shortCache.get(cacheKey);

  if (cachedData) {
    console.log('Cache hit (short):', cacheKey);
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedData);
  }

  res.setHeader('X-Cache', 'MISS');

  // 重写res.json来缓存响应
  const originalJson = res.json;
  res.json = function(body: any) {
    if (res.statusCode === 200) {
      shortCache.set(cacheKey, body);
      console.log('Cached (short):', cacheKey);
    }
    return originalJson.call(this, body);
  };

  next();
};

// 中期缓存中间件（30分钟）- 适用于角色配置等
export const mediumCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const cacheKey = generateCacheKey(req);
  const cachedData = mediumCache.get(cacheKey);

  if (cachedData) {
    console.log('Cache hit (medium):', cacheKey);
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedData);
  }

  res.setHeader('X-Cache', 'MISS');

  const originalJson = res.json;
  res.json = function(body: any) {
    if (res.statusCode === 200) {
      mediumCache.set(cacheKey, body);
      console.log('Cached (medium):', cacheKey);
    }
    return originalJson.call(this, body);
  };

  next();
};

// 长期缓存中间件（1小时）- 适用于系统配置等
export const longCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const cacheKey = generateCacheKey(req);
  const cachedData = longCache.get(cacheKey);

  if (cachedData) {
    console.log('Cache hit (long):', cacheKey);
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedData);
  }

  res.setHeader('X-Cache', 'MISS');

  const originalJson = res.json;
  res.json = function(body: any) {
    if (res.statusCode === 200) {
      longCache.set(cacheKey, body);
      console.log('Cached (long):', cacheKey);
    }
    return originalJson.call(this, body);
  };

  next();
};

// 缓存管理函数
export class CacheManager {
  // 清除特定前缀的缓存
  static clearByPrefix(prefix: string) {
    const caches = [shortCache, mediumCache, longCache];

    caches.forEach(cache => {
      const keys = cache.keys();
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          cache.del(key);
        }
      });
    });

    console.log('Cleared cache with prefix:', prefix);
  }

  // 清除所有缓存
  static clearAll() {
    shortCache.flushAll();
    mediumCache.flushAll();
    longCache.flushAll();
    console.log('All caches cleared');
  }

  // 获取缓存统计信息
  static getStats() {
    return {
      short: shortCache.getStats(),
      medium: mediumCache.getStats(),
      long: longCache.getStats()
    };
  }

  // 清除角色相关缓存
  static clearCharacterCache(characterId?: number) {
    if (characterId) {
      this.clearByPrefix(`GET:/api/characters/${characterId}`);
    }
    this.clearByPrefix('GET:/api/characters');
  }

  // 清除AI配置缓存
  static clearAIConfigCache() {
    this.clearByPrefix('GET:/api/ai/config');
  }
}