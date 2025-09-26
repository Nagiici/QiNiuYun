import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorFormatter, ErrorLogger, ErrorMapper } from '../utils/errors';

/**
 * 全局错误处理中间件
 */
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 记录错误日志
  ErrorLogger.logError(error, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined
  });

  let appError: AppError;

  // 如果已经是 AppError，直接使用
  if (error instanceof AppError) {
    appError = error;
  } else {
    // 尝试映射常见错误类型
    appError = mapCommonErrors(error);
  }

  // 格式化错误响应
  const errorResponse = ErrorFormatter.formatErrorResponse(appError);

  // 设置响应状态码和内容
  res.status(appError.statusCode).json(errorResponse);
};

/**
 * 异步错误处理包装器
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 错误处理中间件
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    'NOT_FOUND' as any,
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

/**
 * 映射常见错误类型
 */
function mapCommonErrors(error: any): AppError {
  // Joi 验证错误
  if (error.isJoi) {
    return new AppError(
      'VALIDATION_ERROR' as any,
      error.details[0].message,
      400,
      true,
      { validationErrors: error.details }
    );
  }

  // Multer 文件上传错误
  if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_UNEXPECTED_FILE') {
    return ErrorMapper.mapFileUploadError(error);
  }

  // SQLite 数据库错误
  if (error.code?.startsWith('SQLITE_')) {
    return ErrorMapper.mapDatabaseError(error);
  }

  // Axios 网络错误
  if (error.isAxiosError) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new AppError(
        'AI_SERVICE_UNAVAILABLE' as any,
        'External service unavailable',
        503,
        true,
        { service: error.config?.baseURL }
      );
    }

    if (error.response) {
      return new AppError(
        'AI_SERVICE_ERROR' as any,
        `External service error: ${error.response.status}`,
        error.response.status >= 500 ? 503 : 400,
        true,
        {
          status: error.response.status,
          statusText: error.response.statusText
        }
      );
    }
  }

  // 语法错误（通常是编程错误）
  if (error instanceof SyntaxError) {
    return new AppError(
      'INVALID_REQUEST' as any,
      'Invalid JSON syntax',
      400,
      true
    );
  }

  // 默认内部服务器错误
  return new AppError(
    'INTERNAL_SERVER_ERROR' as any,
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
    500,
    false // 非预期错误，可能是编程错误
  );
}

/**
 * 错误恢复中间件
 * 尝试从某些错误中恢复
 */
export const errorRecoveryHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 如果是数据库连接错误，可以尝试重连
  if (error.message.includes('database connection')) {
    ErrorLogger.logWarning('Database connection error detected, attempting recovery');
    // 这里可以添加数据库重连逻辑
  }

  // 如果是AI服务错误，可以尝试降级处理
  if (error.message.includes('AI service')) {
    ErrorLogger.logWarning('AI service error detected, using fallback response');
    // 可以返回降级响应而不是错误
    if (req.path.includes('/ai/chat')) {
      return res.json({
        success: true,
        data: {
          response: '抱歉，AI服务暂时不可用，请稍后再试。',
          fallback: true
        }
      });
    }
  }

  // 无法恢复，传递给下一个错误处理器
  next(error);
};

/**
 * 请求超时中间件
 */
export const timeoutHandler = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        const error = new AppError(
          'INTERNAL_SERVER_ERROR' as any,
          'Request timeout',
          408
        );
        next(error);
      }
    }, timeout);

    // 清理定时器
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

/**
 * 请求日志中间件
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // 记录请求开始
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Started`);

  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // 红色/绿色
    const resetColor = '\x1b[0m';

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ` +
      `${statusColor}${res.statusCode}${resetColor} - ${duration}ms`
    );

    // 记录慢请求警告
    if (duration > 5000) {
      ErrorLogger.logWarning('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration,
        ip: req.ip
      });
    }
  });

  next();
};

/**
 * 健康检查错误处理
 */
export const healthCheckErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.path === '/api/health') {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next(error);
};