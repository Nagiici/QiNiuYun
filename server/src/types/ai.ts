/**
 * AI服务相关类型定义
 */

export type AIProvider = 'groq' | 'openai' | 'cohere' | 'anthropic' | 'ollama';

export interface AIProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
  retries?: number;
  [key: string]: any;
}

export interface AIConfiguration {
  currentProvider: AIProvider;
  providers: Record<AIProvider, AIProviderConfig>;
  fallbackProviders?: AIProvider[];
  globalSettings: {
    maxContextLength: number;
    defaultTemperature: number;
    enableFallback: boolean;
    enableCaching: boolean;
    enableRateLimiting: boolean;
  };
}

export interface AIProviderStatus {
  configured: boolean;
  model: string;
  available?: boolean;
  lastCheck?: string;
  responseTime?: number;
  errorRate?: number;
  quotaRemaining?: number;
  quotaResetTime?: string;
}

export interface AIProviderCapabilities {
  supportedModels: string[];
  maxTokens: number;
  supportsStreaming: boolean;
  supportsFunctions: boolean;
  supportsImages: boolean;
  supportsVision: boolean;
  costPerToken: {
    input: number;
    output: number;
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  functions?: AIFunction[];
  functionCall?: 'auto' | 'none' | { name: string };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
}

export interface AIFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatChoice[];
  usage: TokenUsage;
  metadata?: {
    provider: AIProvider;
    responseTime: number;
    cached: boolean;
    retryCount: number;
  };
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter';
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

export interface StreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: StreamChoice[];
}

export interface StreamChoice {
  index: number;
  delta: {
    role?: string;
    content?: string;
    functionCall?: {
      name?: string;
      arguments?: string;
    };
  };
  finishReason?: string;
}

// 情感分析
export interface EmotionAnalysisRequest {
  text: string;
  language?: string;
  context?: string;
}

export interface EmotionAnalysisResponse {
  primary_emotion: string;
  confidence: number;
  emotions: Record<string, number>;
  sentiment: {
    polarity: number; // -1 (negative) to 1 (positive)
    subjectivity: number; // 0 (objective) to 1 (subjective)
  };
  metadata: {
    model_used: string;
    processing_time: number;
    language_detected?: string;
  };
}

// 文本生成任务
export interface TextGenerationTask {
  id: string;
  type: 'character_response' | 'story_generation' | 'dialogue_improvement' | 'emotion_analysis';
  input: any;
  output?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  metadata: {
    provider: AIProvider;
    model: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    priority: number;
  };
}

// AI性能监控
export interface AIPerformanceMetrics {
  provider: AIProvider;
  model: string;
  timeWindow: {
    start: string;
    end: string;
  };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    totalTokensUsed: number;
    totalCost: number;
    errorRate: number;
  };
  errors: Array<{
    type: string;
    count: number;
    lastOccurrence: string;
  }>;
}

// 智能路由
export interface AIRoutingStrategy {
  strategy: 'round_robin' | 'least_latency' | 'cost_optimal' | 'capability_based';
  providers: AIProvider[];
  weights?: Record<AIProvider, number>;
  fallbackChain?: AIProvider[];
  healthCheckInterval: number;
}

// 上下文管理
export interface ConversationContext {
  session_id: string;
  character_id: number;
  messages: ChatMessage[];
  metadata: {
    character_personality: any;
    user_preferences: any;
    conversation_history: any;
    current_mood: string;
    time_context: string;
    environment: string;
  };
  tokenCount: number;
  maxTokens: number;
}

export interface ContextCompressionResult {
  compressed_messages: ChatMessage[];
  compression_ratio: number;
  preserved_information: string[];
  lost_information: string[];
  token_savings: number;
}

// 模型微调
export interface FineTuningJob {
  id: string;
  provider: AIProvider;
  base_model: string;
  training_data_url: string;
  validation_data_url?: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  progress?: number;
  epochs?: number;
  learning_rate?: number;
  batch_size?: number;
  created_at: string;
  finished_at?: string;
  fine_tuned_model?: string;
  metrics?: {
    training_loss: number[];
    validation_loss?: number[];
    accuracy?: number;
  };
}

// 内容审核
export interface ContentModerationRequest {
  text: string;
  categories?: string[];
  severity_threshold?: number;
}

export interface ContentModerationResponse {
  flagged: boolean;
  categories: Array<{
    category: string;
    probability: number;
    flagged: boolean;
  }>;
  overall_score: number;
  recommendation: 'allow' | 'review' | 'block';
}

// AI助手功能
export interface AIAssistantCapabilities {
  can_generate_characters: boolean;
  can_analyze_conversations: boolean;
  can_suggest_responses: boolean;
  can_moderate_content: boolean;
  can_translate_languages: boolean;
  can_summarize_conversations: boolean;
  supported_languages: string[];
  max_context_length: number;
}

export interface ResponseSuggestion {
  text: string;
  confidence: number;
  emotion: string;
  appropriateness_score: number;
  creativity_score: number;
  relevance_score: number;
}

// 错误处理
export interface AIError {
  code: string;
  message: string;
  provider: AIProvider;
  model?: string;
  retryable: boolean;
  details?: {
    status_code?: number;
    quota_exceeded?: boolean;
    rate_limited?: boolean;
    model_unavailable?: boolean;
    invalid_request?: boolean;
  };
}