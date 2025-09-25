const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Final cleanup of corrupted character data...');

// 直接删除包含乱码的特定ID
const corruptedIds = [6, 7, 9];

const deletePromises = corruptedIds.map(id => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM characters WHERE id = ?', [id], function(err) {
      if (err) {
        console.error(`Error deleting character ${id}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Deleted character ID ${id} (${this.changes} rows affected)`);
        resolve();
      }
    });
  });
});

Promise.all(deletePromises).then(() => {
  console.log('✅ All corrupted characters deleted!');

  // 清理相关的聊天数据
  db.run(`
    DELETE FROM chat_sessions
    WHERE character_id NOT IN (SELECT id FROM characters)
  `, (err) => {
    if (err) {
      console.error('Error cleaning chat sessions:', err.message);
    } else {
      console.log('✅ Orphaned chat sessions cleaned');
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

      // 显示最终的角色列表
      db.all('SELECT id, name, description FROM characters ORDER BY id', (err, rows) => {
        if (err) {
          console.error('Error fetching final characters:', err);
        } else {
          console.log('\n📋 Final clean character list:');
          rows.forEach(row => {
            console.log(`  ID ${row.id}: ${row.name} - ${row.description.substring(0, 50)}...`);
          });
          console.log(`\n🎉 Database now has ${rows.length} clean characters!`);
        }
        db.close();
      });
    });
  });
}).catch(err => {
  console.error('Failed to delete corrupted characters:', err);
  db.close();
});