/**
 * API接口类型定义
 * 统一定义所有API相关的TypeScript类型
 */

// ==================== 基础类型 ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
  message?: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// ==================== 角色相关类型 ====================

export interface CharacterPersonalityData {
  energy: number;
  friendliness: number;
  humor: number;
  professionalism: number;
  creativity: number;
  empathy: number;
}

export interface CharacterExample {
  input: string;
  output: string;
}

export interface Character {
  id?: number;
  name: string;
  description: string;
  avatar?: string;
  story_world?: string;
  character_background?: string;
  has_mission?: boolean;
  current_mission?: string;
  current_mood?: 'happy' | 'sad' | 'excited' | 'calm' | 'angry' | 'surprised' | 'confused' | 'thinking';
  time_setting?: 'morning' | 'afternoon' | 'evening' | 'night';
  use_real_time?: boolean;
  personality_preset?: 'friendly' | 'professional' | 'energetic' | 'mysterious' | 'humorous';
  personality_data?: CharacterPersonalityData;
  examples?: CharacterExample[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateCharacterRequest {
  name: string;
  description: string;
  story_world?: string;
  character_background?: string;
  has_mission?: boolean;
  current_mission?: string;
  current_mood?: Character['current_mood'];
  time_setting?: Character['time_setting'];
  use_real_time?: boolean;
  personality_preset?: Character['personality_preset'];
  personality_data?: CharacterPersonalityData;
  examples?: CharacterExample[];
}

export interface UpdateCharacterRequest extends Partial<CreateCharacterRequest> {
  avatar?: string;
}

export interface CharacterResponse extends ApiResponse<Character> {}
export interface CharactersResponse extends ApiResponse<Character[]> {}

// ==================== 聊天相关类型 ====================

export interface Message {
  id?: number;
  session_id: string;
  sender: 'user' | 'ai';
  message_type: 'text' | 'voice';
  content: string;
  voice_url?: string;
  emotion?: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  character_id: number;
  character_name: string;
  character_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionRequest {
  character_id: number;
  character_name: string;
}

export interface SendMessageRequest {
  character_id?: number;
  session_id?: string;
  message: string;
  message_type?: 'text' | 'voice';
  voice_data?: string;
  character_data?: Character;
}

export interface ChatSessionResponse extends ApiResponse<ChatSession> {}
export interface ChatSessionsResponse extends ApiResponse<ChatSession[]> {}
export interface MessagesResponse extends ApiResponse<Message[]> {}
export interface MessageResponse extends ApiResponse<Message> {}

// ==================== AI服务相关类型 ====================

export type AIProvider = 'groq' | 'openai' | 'cohere' | 'anthropic' | 'ollama';

export interface AIProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  [key: string]: any;
}

export interface AIConfiguration {
  currentProvider: AIProvider;
  providers: Record<AIProvider, AIProviderConfig>;
}

export interface AIProviderStatus {
  configured: boolean;
  model: string;
  available?: boolean;
  lastCheck?: string;
}

export interface AIConfigResponse extends ApiResponse<{
  currentProvider: AIProvider;
  providers: Record<AIProvider, AIProviderStatus>;
}> {}

export interface TestConnectionRequest {
  provider: AIProvider;
  config: AIProviderConfig;
}

export interface TestConnectionResponse extends ApiResponse<{
  success: boolean;
  latency: number;
  model: string;
}> {}

export interface EmotionAnalysisRequest {
  message: string;
}

export interface EmotionAnalysisResponse extends ApiResponse<{
  emotion: string;
  confidence: number;
  emotions: Record<string, number>;
}> {}

// ==================== 语音相关类型 ====================

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSResponse extends ApiResponse<{
  audio_url: string;
  audio_data?: string;
  duration?: number;
}> {}

export interface STTRequest {
  audio_data: string;
  language?: string;
  format?: 'wav' | 'mp3' | 'ogg';
}

export interface STTResponse extends ApiResponse<{
  text: string;
  confidence: number;
  language?: string;
}> {}

export interface SpeechProviderConfig {
  apiKey: string;
  voiceId?: string;
  model?: string;
}

export interface SpeechConfiguration {
  tts: {
    currentProvider: 'elevenlabs' | 'openai' | 'azure';
    providers: Record<string, SpeechProviderConfig>;
  };
  stt: {
    currentProvider: 'openai' | 'azure' | 'google';
    providers: Record<string, SpeechProviderConfig>;
  };
}

// ==================== 文件上传相关类型 ====================

export interface FileUploadResponse extends ApiResponse<{
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}> {}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

// ==================== 系统相关类型 ====================

export interface HealthCheckResponse extends ApiResponse<{
  status: 'healthy' | 'unhealthy';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connected: boolean;
    responseTime?: number;
  };
  services: {
    ai: boolean;
    tts: boolean;
    stt: boolean;
  };
}> {}

export interface SystemStats {
  characters: {
    total: number;
    recent: number;
  };
  sessions: {
    total: number;
    active: number;
    recent: number;
  };
  messages: {
    total: number;
    today: number;
    thisWeek: number;
  };
}

export interface SystemStatsResponse extends ApiResponse<SystemStats> {}

// ==================== 错误类型 ====================

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

// ==================== 中间件类型 ====================

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

export interface CacheOptions {
  ttl?: number;
  key?: string;
  tags?: string[];
}

export interface ValidationSchema {
  body?: any;
  params?: any;
  query?: any;
}

// ==================== WebSocket相关类型 ====================

export interface WebSocketMessage {
  type: 'chat_message' | 'voice_message' | 'typing' | 'status';
  data: any;
  session_id?: string;
  character_id?: number;
  timestamp: string;
}

export interface WebSocketResponse {
  type: string;
  data?: any;
  error?: string;
  timestamp: string;
}

// ==================== 导出所有类型 ====================

export * from './character';
export * from './chat';
export * from './ai';
export * from './system';