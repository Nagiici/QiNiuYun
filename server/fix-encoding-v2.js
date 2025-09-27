const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

console.log('开始修复编码问题...');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    return;
  }

  console.log('✅ 数据库连接成功');

  db.serialize(() => {
    // 设置UTF-8编码
    db.exec("PRAGMA encoding = 'UTF-8'", (err) => {
      if (err) {
        console.error('❌ 设置编码失败:', err);
      } else {
        console.log('✅ 数据库编码设置为UTF-8');
      }
    });

    // 删除损坏的角色
    db.run('DELETE FROM characters WHERE id = 19', (err) => {
      if (err) {
        console.error('❌ 删除损坏角色失败:', err);
        return;
      }

      console.log('✅ 已删除损坏的角色数据');

      // 使用prepared statement重新插入正确的数据
      const stmt = db.prepare(`
        INSERT INTO characters (
          id, name, description, personality_preset, personality_data,
          examples, is_public, use_real_time, time_setting, current_mood,
          has_mission, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      const correctData = {
        id: 19,
        name: '井芹仁菜',
        description: '稍微有些内向的普通女孩子，小学、中学、高中都不太引人注意，成绩也很普通。没有什么特别的梦想，观察周遭的气氛，配合着大家而生活。\n\n喜欢的食物是浸物、牛奶咖啡和酸奶；兴趣是昭和、佛像和收集御朱印。\n\n拥有如此古旧兴趣的原因似乎是源自奶奶。',
        personality_preset: 'energetic',
        personality_data: JSON.stringify({
          energy: 95,
          friendliness: 80,
          humor: 75,
          professionalism: 50,
          creativity: 80,
          empathy: 70
        }),
        examples: '[]',
        is_public: 0,
        use_real_time: 1,
        time_setting: 'afternoon',
        current_mood: 'calm',
        has_mission: 0
      };

      stmt.run([
        correctData.id,
        correctData.name,
        correctData.description,
        correctData.personality_preset,
        correctData.personality_data,
        correctData.examples,
        correctData.is_public,
        correctData.use_real_time,
        correctData.time_setting,
        correctData.current_mood,
        correctData.has_mission
      ], function(err) {
        if (err) {
          console.error('❌ 插入正确数据失败:', err);
        } else {
          console.log('✅ 成功插入正确的角色数据');

          // 验证修复结果
          db.get('SELECT name, description FROM characters WHERE id = 19', (err, row) => {
            if (err) {
              console.error('❌ 验证失败:', err);
            } else if (row) {
              console.log('✅ 修复后的数据:');
              console.log('Name:', row.name);
              console.log('Description:', row.description.substring(0, 50) + '...');

              // 检查Buffer
              console.log('Name Buffer:', Buffer.from(row.name, 'utf8'));

              // 尝试使用toString
              console.log('Name toString:', row.name.toString('utf8'));
            }

            stmt.finalize();
            db.close();
          });
        }
      });
    });
  });
});