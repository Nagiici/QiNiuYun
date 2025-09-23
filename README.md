# AI角色扮演聊天应用

一个支持多角色AI聊天的现代化Web应用，具备实时通信、语音合成和丰富的角色扮演体验。

## 功能特性

### 🎭 多样化AI角色
- **艾琳娜骑士** - 勇敢的王国守护者，经历过龙之战役
- **李晓明** - 城市咖啡师，音乐爱好者，生活导师
- **赛博-7号** - 外星AI外交官，研究人类文明
- **梅林法师** - 古老的智慧法师，掌握神秘魔法

### 💬 实时聊天功能
- WebSocket实时通信
- 消息历史记录
- 打字状态指示器
- 自动重连机制

### 🎤 语音合成(TTS)
- 根据角色特性调整语音参数
- 支持中文语音合成
- 一键朗读AI回复

### 🎨 现代化界面
- 响应式设计，支持移动端
- 渐变背景和毛玻璃效果
- 平滑动画和过渡效果
- 直观的角色选择界面

## 技术栈

### 后端
- **FastAPI** - 现代Python Web框架
- **WebSocket** - 实时双向通信
- **Uvicorn** - ASGI服务器
- **Pydantic** - 数据验证和序列化

### 前端
- **React 18** - 现代用户界面库
- **styled-components** - CSS-in-JS样式方案
- **Lucide React** - 现代图标库
- **Web Speech API** - 浏览器语音合成

## 快速开始

### 环境要求
- Python 3.9+
- Node.js 16+
- npm 或 yarn

### 1. 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
python main.py
```

后端服务将在 `http://localhost:8000` 启动

### 2. 前端设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端应用将在 `http://localhost:3000` 启动

## 项目结构

```
├── backend/
│   ├── main.py              # FastAPI主应用
│   └── requirements.txt     # Python依赖
├── frontend/
│   ├── src/
│   │   ├── App.js          # 主应用组件
│   │   ├── index.js        # 应用入口
│   │   └── index.css       # 全局样式
│   ├── public/
│   │   └── index.html      # HTML模板
│   └── package.json        # 前端依赖配置
└── README.md               # 项目说明
```

## API接口

### WebSocket端点
- `ws://localhost:8000/ws/{user_id}` - 建立WebSocket连接

### 消息格式

#### 发送聊天消息
```json
{
  "type": "chat_message",
  "message": "你好",
  "character_id": "elena_knight"
}
```

#### 获取角色列表
```json
{
  "type": "get_characters"
}
```

#### AI回复格式
```json
{
  "type": "ai_response",
  "message": "作为王国的守护者，我很高兴与你交谈！",
  "character_id": "elena_knight",
  "character_name": "艾琳娜骑士",
  "timestamp": "2024-01-20T10:30:00"
}
```

## 角色设计

每个AI角色都有独特的：
- **个性特征** - 勇敢、智慧、幽默等
- **说话风格** - 正式、随意、古典等
- **背景故事** - 丰富的角色背景
- **互动特色** - 专属的对话主题

## 扩展功能

### 添加新角色
在 `backend/main.py` 的 `CHARACTERS` 字典中添加新角色：

```python
"new_character": {
    "name": "角色名称",
    "description": "角色描述",
    "personality": "个性特征",
    "style": "说话风格",
    "background": "背景故事",
    "prompt_template": "AI提示模板"
}
```

### 集成真实AI模型
修改 `get_ai_response` 函数，接入OpenAI、Claude等真实AI服务：

```python
import openai

async def get_ai_response(character_id: str, user_message: str, conversation_history: List[dict] = None):
    character = CHARACTERS[character_id]

    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": character["prompt_template"]},
            {"role": "user", "content": user_message}
        ]
    )

    return response.choices[0].message.content
```

## 部署说明

### 生产环境部署
1. 设置环境变量
2. 配置反向代理(Nginx)
3. 使用进程管理器(PM2/Supervisor)
4. 配置HTTPS和域名

### Docker部署
```dockerfile
# 后端Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 常见问题

### WebSocket连接失败
- 检查后端服务是否正常运行
- 确认防火墙设置
- 验证URL地址是否正确

### 语音合成不工作
- 确保浏览器支持Web Speech API
- 检查浏览器权限设置
- 尝试HTTPS环境

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请创建Issue或联系开发团队。