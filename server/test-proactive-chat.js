const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
console.log('设置测试数据以触发主动聊天...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err);
    process.exit(1);
  } else {
    console.log('数据库连接成功');
  }
});

// 设置会话的last_user_activity为45分钟前，以触发主动聊天
const fortyFiveMinutesAgo = new Date(Date.now() - 45 * 60 * 1000).toISOString();

db.run(`UPDATE chat_sessions SET last_user_activity = ? WHERE id = ?`,
  [fortyFiveMinutesAgo, '754689bf-3633-41e9-afce-0ee291366116'],
  function(err) {
    if (err) {
      console.error('更新会话时间时出错:', err);
    } else {
      console.log('✅ 成功设置会话时间为45分钟前，变更数量:', this.changes);
    }

    db.close((err) => {
      if (err) {
        console.error('关闭数据库时出错:', err);
      } else {
        console.log('数据库连接已关闭');
      }
      process.exit(0);
    });
  }
);