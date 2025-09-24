import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';

const dbPath = path.join(__dirname, '../../database.db');

// 创建数据库连接
export const db = new sqlite3.Database(dbPath);

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

  // 插入一些预设角色数据
  await insertDefaultCharacters();

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
                               story_background, is_public, personality_data, examples)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        characterData.name,
        characterData.description,
        characterData.avatar,
        characterData.personality_preset,
        characterData.custom_instructions,
        characterData.story_background,
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

  // 获取聊天会话
  static async getChatSessions() {
    return await dbAll('SELECT * FROM chat_sessions ORDER BY last_activity DESC LIMIT 10');
  }

  // 创建聊天会话
  static async createChatSession(sessionId: string, characterId: number, characterName: string) {
    await dbRun(`
      INSERT OR REPLACE INTO chat_sessions (id, character_id, character_name, last_activity)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `, [sessionId, characterId, characterName]);
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
  static async addChatMessage(sessionId: string, sender: string, content: string, messageType = 'text', emotion?: string) {
    await dbRun(`
      INSERT INTO chat_messages (session_id, sender, message_type, content, emotion)
      VALUES (?, ?, ?, ?, ?)
    `, [sessionId, sender, messageType, content, emotion]);

    // 更新会话的最后活动时间和最后消息
    await dbRun(`
      UPDATE chat_sessions
      SET last_message = ?, last_activity = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [content.substring(0, 50) + (content.length > 50 ? '...' : ''), sessionId]);
  }
}