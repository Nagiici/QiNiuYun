/**
 * TypeScript类型定义统一导出
 * 提供项目中所有类型的中央化管理
 */

// 导出所有API相关类型
export * from './api';

// 导出角色相关类型
export * from './character';

// 导出聊天相关类型
export * from './chat';

// 导出AI服务相关类型
export * from './ai';

// 导出系统相关类型
export * from './system';

// ==================== 通用工具类型 ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

// ==================== 数据库相关通用类型 ====================

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  deleted_at?: string;
}

export interface AuditableEntity extends BaseEntity {
  created_by?: string;
  updated_by?: string;
  version: number;
}

export interface TimestampedEntity {
  created_at: string;
  updated_at: string;
}

// ==================== HTTP相关类型 ====================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type HttpStatus =
  | 200 | 201 | 202 | 204  // Success
  | 400 | 401 | 403 | 404 | 409 | 422 | 429  // Client Error
  | 500 | 501 | 502 | 503 | 504; // Server Error

export interface HttpHeaders {
  'Content-Type'?: string;
  'Authorization'?: string;
  'Accept'?: string;
  'User-Agent'?: string;
  'X-Request-ID'?: string;
  'X-API-Key'?: string;
  [key: string]: string | undefined;
}

// ==================== 验证相关类型 ====================

export interface ValidationError {
  field: string;
  value: any;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ==================== 配置相关类型 ====================

export interface Environment {
  NODE_ENV: 'development' | 'test' | 'staging' | 'production';
  PORT: number;
  DATABASE_URL: string;
  SECRET_KEY: string;
  AI_PROVIDERS: Record<string, string>;
  [key: string]: string | number | boolean;
}

// ==================== 分页相关类型 ====================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== 搜索相关类型 ====================

export interface SearchQuery {
  q?: string;
  filters?: Record<string, any>;
  sort?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  facets?: string[];
  highlight?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
  suggestions?: string[];
  took: number;
}

// ==================== 缓存相关类型 ====================

export interface CacheKey {
  namespace: string;
  key: string;
  version?: string;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
  serialize?: boolean;
}

export interface CacheEntry<T> {
  value: T;
  expires_at?: number;
  created_at: number;
  hits: number;
  tags: string[];
}

// ==================== 队列和任务相关类型 ====================

export interface Task<T = any> {
  id: string;
  type: string;
  payload: T;
  priority: number;
  attempts: number;
  max_attempts: number;
  created_at: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  error?: string;
}

export interface TaskResult<T = any> {
  success: boolean;
  result?: T;
  error?: string;
  duration: number;
}

export interface Queue {
  name: string;
  size: number;
  processing: number;
  completed: number;
  failed: number;
  delayed: number;
}

// ==================== 事件相关类型 ====================

export interface Event<T = any> {
  id: string;
  type: string;
  source: string;
  data: T;
  timestamp: string;
  version: string;
  correlation_id?: string;
}

export interface EventHandler<T = any> {
  event_type: string;
  handler: (event: Event<T>) => Promise<void>;
  options?: {
    retry?: boolean;
    max_retries?: number;
    delay?: number;
  };
}

// ==================== 监控和指标相关类型 ====================

export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export interface Counter extends Metric {
  type: 'counter';
}

export interface Gauge extends Metric {
  type: 'gauge';
}

export interface Histogram extends Metric {
  type: 'histogram';
  buckets: Record<string, number>;
}

export interface Timer {
  name: string;
  start_time: number;
  end_time?: number;
  duration?: number;
  tags?: Record<string, string>;
}

// ==================== 实用工具类型 ====================

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type NonEmptyArray<T> = [T, ...T[]];

export type StringKeys<T> = Extract<keyof T, string>;

export type Constructor<T = {}> = new (...args: any[]) => T;