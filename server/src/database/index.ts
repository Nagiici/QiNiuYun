import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';

const dbPath = path.join(__dirname, '../../database.db');

// 创建数据库连接，确保UTF-8编码
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected with UTF-8 encoding');
    // 确保SQLite使用UTF-8编码
    db.exec("PRAGMA encoding = 'UTF-8'", (err) => {
      if (err) {
        console.error('Error setting UTF-8 encoding:', err);
      } else {
        console.log('✅ SQLite UTF-8 encoding set successfully');
      }
    });

    // 设置其他重要的PRAGMA
    db.exec("PRAGMA foreign_keys = ON", (err) => {
      if (err) console.error('Error enabling foreign keys:', err);
    });
  }
});

// 将sqlite3方法promisify
export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));

// 初始化数据库表
export async function initDatabase() {
  console.log('🗄️  Initializing database...');

  // 创建角色表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      avatar TEXT,
      personality_preset TEXT,
      custom_instructions TEXT,
      story_background TEXT,
      -- 新增沉浸式字段
      story_world TEXT, -- 故事世界/环境设定
      character_background TEXT, -- 角色详细背景
      has_mission BOOLEAN DEFAULT 0, -- 是否有任务
      current_mission TEXT, -- 当前任务描述
      current_mood TEXT, -- 当前情绪状态
      time_setting TEXT, -- 时间设定
      use_real_time BOOLEAN DEFAULT 1, -- 使用真实时间
      is_public BOOLEAN DEFAULT 0,
      personality_data TEXT, -- JSON格式存储性格雷达图数据
      examples TEXT, -- JSON格式存储输入输出样例
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建聊天会话表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      character_id INTEGER,
      character_name TEXT,
      last_message TEXT,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      unread_count INTEGER DEFAULT 0, -- 未读消息计数
      last_user_activity DATETIME DEFAULT CURRENT_TIMESTAMP, -- 用户最后活动时间
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (character_id) REFERENCES characters (id)
    )
  `);

  // 创建聊天消息表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      sender TEXT NOT NULL, -- 'user' 或 'ai'
      message_type TEXT DEFAULT 'text', -- 'text' 或 'voice'
      content TEXT NOT NULL,
      voice_url TEXT, -- 语音文件URL（如果是语音消息）
      emotion TEXT, -- 消息情感分析结果
      is_proactive BOOLEAN DEFAULT 0, -- 是否为AI主动发送的消息
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
    )
  `);

  // 创建用户表（简单的用户管理）
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      avatar TEXT,
      settings TEXT, -- JSON格式存储用户设置
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建AI配置表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS ai_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      current_provider TEXT NOT NULL,
      temperature REAL DEFAULT 0.7,
      providers_config TEXT, -- JSON格式存储所有提供商配置
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建语音服务配置表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS speech_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tts_config TEXT, -- JSON格式存储TTS配置
      stt_config TEXT, -- JSON格式存储STT配置
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建角色版本管理表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS character_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_name TEXT NOT NULL,
      version INTEGER NOT NULL,
      note TEXT, -- 版本备注
      character_data TEXT, -- JSON格式存储完整角色数据
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(character_name, version)
    )
  `);

  // 创建系统配置表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS system_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT NOT NULL UNIQUE,
      config_value TEXT NOT NULL, -- JSON格式存储配置值
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 插入一些预设角色数据
  await insertDefaultCharacters();

  // 创建性能优化索引
  await createIndexes();

  console.log('✅ Database initialized successfully');
}

// 插入默认角色数据
async function insertDefaultCharacters() {
  const defaultCharacters = [
    {
      name: '哈利波特',
      description: '勇敢的巫师，霍格沃茨的传奇学生',
      personality_preset: 'brave',
      story_background: '霍格沃茨魔法学校的学生，拥有闪电形伤疤，是魔法世界的救世主',
      personality_data: JSON.stringify({ energy: 75, friendliness: 80, humor: 65, professionalism: 50, creativity: 70, empathy: 85 }),
      examples: JSON.stringify([
        { input: '你好，哈利！', output: '你好！很高兴认识你。你也对魔法感兴趣吗？' },
        { input: '告诉我一些魔法的事情', output: '魔法真的很神奇！在霍格沃茨，我们学习各种咒语和药剂学。你想了解哪种魔法呢？' }
      ])
    },
    {
      name: '苏格拉底',
      description: '古希腊哲学家，智慧的引导者',
      personality_preset: 'wise',
      story_background: '古希腊雅典的哲学家，以"我知道我一无所知"的智慧著称，善于通过问答启发他人思考',
      personality_data: JSON.stringify({ energy: 40, friendliness: 75, humor: 50, professionalism: 90, creativity: 80, empathy: 95 }),
      examples: JSON.stringify([
        { input: '什么是智慧？', output: '这是一个绝好的问题！但首先，让我问你：你认为什么是智慧？我们一起来探讨这个问题。' },
        { input: '生活的意义是什么？', output: '朋友，在我们寻求答案之前，你是否思考过：我们为什么要寻找生活的意义？这个问题本身说明了什么？' }
      ])
    },
    {
      name: '爱因斯坦',
      description: '天才物理学家，相对论的创立者',
      personality_preset: 'professional',
      story_background: '20世纪最伟大的科学家之一，提出了相对论理论，获得诺贝尔物理学奖',
      personality_data: JSON.stringify({ energy: 60, friendliness: 70, humor: 65, professionalism: 95, creativity: 100, empathy: 75 }),
      examples: JSON.stringify([
        { input: '相对论是什么？', output: '相对论揭示了时间和空间的本质。简单来说，时间和空间不是绝对的，而是相对的。你想了解哪个方面？' },
        { input: '科学研究需要什么品质？', output: '好奇心！想象力比知识更重要。还要有持之以恒的精神，因为科学发现往往需要长期的努力。' }
      ])
    }
  ];

  for (const character of defaultCharacters) {
    const existing = await dbGet('SELECT id FROM characters WHERE name = ?', [character.name]);
    if (!existing) {
      await dbRun(`
        INSERT INTO characters (name, description, personality_preset, story_background, personality_data, examples)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        character.name,
        character.description,
        character.personality_preset,
        character.story_background,
        character.personality_data,
        character.examples
      ]);
    }
  }
}

