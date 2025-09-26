/**
 * 角色相关类型定义
 */

export interface CharacterPersonalityData {
  energy: number;        // 活力 (0-100)
  friendliness: number;  // 友善度 (0-100)
  humor: number;         // 幽默感 (0-100)
  professionalism: number; // 专业度 (0-100)
  creativity: number;    // 创造力 (0-100)
  empathy: number;       // 共情能力 (0-100)
}

export interface CharacterExample {
  input: string;   // 用户输入示例
  output: string;  // 角色回复示例
}

export type CharacterMood =
  | 'happy'     // 高兴
  | 'sad'       // 悲伤
  | 'excited'   // 兴奋
  | 'calm'      // 平静
  | 'angry'     // 愤怒
  | 'surprised' // 惊讶
  | 'confused'  // 困惑
  | 'thinking'; // 思考

export type TimeSettings =
  | 'morning'   // 早晨
  | 'afternoon' // 下午
  | 'evening'   // 傍晚
  | 'night';    // 夜晚

export type PersonalityPreset =
  | 'friendly'      // 友善型
  | 'professional'  // 专业型
  | 'energetic'     // 活力型
  | 'mysterious'    // 神秘型
  | 'humorous';     // 幽默型

export interface Character {
  id?: number;
  name: string;
  description: string;
  avatar?: string;
  story_world?: string;           // 故事世界背景
  character_background?: string;  // 角色背景故事
  has_mission?: boolean;          // 是否有使命/任务
  current_mission?: string;       // 当前使命描述
  current_mood?: CharacterMood;   // 当前情绪
  time_setting?: TimeSettings;    // 时间设定
  use_real_time?: boolean;        // 是否使用真实时间
  personality_preset?: PersonalityPreset; // 性格预设
  personality_data?: CharacterPersonalityData; // 详细性格数据
  examples?: CharacterExample[];  // 对话示例
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
  current_mood?: CharacterMood;
  time_setting?: TimeSettings;
  use_real_time?: boolean;
  personality_preset?: PersonalityPreset;
  personality_data?: CharacterPersonalityData;
  examples?: CharacterExample[];
}

export interface UpdateCharacterRequest extends Partial<CreateCharacterRequest> {
  avatar?: string;
}

export interface CharacterWithStats extends Character {
  stats?: {
    total_sessions: number;
    total_messages: number;
    last_chat_time?: string;
    popularity_score: number;
  };
}

// 角色版本控制（用于回滚功能）
export interface CharacterVersion {
  id: number;
  character_id: number;
  version: number;
  character_data: Character;
  change_summary?: string;
  created_at: string;
  created_by?: string;
}

// 角色模板（用于快速创建）
export interface CharacterTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  template_data: Partial<Character>;
  usage_count: number;
  created_at: string;
}

export const DEFAULT_PERSONALITY_PRESETS: Record<PersonalityPreset, CharacterPersonalityData> = {
  friendly: {
    energy: 70,
    friendliness: 90,
    humor: 60,
    professionalism: 50,
    creativity: 60,
    empathy: 85
  },
  professional: {
    energy: 60,
    friendliness: 70,
    humor: 30,
    professionalism: 95,
    creativity: 50,
    empathy: 60
  },
  energetic: {
    energy: 95,
    friendliness: 80,
    humor: 75,
    professionalism: 40,
    creativity: 85,
    empathy: 65
  },
  mysterious: {
    energy: 45,
    friendliness: 40,
    humor: 35,
    professionalism: 70,
    creativity: 80,
    empathy: 50
  },
  humorous: {
    energy: 80,
    friendliness: 85,
    humor: 95,
    professionalism: 35,
    creativity: 90,
    empathy: 75
  }
};