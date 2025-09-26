/**
 * 聊天相关类型定义
 */

export type MessageSender = 'user' | 'ai';
export type MessageType = 'text' | 'voice' | 'image' | 'system';

export interface Message {
  id?: number;
  session_id: string;
  sender: MessageSender;
  message_type: MessageType;
  content: string;
  voice_url?: string;
  image_url?: string;
  emotion?: string;
  metadata?: MessageMetadata;
  timestamp: string;
}

export interface MessageMetadata {
  // AI生成相关
  model?: string;
  provider?: string;
  tokens_used?: number;
  response_time?: number;

  // 情感分析
  emotion_confidence?: number;
  detected_emotions?: Record<string, number>;

  // 语音相关
  voice_duration?: number;
  voice_quality?: number;

  // 图片相关
  image_size?: number;
  image_dimensions?: { width: number; height: number };

  // 用户行为
  user_rating?: number;
  is_favorite?: boolean;

  // 系统信息
  processing_time?: number;
  cache_hit?: boolean;
}

export interface ChatSession {
  id: string;
  character_id: number;
  character_name: string;
  character_avatar?: string;
  title?: string;                // 会话标题
  last_message?: string;
  last_message_time?: string;
  message_count: number;
  total_tokens?: number;         // 总token使用量
  session_status: SessionStatus;
  session_metadata?: SessionMetadata;
  created_at: string;
  updated_at: string;
}

export type SessionStatus =
  | 'active'      // 活跃中
  | 'paused'      // 暂停
  | 'archived'    // 已归档
  | 'deleted';    // 已删除

export interface SessionMetadata {
  // 性能指标
  total_response_time?: number;
  average_response_time?: number;

  // 用户行为
  user_satisfaction?: number;
  session_rating?: number;

  // 内容统计
  topics_discussed?: string[];
  dominant_emotion?: string;

  // 技术信息
  client_info?: {
    user_agent?: string;
    platform?: string;
    screen_resolution?: string;
  };

  // 会话特性
  is_long_conversation?: boolean;
  has_voice_messages?: boolean;
  has_image_messages?: boolean;
}

export interface CreateSessionRequest {
  character_id: number;
  character_name: string;
  title?: string;
  initial_context?: string;
}

export interface UpdateSessionRequest {
  title?: string;
  session_status?: SessionStatus;
  metadata?: Partial<SessionMetadata>;
}

export interface SendMessageRequest {
  character_id?: number;
  session_id?: string;
  message: string;
  message_type?: MessageType;
  voice_data?: string;
  image_data?: string;
  character_data?: any; // 临时角色数据（用于测试）
  context?: MessageContext;
}

export interface MessageContext {
  // 情境信息
  current_emotion?: string;
  environment?: string;
  time_of_day?: string;

  // 用户状态
  user_mood?: string;
  user_preferences?: Record<string, any>;

  // 对话上下文
  conversation_topic?: string;
  previous_context?: string;

  // 特殊指令
  response_style?: 'brief' | 'detailed' | 'creative' | 'formal';
  language?: string;
}

export interface ChatResponse {
  message: Message;
  session?: ChatSession;
  character_state?: CharacterState;
  suggestions?: string[];
  metadata?: {
    processing_time: number;
    model_used: string;
    tokens_used: number;
    cached: boolean;
  };
}

export interface CharacterState {
  current_mood: string;
  energy_level: number;
  relationship_level: number;
  memory_context: string[];
}

// 会话分析结果
export interface SessionAnalytics {
  session_id: string;
  duration_minutes: number;
  message_count: number;
  user_engagement_score: number;
  character_performance_score: number;
  dominant_topics: string[];
  emotion_distribution: Record<string, number>;
  highlights: SessionHighlight[];
  recommendations: string[];
}

export interface SessionHighlight {
  message_id: number;
  type: 'funny' | 'emotional' | 'insightful' | 'memorable';
  content: string;
  score: number;
}

// 批量操作
export interface BulkSessionOperation {
  session_ids: string[];
  operation: 'archive' | 'delete' | 'export' | 'analyze';
  options?: Record<string, any>;
}

export interface SessionExportOptions {
  format: 'json' | 'txt' | 'pdf' | 'html';
  include_metadata: boolean;
  include_images: boolean;
  include_voice: boolean;
  anonymize: boolean;
}

// 搜索和过滤
export interface SessionSearchParams {
  query?: string;
  character_id?: number;
  date_from?: string;
  date_to?: string;
  min_messages?: number;
  max_messages?: number;
  status?: SessionStatus[];
  has_voice?: boolean;
  has_images?: boolean;
  min_rating?: number;
}

export interface MessageSearchParams {
  query?: string;
  session_id?: string;
  sender?: MessageSender;
  message_type?: MessageType;
  emotion?: string;
  date_from?: string;
  date_to?: string;
}

// 实时通信
export interface TypingIndicator {
  session_id: string;
  character_id: number;
  is_typing: boolean;
  estimated_response_time?: number;
}

export interface VoiceMessage {
  session_id: string;
  audio_data: string;
  format: 'wav' | 'mp3' | 'ogg';
  duration: number;
  language?: string;
}

export interface ImageMessage {
  session_id: string;
  image_data: string;
  format: 'jpg' | 'png' | 'gif' | 'webp';
  caption?: string;
  metadata?: {
    size: number;
    dimensions: { width: number; height: number };
  };
}