const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding use_real_time column to characters table...');

// 添加 use_real_time 字段
const alterQuery = 'ALTER TABLE characters ADD COLUMN use_real_time BOOLEAN DEFAULT 1';

db.run(alterQuery, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Error adding use_real_time column:', err.message);
  } else {
    console.log('✅ Added use_real_time column');
  }

  console.log('✅ Database migration for use_real_time completed!');
  db.close();
});