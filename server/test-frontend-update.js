const axios = require('axios');

async function testCharacterUpdate() {
  console.log('模拟前端角色更新请求...');

  // 模拟前端发送的数据格式
  const characterData = {
    name: "测试更新角色",
    description: "测试角色更新功能的描述",
    personality_preset: "friendly",
    custom_instructions: "",
    story_world: "",
    character_background: "",
    has_mission: false,
    current_mission: "",
    current_mood: "calm",
    time_setting: "morning",
    use_real_time: true,
    is_public: false,
    personality_data: {
      energy: 50,
      friendliness: 50,
      humor: 50,
      professionalism: 50,
      creativity: 50,
      empathy: 50
    },
    examples: []
  };

  try {
    console.log('发送PUT请求到 /api/characters/19...');
    console.log('请求数据:', JSON.stringify(characterData, null, 2));

    const response = await axios.put('http://localhost:8080/api/characters/19', characterData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000
    });

    console.log('\n✅ 请求成功!');
    console.log('状态码:', response.status);
    console.log('响应头:', response.headers);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));

    // 检查响应数据的字符编码
    if (response.data.name) {
      console.log('\n字符编码检查:');
      console.log('Name 字段:', response.data.name);
      console.log('Name Buffer:', Buffer.from(response.data.name, 'utf8'));
      console.log('Name length:', response.data.name.length);
    }

  } catch (error) {
    console.log('\n❌ 请求失败!');

    if (error.response) {
      console.log('错误状态码:', error.response.status);
      console.log('错误响应:', error.response.data);
      console.log('错误响应头:', error.response.headers);
    } else if (error.request) {
      console.log('网络错误:', error.message);
    } else {
      console.log('配置错误:', error.message);
    }

    console.log('完整错误:', error);
  }
}

testCharacterUpdate();