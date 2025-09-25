const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Cleaning all corrupted character data...');

// 删除所有包含乱码字符的角色数据
db.run(`
  DELETE FROM characters
  WHERE name LIKE '%�%'
     OR description LIKE '%�%'
     OR name NOT REGEXP '[a-zA-Z\u4e00-\u9fa5\u0100-\u017F\u0180-\u024F]'
`, (err) => {
  if (err) {
    console.error('Error cleaning corrupted data:', err.message);
  } else {
    console.log('✅ All corrupted character data cleaned');
  }

  // 删除相关的聊天会话和消息
  db.run(`
    DELETE FROM chat_sessions
    WHERE character_name LIKE '%�%'
       OR character_id NOT IN (SELECT id FROM characters)
  `, (err) => {
    if (err) {
      console.error('Error cleaning chat sessions:', err.message);
    } else {
      console.log('✅ Corrupted chat sessions cleaned');
    }

    db.run(`
      DELETE FROM chat_messages
      WHERE session_id NOT IN (SELECT id FROM chat_sessions)
    `, (err) => {
      if (err) {
        console.error('Error cleaning chat messages:', err.message);
      } else {
        console.log('✅ Orphaned chat messages cleaned');
      }

      console.log('✅ Database cleanup completed!');

      // 显示剩余的角色
      db.all('SELECT id, name, description FROM characters ORDER BY id', (err, rows) => {
        if (err) {
          console.error('Error fetching remaining characters:', err);
        } else {
          console.log('\n📋 Remaining characters:');
          rows.forEach(row => {
            console.log(`  ID ${row.id}: ${row.name} - ${row.description.substring(0, 50)}...`);
          });
        }
        db.close();
      });
    });
  });
});