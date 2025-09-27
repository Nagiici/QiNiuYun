const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('检查数据库编码问题...');

// 查询字符19的数据
db.get('SELECT * FROM characters WHERE id = 19', (err, row) => {
  if (err) {
    console.error('查询错误:', err);
  } else if (row) {
    console.log('角色ID 19的数据:');
    console.log('Name:', row.name);
    console.log('Description:', row.description);
    console.log('Name Buffer:', Buffer.from(row.name, 'utf8'));
    console.log('Description Buffer:', Buffer.from(row.description, 'utf8'));
  } else {
    console.log('未找到角色ID 19');
  }

  db.close();
});