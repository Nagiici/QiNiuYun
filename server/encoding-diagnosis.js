const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

console.log('开始全面诊断编码问题...');

// 测试数据
const testData = {
  name: '井芹仁菜',
  description: '更新后的描述：稍微有些内向的普通女孩子。'
};

// 1. 检查原始数据的编码
console.log('\n1. 原始数据检查:');
console.log('Name:', testData.name);
console.log('Name Buffer:', Buffer.from(testData.name, 'utf8'));
console.log('Description:', testData.description);

// 2. 连接数据库
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    return;
  }

  console.log('\n2. 数据库连接成功');

  db.serialize(() => {
    // 3. 设置编码
    db.exec("PRAGMA encoding = 'UTF-8'", (err) => {
      if (err) {
        console.error('❌ 设置编码失败:', err);
      } else {
        console.log('✅ 数据库编码设置为UTF-8');
      }
    });

    // 4. 检查当前编码
    db.get("PRAGMA encoding", (err, row) => {
      if (err) {
        console.error('❌ 获取编码失败:', err);
      } else {
        console.log('✅ 当前数据库编码:', row);
      }
    });

    // 5. 直接测试插入
    console.log('\n3. 直接插入测试:');

    // 先删除测试记录
    db.run('DELETE FROM characters WHERE id = 999', () => {

      // 使用prepared statement插入
      const stmt = db.prepare(`
        INSERT INTO characters (
          id, name, description, personality_preset, created_at, updated_at
        ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      stmt.run([999, testData.name, testData.description, 'friendly'], function(err) {
        if (err) {
          console.error('❌ 插入失败:', err);
        } else {
          console.log('✅ 插入成功');

          // 6. 立即检查插入的数据
          db.get('SELECT name, description FROM characters WHERE id = 999', (err, row) => {
            if (err) {
              console.error('❌ 查询失败:', err);
            } else if (row) {
              console.log('\n4. 插入后立即查询:');
              console.log('Name:', row.name);
              console.log('Name Buffer:', Buffer.from(row.name, 'utf8'));
              console.log('Description:', row.description);

              // 7. 测试更新操作
              console.log('\n5. 测试更新操作:');
              const updateStmt = db.prepare(`
                UPDATE characters SET
                  name = ?, description = ?, updated_at = datetime('now')
                WHERE id = ?
              `);

              const newData = {
                name: '井芹仁菜',
                description: '更新测试：这是一个新的描述'
              };

              updateStmt.run([newData.name, newData.description, 999], function(err) {
                if (err) {
                  console.error('❌ 更新失败:', err);
                } else {
                  console.log('✅ 更新成功，changes:', this.changes);

                  // 8. 检查更新后的数据
                  db.get('SELECT name, description FROM characters WHERE id = 999', (err, row) => {
                    if (err) {
                      console.error('❌ 更新后查询失败:', err);
                    } else if (row) {
                      console.log('\n6. 更新后查询结果:');
                      console.log('Name:', row.name);
                      console.log('Name Buffer:', Buffer.from(row.name, 'utf8'));
                      console.log('Description:', row.description);

                      // 9. 测试JSON stringify/parse
                      console.log('\n7. JSON处理测试:');
                      const jsonStr = JSON.stringify(row);
                      console.log('JSON字符串:', jsonStr);
                      const parsed = JSON.parse(jsonStr);
                      console.log('解析后的name:', parsed.name);
                      console.log('解析后的Buffer:', Buffer.from(parsed.name, 'utf8'));
                    }

                    updateStmt.finalize();

                    // 清理测试数据
                    db.run('DELETE FROM characters WHERE id = 999', () => {
                      db.close();
                    });
                  });
                }
              });
            }
          });
        }

        stmt.finalize();
      });
    });
  });
});