const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('📋 AI配置表结构:');
db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='ai_config'", (err, schema) => {
  if (err) {
    console.error('Error getting schema:', err);
    return;
  }
  console.log(schema?.sql || '表不存在');

  console.log('\n📊 当前AI配置数据:');
  db.all('SELECT * FROM ai_config ORDER BY updated_at DESC', (err, configs) => {
    if (err) {
      console.error('Error getting data:', err);
      db.close();
      return;
    }

    console.log('记录数量:', configs.length);
    configs.forEach((config, index) => {
      console.log(`记录 ${index + 1}:`, {
        id: config.id,
        current_provider: config.current_provider,
        temperature: config.temperature,
        providers_config: config.providers_config,
        created_at: config.created_at,
        updated_at: config.updated_at
      });
    });

    db.close();
  });
});