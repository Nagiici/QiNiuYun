/**
 * 统一错误处理工具
 * 提供标准化的错误类型和处理机制
 */

export enum ErrorCode {
  // 通用错误
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // 数据库错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // 文件错误
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',

  // AI服务错误
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_RATE_LIMIT_EXCEEDED = 'AI_RATE_LIMIT_EXCEEDED',
  AI_INVALID_RESPONSE = 'AI_INVALID_RESPONSE',

  // 角色相关错误
  CHARACTER_NOT_FOUND = 'CHARACTER_NOT_FOUND',
  CHARACTER_CREATION_FAILED = 'CHARACTER_CREATION_FAILED',
  CHARACTER_UPDATE_FAILED = 'CHARACTER_UPDATE_FAILED',

  // 聊天相关错误
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED',
}

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // 保持错误堆栈
    Error.captureStackTrace(this, AppError);

    // 设置错误名称
    this.name = this.constructor.name;
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, true, details);
  }
}

/**
 * 数据库错误类
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      ErrorCode.DATABASE_ERROR,
      message,
      500,
      true,
      originalError ? { originalError: originalError.message } : undefined
    );
  }
}

/**
 * AI服务错误类
 */
export class AIServiceError extends AppError {
  constructor(message: string, provider?: string, originalError?: Error) {
    super(
      ErrorCode.AI_SERVICE_ERROR,
      message,
      503,
      true,
      {
        provider,
        originalError: originalError?.message
      }
    );
  }
}

/**
 * 资源未找到错误类
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with ID ${identifier} not found`
      : `${resource} not found`;

    super(ErrorCode.NOT_FOUND, message, 404, true, { resource, identifier });
  }
}

/**
 * 错误响应格式化工具
 */
export class ErrorFormatter {
  /**
   * 格式化错误响应
   */
  static formatErrorResponse(error: AppError | Error): {
    success: false;
    error: {
      code: string;
      message: string;
      details?: any;
      timestamp: string;
    };
  } {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString()
        }
      };
    }

    // 处理普通错误
    return {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 格式化成功响应
   */
  static formatSuccessResponse<T>(data: T, message?: string): {
    success: true;
    data: T;
    message?: string;
    timestamp: string;
  } {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 错误映射工具
 * 将常见的第三方错误映射为应用错误
 */
export class ErrorMapper {
  /**
   * 映射数据库错误
   */
  static mapDatabaseError(error: any): AppError {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return new AppError(
        ErrorCode.DUPLICATE_ENTRY,
        'Resource already exists',
        409,
        true,
        { constraint: error.message }
      );
    }

    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return new AppError(
        ErrorCode.INVALID_REQUEST,
        'Invalid reference to related resource',
        400,
        true,
        { constraint: error.message }
      );
    }

    return new DatabaseError('Database operation failed', error);
  }

  /**
   * 映射AI服务错误
   */
  static mapAIServiceError(error: any, provider: string): AppError {
    if (error.response?.status === 429) {
      return new AppError(
        ErrorCode.AI_RATE_LIMIT_EXCEEDED,
        `Rate limit exceeded for ${provider}`,
        429,
        true,
        { provider, retryAfter: error.response.headers['retry-after'] }
      );
    }

    if (error.response?.status === 401) {
      return new AppError(
        ErrorCode.UNAUTHORIZED,
        `Invalid API key for ${provider}`,
        401,
        true,
        { provider }
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new AppError(
        ErrorCode.AI_SERVICE_UNAVAILABLE,
        `${provider} service is unavailable`,
        503,
        true,
        { provider, code: error.code }
      );
    }

    return new AIServiceError(`AI service error: ${error.message}`, provider, error);
  }

  /**
   * 映射文件上传错误
   */
  static mapFileUploadError(error: any): AppError {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new AppError(
        ErrorCode.FILE_TOO_LARGE,
        'File size exceeds the allowed limit',
        413,
        true,
        { maxSize: error.limit }
      );
    }

    if (error.code === 'INVALID_FILE_TYPE') {
      return new AppError(
        ErrorCode.INVALID_FILE_TYPE,
        'Invalid file type',
        400,
        true,
        { allowedTypes: error.allowedTypes }
      );
    }

    return new AppError(
      ErrorCode.FILE_UPLOAD_ERROR,
      'File upload failed',
      500,
      true,
      { originalError: error.message }
    );
  }
}

/**
 * 错误日志工具
 */
export class ErrorLogger {
  /**
   * 记录错误日志
   */
  static logError(error: Error, context?: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    };

    if (error instanceof AppError) {
      logData.error = {
        ...logData.error,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      } as any;
    }

    // 在生产环境中，这里应该使用专业的日志库
    console.error('Application Error:', JSON.stringify(logData, null, 2));
  }

  /**
   * 记录警告日志
   */
  static logWarning(message: string, context?: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      message,
      context
    };

    console.warn('Application Warning:', JSON.stringify(logData, null, 2));
  }
}

/**
 * 错误处理装饰器
 */
export function handleErrors(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      ErrorLogger.logError(error as Error, {
        method: propertyKey,
        args: args.map(arg => typeof arg === 'object' ? '[object]' : arg)
      });
      throw error;
    }
  };

  return descriptor;
}

/**
 * 创建常见错误的快捷方法
 */
export const createError = {
  notFound: (resource: string, identifier?: string | number) =>
    new NotFoundError(resource, identifier),

  validation: (message: string, details?: any) =>
    new ValidationError(message, details),

  database: (message: string, originalError?: Error) =>
    new DatabaseError(message, originalError),

  aiService: (message: string, provider?: string, originalError?: Error) =>
    new AIServiceError(message, provider, originalError),

  unauthorized: (message: string = 'Unauthorized') =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message: string = 'Forbidden') =>
    new AppError(ErrorCode.FORBIDDEN, message, 403),

  tooManyRequests: (message: string = 'Too many requests') =>
    new AppError(ErrorCode.TOO_MANY_REQUESTS, message, 429),

  internal: (message: string = 'Internal server error') =>
    new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500)
};