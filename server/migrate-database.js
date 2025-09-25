const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding new columns to characters table...');

// 添加新的沉浸式字段
const alterQueries = [
  'ALTER TABLE characters ADD COLUMN story_world TEXT',
  'ALTER TABLE characters ADD COLUMN character_background TEXT',
  'ALTER TABLE characters ADD COLUMN has_mission BOOLEAN DEFAULT 0',
  'ALTER TABLE characters ADD COLUMN current_mission TEXT',
  'ALTER TABLE characters ADD COLUMN current_mood TEXT',
  'ALTER TABLE characters ADD COLUMN time_setting TEXT'
];

let completed = 0;

alterQueries.forEach((query, index) => {
  db.run(query, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error(`Error adding column ${index + 1}:`, err.message);
    } else {
      console.log(`✅ Added column ${index + 1}`);
    }

    completed++;
    if (completed === alterQueries.length) {
      console.log('✅ Database migration completed!');
      db.close();
    }
  });
});