// 创建数据库索引以优化查询性能
async function createIndexes() {
  const indexes = [
    // 角色表索引
    'CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name)',
    'CREATE INDEX IF NOT EXISTS idx_characters_created_at ON characters(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_characters_is_public ON characters(is_public)',

    // 聊天会话索引
    'CREATE INDEX IF NOT EXISTS idx_chat_sessions_character_id ON chat_sessions(character_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at)',

    // 聊天消息索引
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender)',

    // 角色版本索引
    'CREATE INDEX IF NOT EXISTS idx_character_versions_character_name ON character_versions(character_name)',
    'CREATE INDEX IF NOT EXISTS idx_character_versions_created_at ON character_versions(created_at)'
  ];

  for (const indexSQL of indexes) {
    try {
      await dbRun(indexSQL);
    } catch (error) {
      console.warn('Index creation warning:', error);
    }
  }

  console.log('✅ Database indexes created successfully');
}

// 数据库查询辅助函数
export class DatabaseService {
  // 获取所有角色
  static async getAllCharacters() {
    return await dbAll('SELECT * FROM characters ORDER BY created_at DESC');
  }

  // 获取单个角色
  static async getCharacterById(id: number) {
    return await dbGet('SELECT * FROM characters WHERE id = ?', [id]);
  }

