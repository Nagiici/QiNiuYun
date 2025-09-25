const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Cleaning corrupted character data...');

// 删除包含乱码的角色数据
db.run(`
  DELETE FROM characters
  WHERE name LIKE '%ʱ%'
     OR name LIKE '%��%'
     OR name LIKE '%Խ%'
     OR name LIKE '%ɫ%'
     OR description LIKE '%��%'
     OR description LIKE '%ʱ%'
`, (err) => {
  if (err) {
    console.error('Error cleaning corrupted data:', err.message);
  } else {
    console.log('✅ Corrupted character data cleaned');
  }

  // 删除相关的聊天会话
  db.run(`
    DELETE FROM chat_sessions
    WHERE character_name LIKE '%ʱ%'
       OR character_name LIKE '%��%'
       OR character_name LIKE '%Խ%'
       OR character_name LIKE '%ɫ%'
  `, (err) => {
    if (err) {
      console.error('Error cleaning chat sessions:', err.message);
    } else {
      console.log('✅ Corrupted chat sessions cleaned');
    }

    console.log('✅ Database cleanup completed!');
    db.close();
  });
});