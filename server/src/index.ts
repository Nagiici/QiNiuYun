import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import multer from 'multer';

import { initDatabase } from './database';
import { charactersRouter } from './routes/characters';
import { chatsRouter } from './routes/chats';
import { aiRouter } from './routes/ai';
import { systemRouter } from './routes/system';
import { generalLimiter, uploadLimiter } from './middleware/rateLimiter';
import {
  globalErrorHandler,
  notFoundHandler,
  requestLogger,
  timeoutHandler,
  errorRecoveryHandler
} from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// 创建HTTP服务器
const server = createServer(app);

// 初始化WebSocket服务器
const wss = new WebSocketServer({ server });

// 中间件 - 安全的CORS配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com'] // 生产环境只允许特定域名
    : ['http://localhost:3000', 'http://localhost:5173'], // 开发环境允许本地域名
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24小时预检缓存
};

app.use(cors(corsOptions));

// 应用请求日志
app.use(requestLogger);

// 应用超时处理
app.use(timeoutHandler(30000));

// 应用全局限流
app.use(generalLimiter);

// 确保UTF-8字符编码处理
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (reduced from 10MB)
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // 严格的MIME类型验证
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    // 严格的文件扩展名验证
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      // 额外安全检查：文件名长度限制
      if (file.originalname.length > 100) {
        cb(new Error('文件名过长'));
        return;
      }

      // 防止路径遍历攻击
      if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
        cb(new Error('文件名包含非法字符'));
        return;
      }

      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)'));
    }
  }
});

app.use('/api/upload', uploadLimiter, upload.single('avatar'));

// API路由
app.use('/api/characters', charactersRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/system', systemRouter);

// WebSocket连接处理
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);

      // 处理不同类型的消息
      switch (data.type) {
        case 'chat_message':
          // 处理聊天消息，调用AI生成回复
          break;
        case 'voice_message':
          // 处理语音消息
          break;
        default:
          ws.send(JSON.stringify({ error: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Character Roleplay API is running' });
});

// 404处理 - 必须在所有路由之后
app.use(notFoundHandler);

// 错误恢复处理
app.use(errorRecoveryHandler);

// 全局错误处理 - 必须在最后
app.use(globalErrorHandler);

// 启动服务器
async function startServer() {
  try {
    await initDatabase();

    server.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📡 WebSocket server running on ws://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();