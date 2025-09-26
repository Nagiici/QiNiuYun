import express from 'express';
import fs from 'fs';
import path from 'path';

export const systemRouter = express.Router();

// 清除服务器缓存
systemRouter.post('/clear-cache', async (req, res) => {
  try {
    const cacheInfo = {
      tempFiles: 0,
      logFiles: 0,
      cacheSize: 0
    };

    // 清除临时文件缓存
    const tempDir = path.join(process.cwd(), 'temp');
    if (fs.existsSync(tempDir)) {
      const tempFiles = fs.readdirSync(tempDir);
      for (const file of tempFiles) {
        const filePath = path.join(tempDir, file);
        try {
          const stats = fs.statSync(filePath);
          cacheInfo.cacheSize += stats.size;
          fs.unlinkSync(filePath);
          cacheInfo.tempFiles++;
        } catch (error) {
          console.warn(`Failed to delete temp file ${file}:`, error);
        }
      }
    }

    // 清除日志文件（保留最近3天的）
    const logsDir = path.join(process.cwd(), 'logs');
    if (fs.existsSync(logsDir)) {
      const logFiles = fs.readdirSync(logsDir);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      for (const file of logFiles) {
        const filePath = path.join(logsDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.mtime < threeDaysAgo) {
            cacheInfo.cacheSize += stats.size;
            fs.unlinkSync(filePath);
            cacheInfo.logFiles++;
          }
        } catch (error) {
          console.warn(`Failed to delete log file ${file}:`, error);
        }
      }
    }

    // 清除Node.js应用缓存（重置require缓存）
    const moduleKeys = Object.keys(require.cache).filter(key =>
      key.includes('temp') || key.includes('cache')
    );
    moduleKeys.forEach(key => {
      delete require.cache[key];
    });

    // 如果使用了内存缓存，可以在这里清除
    if (global.gc) {
      global.gc();
    }

    console.log('Server cache cleared:', {
      tempFiles: cacheInfo.tempFiles,
      logFiles: cacheInfo.logFiles,
      totalSize: Math.round(cacheInfo.cacheSize / 1024) + ' KB'
    });

    res.json({
      success: true,
      message: 'Server cache cleared successfully',
      cleared: {
        tempFiles: cacheInfo.tempFiles,
        logFiles: cacheInfo.logFiles,
        totalSize: cacheInfo.cacheSize
      }
    });

  } catch (error) {
    console.error('Failed to clear server cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear server cache',
      message: error.message
    });
  }
});

// 获取缓存状态信息
systemRouter.get('/cache-info', async (req, res) => {
  try {
    const cacheInfo = {
      tempFiles: 0,
      logFiles: 0,
      totalSize: 0,
      memoryUsage: process.memoryUsage()
    };

    // 检查临时文件
    const tempDir = path.join(process.cwd(), 'temp');
    if (fs.existsSync(tempDir)) {
      const tempFiles = fs.readdirSync(tempDir);
      cacheInfo.tempFiles = tempFiles.length;
      tempFiles.forEach(file => {
        const filePath = path.join(tempDir, file);
        try {
          const stats = fs.statSync(filePath);
          cacheInfo.totalSize += stats.size;
        } catch (error) {
          // 忽略已删除的文件
        }
      });
    }

    // 检查日志文件
    const logsDir = path.join(process.cwd(), 'logs');
    if (fs.existsSync(logsDir)) {
      const logFiles = fs.readdirSync(logsDir);
      cacheInfo.logFiles = logFiles.length;
      logFiles.forEach(file => {
        const filePath = path.join(logsDir, file);
        try {
          const stats = fs.statSync(filePath);
          cacheInfo.totalSize += stats.size;
        } catch (error) {
          // 忽略已删除的文件
        }
      });
    }

    res.json({
      success: true,
      cacheInfo: {
        ...cacheInfo,
        totalSizeKB: Math.round(cacheInfo.totalSize / 1024),
        memoryUsageMB: {
          rss: Math.round(cacheInfo.memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(cacheInfo.memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(cacheInfo.memoryUsage.heapUsed / 1024 / 1024),
          external: Math.round(cacheInfo.memoryUsage.external / 1024 / 1024)
        }
      }
    });

  } catch (error) {
    console.error('Failed to get cache info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache info',
      message: error.message
    });
  }
});

// 系统健康检查
systemRouter.get('/health', (req, res) => {
  const healthInfo = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.version,
    platform: process.platform
  };

  res.json(healthInfo);
});