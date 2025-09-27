const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

console.log('检查数据库中的角色数据...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    return;
  }

  console.log('✅ 数据库连接成功');

  db.get('SELECT id, name, description, created_at, updated_at FROM characters WHERE id = 19', (err, row) => {
    if (err) {
      console.error('❌ 查询失败:', err);
    } else if (row) {
      console.log('\n数据库中的角色数据:');
      console.log('ID:', row.id);
      console.log('Name:', row.name);
      console.log('Name Buffer:', Buffer.from(row.name, 'utf8'));
      console.log('Description (前50字符):', row.description.substring(0, 50) + '...');
      console.log('Created:', row.created_at);
      console.log('Updated:', row.updated_at);

      // 测试JSON序列化
      console.log('\nJSON序列化测试:');
      const jsonStr = JSON.stringify(row);
      console.log('JSON String:', jsonStr);

      // 模拟Express响应
      const responseObj = {
        id: row.id,
        name: row.name,
        description: row.description
      };
      console.log('\n模拟API响应:');
      console.log(JSON.stringify(responseObj));
    } else {
      console.log('❌ 未找到ID为19的角色');
    }

    db.close();
  });
});