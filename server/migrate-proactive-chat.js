const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
console.log('正在迁移数据库以支持主动聊天功能...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err);
    process.exit(1);
  } else {
    console.log('数据库连接成功');
  }
});

async function migrate() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 添加新的列到chat_sessions表
      db.run(`ALTER TABLE chat_sessions ADD COLUMN unread_count INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('添加unread_count列时出错:', err);
        } else {
          console.log('✅ 添加了unread_count列');
        }
      });

      db.run(`ALTER TABLE chat_sessions ADD COLUMN last_user_activity DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('添加last_user_activity列时出错:', err);
        } else {
          console.log('✅ 添加了last_user_activity列');
        }
      });

      // 添加新的列到chat_messages表
      db.run(`ALTER TABLE chat_messages ADD COLUMN is_proactive BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('添加is_proactive列时出错:', err);
        } else {
          console.log('✅ 添加了is_proactive列');
        }
      });

      // 更新现有会话的last_user_activity字段
      db.run(`UPDATE chat_sessions SET last_user_activity = last_activity WHERE last_user_activity IS NULL`, (err) => {
        if (err && !err.message.includes('no such column')) {
          console.error('更新现有会话数据时出错:', err);
        } else if (!err) {
          console.log('✅ 更新了现有会话的last_user_activity字段');
        } else {
          console.log('⚠️ 跳过更新，列可能已存在');
        }
      });

      console.log('✅ 数据库迁移完成！');
      resolve();
    });
  });
}

migrate().then(() => {
  db.close((err) => {
    if (err) {
      console.error('关闭数据库时出错:', err);
    } else {
      console.log('数据库连接已关闭');
    }
    process.exit(0);
  });
}).catch(err => {
  console.error('迁移过程中出错:', err);
  process.exit(1);
});