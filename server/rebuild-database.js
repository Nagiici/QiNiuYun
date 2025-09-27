const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.db');
const backupPath = path.join(__dirname, 'database_backup.db');

console.log('开始重建数据库...');

// 备份原始数据库
if (fs.existsSync(dbPath)) {
  fs.copyFileSync(dbPath, backupPath);
  console.log('✅ 原数据库已备份');
}

// 删除损坏的数据库
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ 已删除损坏的数据库');
}

// 创建新的数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    return;
  }

  console.log('✅ 新数据库连接成功');

  // 立即设置UTF-8编码
  db.serialize(() => {
    // 设置编码
    db.exec("PRAGMA encoding = 'UTF-8'");
    db.exec("PRAGMA foreign_keys = ON");

    console.log('✅ 数据库编码设置完成');

    // 创建角色表
    db.run(`
      CREATE TABLE characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        avatar TEXT,
        personality_preset TEXT,
        custom_instructions TEXT,
        story_background TEXT,
        story_world TEXT,
        character_background TEXT,
        has_mission INTEGER DEFAULT 0,
        current_mission TEXT,
        current_mood TEXT DEFAULT 'calm',
        time_setting TEXT DEFAULT 'morning',
        use_real_time INTEGER DEFAULT 0,
        is_public INTEGER DEFAULT 0,
        personality_data TEXT,
        examples TEXT,
        version INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ 创建角色表失败:', err);
        return;
      }

      console.log('✅ 角色表创建成功');

      // 插入测试角色
      const testCharacter = {
        id: 19,
        name: '井芹仁菜',
        description: '稍微有些内向的普通女孩子，小学、中学、高中都不太引人注意，成绩也很普通。没有什么特别的梦想，观察周遭的气氛，配合着大家而生活。\n\n喜欢的食物是浸物、牛奶咖啡和酸奶；兴趣是昭和、佛像和收集御朱印。\n\n拥有如此古旧兴趣的原因似乎是源自奶奶。',
        personality_preset: 'energetic',
        personality_data: JSON.stringify({
          energy: 95,
          friendliness: 80,
          humor: 75,
          professionalism: 50,
          creativity: 80,
          empathy: 70
        }),
        examples: '[]'
      };

      const stmt = db.prepare(`
        INSERT INTO characters (
          id, name, description, personality_preset, personality_data, examples
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        testCharacter.id,
        testCharacter.name,
        testCharacter.description,
        testCharacter.personality_preset,
        testCharacter.personality_data,
        testCharacter.examples
      ], function(err) {
        if (err) {
          console.error('❌ 插入测试角色失败:', err);
        } else {
          console.log('✅ 测试角色插入成功');

          // 验证插入的数据
          db.get('SELECT name, description FROM characters WHERE id = 19', (err, row) => {
            if (err) {
              console.error('❌ 验证失败:', err);
            } else if (row) {
              console.log('✅ 验证成功:');
              console.log('Name:', row.name);
              console.log('Description:', row.description.substring(0, 50) + '...');
            }

            stmt.finalize();
            db.close();
          });
        }
      });
    });

    // 创建其他必要的表
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        character_id INTEGER,
        character_name TEXT,
        last_message TEXT,
        last_activity TEXT,
        last_user_activity TEXT,
        unread_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters (id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        sender TEXT,
        message_type TEXT DEFAULT 'text',
        content TEXT,
        emotion TEXT,
        is_proactive INTEGER DEFAULT 0,
        timestamp TEXT,
        FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS ai_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        current_provider TEXT,
        temperature REAL,
        providers_config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS character_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_name TEXT NOT NULL,
        version INTEGER NOT NULL,
        character_data TEXT NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(character_name, version)
      )
    `);
  });
});