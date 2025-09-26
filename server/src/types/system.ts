/**
 * 系统相关类型定义
 */

// ==================== 健康检查相关 ====================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  error?: string;
  details?: Record<string, any>;
}

export interface SystemHealthReport {
  overall: HealthStatus;
  components: {
    database: ComponentHealth;
    ai_services: ComponentHealth[];
    cache: ComponentHealth;
    file_storage: ComponentHealth;
    websocket: ComponentHealth;
  };
  resources: {
    memory: ResourceUsage;
    cpu: ResourceUsage;
    disk: ResourceUsage;
    network: ResourceUsage;
  };
  dependencies: ComponentHealth[];
}

export interface ResourceUsage {
  used: number;
  total: number;
  percentage: number;
  threshold_warning: number;
  threshold_critical: number;
}

// ==================== 系统统计相关 ====================

export interface SystemStatistics {
  characters: CharacterStats;
  sessions: SessionStats;
  messages: MessageStats;
  users: UserStats;
  ai_usage: AIUsageStats;
  performance: PerformanceStats;
}

export interface CharacterStats {
  total: number;
  active_today: number;
  created_this_week: number;
  created_this_month: number;
  most_popular: Array<{
    id: number;
    name: string;
    usage_count: number;
  }>;
  by_personality: Record<string, number>;
}

export interface SessionStats {
  total: number;
  active: number;
  completed_today: number;
  completed_this_week: number;
  completed_this_month: number;
  average_duration: number;
  average_messages: number;
  by_status: Record<string, number>;
}

export interface MessageStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  by_type: Record<string, number>;
  by_sender: Record<string, number>;
  average_length: number;
  total_tokens: number;
}

export interface UserStats {
  total_unique: number;
  active_today: number;
  active_this_week: number;
  active_this_month: number;
  retention_rate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  engagement_metrics: {
    average_session_duration: number;
    messages_per_session: number;
    sessions_per_user: number;
  };
}

export interface AIUsageStats {
  total_requests: number;
  requests_today: number;
  by_provider: Record<string, {
    requests: number;
    tokens_used: number;
    cost: number;
    success_rate: number;
  }>;
  total_tokens_used: number;
  estimated_cost: number;
  response_times: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

export interface PerformanceStats {
  response_times: {
    api_average: number;
    ai_average: number;
    database_average: number;
  };
  error_rates: {
    api_errors: number;
    ai_errors: number;
    database_errors: number;
  };
  throughput: {
    requests_per_second: number;
    messages_per_minute: number;
  };
  resource_utilization: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  };
}

// ==================== 配置管理相关 ====================

export interface SystemConfiguration {
  server: ServerConfig;
  database: DatabaseConfig;
  ai: AIConfig;
  cache: CacheConfig;
  storage: StorageConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
}

export interface ServerConfig {
  port: number;
  host: string;
  env: 'development' | 'staging' | 'production';
  cors: {
    enabled: boolean;
    origins: string[];
  };
  rate_limiting: {
    enabled: boolean;
    window_ms: number;
    max_requests: number;
  };
  body_limits: {
    json: string;
    url_encoded: string;
    file_upload: string;
  };
}

export interface DatabaseConfig {
  type: 'sqlite' | 'postgres' | 'mysql';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  pool_size: number;
  timeout: number;
  backup: {
    enabled: boolean;
    interval: string;
    retention_days: number;
  };
}

export interface AIConfig {
  primary_provider: string;
  fallback_enabled: boolean;
  timeout: number;
  max_retries: number;
  providers: Record<string, {
    enabled: boolean;
    api_key: string;
    base_url?: string;
    models: string[];
    rate_limits: {
      requests_per_minute: number;
      tokens_per_minute: number;
    };
  }>;
}

export interface CacheConfig {
  enabled: boolean;
  type: 'memory' | 'redis';
  host?: string;
  port?: number;
  ttl: {
    short: number;
    medium: number;
    long: number;
  };
  max_size: number;
}

export interface StorageConfig {
  type: 'local' | 's3' | 'azure' | 'gcp';
  base_path: string;
  max_file_size: number;
  allowed_types: string[];
  cdn: {
    enabled: boolean;
    base_url?: string;
  };
}

export interface SecurityConfig {
  encryption: {
    algorithm: string;
    key_length: number;
  };
  sessions: {
    secret: string;
    duration: number;
    secure: boolean;
  };
  api_keys: {
    enabled: boolean;
    require_for_ai: boolean;
  };
  content_filtering: {
    enabled: boolean;
    severity_threshold: number;
  };
}

export interface MonitoringConfig {
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file_enabled: boolean;
    console_enabled: boolean;
    structured: boolean;
  };
  metrics: {
    enabled: boolean;
    collection_interval: number;
    retention_days: number;
  };
  alerts: {
    enabled: boolean;
    channels: Array<{
      type: 'email' | 'webhook' | 'slack';
      config: Record<string, any>;
    }>;
  };
}

// ==================== 日志和审计相关 ====================

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  component: string;
  message: string;
  context?: Record<string, any>;
  trace_id?: string;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  stack_trace?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  event_type: string;
  actor: {
    type: 'user' | 'system' | 'api';
    id?: string;
    ip_address?: string;
    user_agent?: string;
  };
  resource: {
    type: 'character' | 'session' | 'message' | 'config';
    id: string;
  };
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: Record<string, any>;
}

// ==================== 备份和恢复相关 ====================

export interface BackupInfo {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  file_path: string;
  file_size?: number;
  compressed_size?: number;
  includes: {
    database: boolean;
    files: boolean;
    config: boolean;
    logs: boolean;
  };
  metadata?: {
    version: string;
    checksum: string;
    encryption: boolean;
  };
}

export interface RestoreJob {
  id: string;
  backup_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  started_at: string;
  completed_at?: string;
  options: {
    restore_database: boolean;
    restore_files: boolean;
    restore_config: boolean;
    overwrite_existing: boolean;
  };
  error?: string;
}

// ==================== API文档相关 ====================

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary: string;
  description?: string;
  parameters?: APIParameter[];
  request_body?: {
    required: boolean;
    content_type: string;
    schema: any;
  };
  responses: Record<string, {
    description: string;
    schema?: any;
  }>;
  tags: string[];
  deprecated?: boolean;
}

export interface APIParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  description?: string;
  schema: any;
  example?: any;
}

// ==================== 维护和部署相关 ====================

export interface MaintenanceWindow {
  id: string;
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  impact_level: 'low' | 'medium' | 'high';
  affected_services: string[];
  notification_sent: boolean;
}

export interface DeploymentInfo {
  version: string;
  build_number: string;
  deployed_at: string;
  deployed_by: string;
  environment: string;
  git_commit: string;
  git_branch: string;
  rollback_version?: string;
  migration_status?: {
    applied: string[];
    pending: string[];
  };
}