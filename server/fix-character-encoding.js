const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

console.log('开始修复字符编码问题...');

// 创建数据库连接，确保UTF-8编码
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    return;
  }

  console.log('✅ 数据库连接成功');

  db.serialize(() => {
    // 1. 确保数据库使用UTF-8编码
    db.exec("PRAGMA encoding = 'UTF-8'", (err) => {
      if (err) {
        console.error('❌ 设置编码失败:', err);
      } else {
        console.log('✅ 数据库编码设置为UTF-8');
      }
    });

    // 2. 备份并清理损坏的数据
    console.log('清理损坏的角色数据...');

    db.run('DELETE FROM characters WHERE id = 19', (err) => {
      if (err) {
        console.error('❌ 删除损坏数据失败:', err);
        return;
      }

      console.log('✅ 已删除损坏的角色数据');

      // 3. 使用prepared statement插入正确的UTF-8数据
      const stmt = db.prepare(`
        INSERT INTO characters (
          id, name, description, personality_preset, personality_data,
          examples, is_public, use_real_time, time_setting, current_mood,
          has_mission, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      // 正确的UTF-8字符数据
      const correctCharacterData = {
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

      // 确保字符串是正确的UTF-8编码
      const name = Buffer.from(correctCharacterData.name, 'utf8').toString('utf8');
      const description = Buffer.from(correctCharacterData.description, 'utf8').toString('utf8');

      console.log('插入角色数据:');
      console.log('Name:', name);
      console.log('Name Buffer:', Buffer.from(name, 'utf8'));

      stmt.run([
        correctCharacterData.id,
        name,
        description,
        correctCharacterData.personality_preset,
        correctCharacterData.personality_data,
        correctCharacterData.examples,
        correctCharacterData.is_public,
        correctCharacterData.use_real_time,
        correctCharacterData.time_setting,
        correctCharacterData.current_mood,
        correctCharacterData.has_mission
      ], function(err) {
        if (err) {
          console.error('❌ 插入角色数据失败:', err);
        } else {
          console.log('✅ 角色数据插入成功');

          // 4. 验证插入的数据
          db.get('SELECT id, name, description FROM characters WHERE id = 19', (err, row) => {
            if (err) {
              console.error('❌ 验证失败:', err);
            } else if (row) {
              console.log('\n验证结果:');
              console.log('ID:', row.id);
              console.log('Name:', row.name);
              console.log('Name Buffer:', Buffer.from(row.name, 'utf8'));
              console.log('Description (前50字符):', row.description.substring(0, 50) + '...');

              // 测试JSON序列化
              const jsonResult = JSON.stringify(row);
              console.log('\nJSON序列化测试:');
              console.log('JSON字符串:', jsonResult);

              const parsedResult = JSON.parse(jsonResult);
              console.log('解析后的name:', parsedResult.name);
              console.log('解析后的Buffer:', Buffer.from(parsedResult.name, 'utf8'));
            } else {
              console.log('❌ 未找到插入的数据');
            }

            stmt.finalize();
            db.close((err) => {
              if (err) {
                console.error('❌ 关闭数据库失败:', err);
              } else {
                console.log('✅ 数据库连接已关闭');
                console.log('\n字符编码修复完成！');
              }
            });
          });
        }
      });
    });
  });
});