  // 创建新角色
  static async createCharacter(characterData: any) {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO characters (name, description, avatar, personality_preset, custom_instructions,
                               story_background, story_world, character_background, has_mission,
                               current_mission, current_mood, time_setting, use_real_time, is_public,
                               personality_data, examples)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        characterData.name,
        characterData.description,
        characterData.avatar,
        characterData.personality_preset,
        characterData.custom_instructions,
        characterData.story_background,
        characterData.story_world,
        characterData.character_background,
        characterData.has_mission ? 1 : 0,
        characterData.current_mission,
        characterData.current_mood,
        characterData.time_setting,
        characterData.use_real_time ? 1 : 0,
        characterData.is_public ? 1 : 0,
        JSON.stringify(characterData.personality_data),
        JSON.stringify(characterData.examples)
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...characterData });
        }
      });
    });
  }

  // 更新角色
  static async updateCharacter(id: number, characterData: any) {
    return new Promise((resolve, reject) => {
      // 确保数据库使用UTF-8编码
      db.exec("PRAGMA encoding = 'UTF-8'", (err) => {
        if (err) console.warn('Warning: Could not set UTF-8 encoding:', err);
      });

      // 使用prepared statement确保UTF-8编码处理
      const stmt = db.prepare(`
        UPDATE characters SET
          name = ?, description = ?, avatar = ?, personality_preset = ?,
          custom_instructions = ?, story_background = ?, story_world = ?,
          character_background = ?, has_mission = ?, current_mission = ?,
          current_mood = ?, time_setting = ?, use_real_time = ?, is_public = ?,
          personality_data = ?, examples = ?, updated_at = datetime('now')
        WHERE id = ?
      `);

      stmt.run([
        characterData.name,
        characterData.description,
        characterData.avatar,
        characterData.personality_preset,
        characterData.custom_instructions,
        characterData.story_background,
        characterData.story_world,
        characterData.character_background,
        characterData.has_mission ? 1 : 0,
        characterData.current_mission,
        characterData.current_mood,
        characterData.time_setting,
        characterData.use_real_time ? 1 : 0,
        characterData.is_public ? 1 : 0,
        JSON.stringify(characterData.personality_data),
        JSON.stringify(characterData.examples),
        id
      ], function(err) {
        stmt.finalize();
        if (err) {
          console.error('Update character error:', err);
          reject(err);
        } else {
          console.log('Character updated successfully, changes:', this.changes);
          resolve({ changes: this.changes, id, ...characterData });
        }
      });
    });
  }

  // 删除角色
  static async deleteCharacter(id: number) {
    return new Promise((resolve, reject) => {
      // 首先删除相关的聊天记录
      db.run(`DELETE FROM chat_messages WHERE session_id IN
              (SELECT id FROM chat_sessions WHERE character_id = ?)`, [id], (err) => {
        if (err) {
          reject(err);
          return;
        }

        // 删除聊天会话
        db.run(`DELETE FROM chat_sessions WHERE character_id = ?`, [id], (err) => {
          if (err) {
            reject(err);
            return;
          }

          // 最后删除角色
          db.run(`DELETE FROM characters WHERE id = ?`, [id], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ changes: this.changes });
            }
          });
        });
      });
    });
  }

  // 获取聊天会话
  static async getChatSessions() {
    return await dbAll('SELECT * FROM chat_sessions ORDER BY last_activity DESC LIMIT 10');
  }

  // 创建聊天会话
  static async createChatSession(sessionId: string, characterId: number, characterName: string) {
    const currentTimestamp = new Date().toISOString();
    await dbRun(`
      INSERT OR REPLACE INTO chat_sessions (id, character_id, character_name, last_activity, last_user_activity)
      VALUES (?, ?, ?, ?, ?)
    `, [sessionId, characterId, characterName, currentTimestamp, currentTimestamp]);
  }

  // 获取聊天消息
  static async getChatMessages(sessionId: string) {
    return await dbAll('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC', [sessionId]);
  }

  // 获取最近的聊天消息（用于AI记忆功能）
  static async getRecentChatMessages(sessionId: string, limit: number = 10) {
    return await dbAll('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?', [sessionId, limit]);
  }

  // 添加聊天消息
  static async addChatMessage(sessionId: string, sender: string, content: string, messageType = 'text', emotion?: string, isProactive = false) {
    const timestamp = new Date().toISOString();
    await dbRun(`
      INSERT INTO chat_messages (session_id, sender, message_type, content, emotion, is_proactive, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [sessionId, sender, messageType, content, emotion, isProactive ? 1 : 0, timestamp]);

    // 更新会话的最后活动时间和最后消息 - 使用统一的 ISO 时间戳格式
    const lastActivityTimestamp = timestamp; // 使用相同的时间戳
    const messagePreview = content.substring(0, 50) + (content.length > 50 ? '...' : '');

    if (sender === 'user') {
      // 用户发送消息时，重置未读计数，更新用户活动时间
      await dbRun(`
        UPDATE chat_sessions
        SET last_message = ?, last_activity = ?, last_user_activity = ?, unread_count = 0
        WHERE id = ?
      `, [messagePreview, lastActivityTimestamp, lastActivityTimestamp, sessionId]);
    } else {
      // AI发送消息时，增加未读计数（如果是主动消息）
      if (isProactive) {
        await dbRun(`
          UPDATE chat_sessions
          SET last_message = ?, last_activity = ?, unread_count = unread_count + 1
          WHERE id = ?
        `, [messagePreview, lastActivityTimestamp, sessionId]);
      } else {
        await dbRun(`
          UPDATE chat_sessions
          SET last_message = ?, last_activity = ?
          WHERE id = ?
        `, [messagePreview, lastActivityTimestamp, sessionId]);
      }
    }
  }

  // 删除聊天会话（包括所有相关消息）
  static async deleteChatSession(sessionId: string) {
    // 删除会话的所有消息
    await dbRun(`DELETE FROM chat_messages WHERE session_id = ?`, [sessionId]);

    // 删除会话记录
    await dbRun(`DELETE FROM chat_sessions WHERE id = ?`, [sessionId]);
  }

  // 清理损坏的字符编码数据
  static async cleanCorruptedSessions() {
    // 删除包含乱码字符名的会话
    await dbRun(`
      DELETE FROM chat_sessions
      WHERE character_name LIKE '%��%'
         OR character_name LIKE '%ǰ%'
         OR character_name LIKE '%�%'
    `);

    // 删除对应的消息
    await dbRun(`
      DELETE FROM chat_messages
      WHERE session_id NOT IN (SELECT id FROM chat_sessions)
    `);
  }

  // AI配置管理方法

  // 获取AI配置
  static async getAiConfiguration() {
    const config = await dbGet('SELECT * FROM ai_config ORDER BY updated_at DESC LIMIT 1');

    if (config) {
      return {
        id: config.id,
        currentProvider: config.current_provider,
        temperature: config.temperature,
        providers: JSON.parse(config.providers_config || '{}'),
        createdAt: config.created_at,
        updatedAt: config.updated_at
      };
    }

    return null;
  }

  // 保存AI配置
  static async saveAiConfiguration(configData: any) {
    const { currentProvider, temperature, providers, updatedAt } = configData;

    // 先删除旧配置，然后插入新配置（简单的版本控制）
    await dbRun('DELETE FROM ai_config');

    await dbRun(`
      INSERT INTO ai_config (current_provider, temperature, providers_config, updated_at)
      VALUES (?, ?, ?, ?)
    `, [
      currentProvider,
      temperature || 0.7,
      JSON.stringify(providers),
      updatedAt || new Date().toISOString()
    ]);
  }

  // 更新AI配置
  static async updateAiConfiguration(configData: any) {
    const { currentProvider, temperature, providers } = configData;

    const existingConfig = await dbGet('SELECT id FROM ai_config ORDER BY updated_at DESC LIMIT 1');

    if (existingConfig) {
      await dbRun(`
        UPDATE ai_config
        SET current_provider = ?, temperature = ?, providers_config = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        currentProvider,
        temperature || 0.7,
        JSON.stringify(providers),
        existingConfig.id
      ]);
    } else {
      // 如果没有现有配置，创建新配置
      await this.saveAiConfiguration(configData);
    }
  }

  // 语音服务配置管理方法

  // 获取语音服务配置
  static async getSpeechConfiguration() {
    const config = await dbGet('SELECT * FROM speech_config ORDER BY updated_at DESC LIMIT 1');

    if (config) {
      return {
        id: config.id,
        tts: JSON.parse(config.tts_config || '{}'),
        stt: JSON.parse(config.stt_config || '{}'),
        createdAt: config.created_at,
        updatedAt: config.updated_at
      };
    }

    return null;
  }

  // 保存语音服务配置
  static async saveSpeechConfiguration(configData: any) {
    const { tts, stt, updatedAt } = configData;

    // 先删除旧配置，然后插入新配置（简单的版本控制）
    await dbRun('DELETE FROM speech_config');

    await dbRun(`
      INSERT INTO speech_config (tts_config, stt_config, updated_at)
      VALUES (?, ?, ?)
    `, [
      JSON.stringify(tts),
      JSON.stringify(stt),
      updatedAt || new Date().toISOString()
    ]);
  }

  // 更新语音服务配置
  static async updateSpeechConfiguration(configData: any) {
    const { tts, stt } = configData;

    const existingConfig = await dbGet('SELECT id FROM speech_config ORDER BY updated_at DESC LIMIT 1');

    if (existingConfig) {
      await dbRun(`
        UPDATE speech_config
        SET tts_config = ?, stt_config = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        JSON.stringify(tts),
        JSON.stringify(stt),
        existingConfig.id
      ]);
    } else {
      // 如果没有现有配置，创建新配置
      await this.saveSpeechConfiguration(configData);
    }
  }

  // 角色版本管理方法

  // 保存角色版本
  static async saveCharacterVersion(characterName: string, characterData: any, note?: string) {
    // 获取下一个版本号
    const lastVersion = await dbGet(
      'SELECT version FROM character_versions WHERE character_name = ? ORDER BY version DESC LIMIT 1',
      [characterName]
    );
    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO character_versions (character_name, version, note, character_data)
        VALUES (?, ?, ?, ?)
      `, [
        characterName,
        nextVersion,
        note || `版本 ${nextVersion}`,
        JSON.stringify(characterData)
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            character_name: characterName,
            version: nextVersion,
            note: note || `版本 ${nextVersion}`,
            created_at: new Date().toISOString()
          });
        }
      });
    });
  }

  // 获取角色的所有版本
  static async getCharacterVersions(characterName: string) {
    return await dbAll(
      'SELECT * FROM character_versions WHERE character_name = ? ORDER BY version DESC',
      [characterName]
    );
  }

  // 获取特定版本的角色数据
  static async getCharacterVersion(characterName: string, version: number) {
    const versionData = await dbGet(
      'SELECT * FROM character_versions WHERE character_name = ? AND version = ?',
      [characterName, version]
    );

    if (versionData) {
      return {
        ...versionData,
        character_data: JSON.parse(versionData.character_data)
      };
    }

    return null;
  }

  // 删除角色版本
  static async deleteCharacterVersion(characterName: string, version: number) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM character_versions WHERE character_name = ? AND version = ?',
        [characterName, version],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  // 删除角色的所有版本（当删除角色时调用）
  static async deleteAllCharacterVersions(characterName: string) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM character_versions WHERE character_name = ?',
        [characterName],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  // AI主动聊天相关方法

  // 获取需要主动聊天的会话（用户超过指定时间未活动的会话）
  static async getSessionsForProactiveChat(inactiveMinutes: number = 30) {
    const cutoffTime = new Date(Date.now() - inactiveMinutes * 60 * 1000).toISOString();

    return await dbAll(`
      SELECT cs.*, c.personality_preset, c.current_mood, c.personality_data, c.story_background, c.character_background
      FROM chat_sessions cs
      JOIN characters c ON cs.character_id = c.id
      WHERE cs.last_user_activity < ?
        AND cs.last_activity > ?
      ORDER BY cs.last_user_activity ASC
      LIMIT 5
    `, [cutoffTime, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()]); // 24小时内有活动的会话
  }

  // 标记会话已读
  static async markSessionAsRead(sessionId: string) {
    await dbRun(`
      UPDATE chat_sessions
      SET unread_count = 0, last_user_activity = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [sessionId]);
  }

  // 获取会话的最近对话上下文
  static async getSessionContext(sessionId: string, limit: number = 5) {
    return await dbAll(`
      SELECT sender, content, timestamp, is_proactive
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `, [sessionId, limit]);
  }

  // =============== 系统配置管理 ===============

  // 获取系统配置
  static async getSystemConfig(configKey: string) {
    try {
      const result = await dbGet('SELECT config_value FROM system_config WHERE config_key = ?', [configKey]);
      if (result) {
        return JSON.parse(result.config_value);
      }
      return null;
    } catch (error) {
      console.error(`获取系统配置失败 (${configKey}):`, error);
      return null;
    }
  }

  // 保存系统配置
  static async setSystemConfig(configKey: string, configValue: any) {
    try {
      const valueJson = JSON.stringify(configValue);
      await dbRun(`
        INSERT OR REPLACE INTO system_config (config_key, config_value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `, [configKey, valueJson]);
      return true;
    } catch (error) {
      console.error(`保存系统配置失败 (${configKey}):`, error);
      return false;
    }
  }

  // 删除系统配置
  static async deleteSystemConfig(configKey: string) {
    try {
      await dbRun('DELETE FROM system_config WHERE config_key = ?', [configKey]);
      return true;
    } catch (error) {
      console.error(`删除系统配置失败 (${configKey}):`, error);
      return false;
    }
  }
}