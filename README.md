# ⚠️ 开发前请务必详读DEPLOYMENT.md！！！

# 🎭 AI Character Roleplay Website

一个功能完整的AI角色扮演平台，用户可以通过语音和文本与AI角色进行互动。基于现代Web技术构建，支持多种AI提供商集成。

## 📋 项目概述

**AI角色扮演平台**是一个全栈Web应用，提供：
- 🤖 **智能角色创建** - 6维个性系统，支持自定义角色背景
- 💬 **实时聊天** - WebSocket支持，类似微信的聊天界面
- 🎙️ **语音交互** - 语音识别和文本转语音功能
- 🔄 **多AI提供商** - 支持Groq、OpenAI、Cohere、Anthropic、Ollama
- 📱 **响应式设计** - 完美支持桌面和移动设备
- 🔒 **安全可靠** - 完整的输入验证和安全防护

![项目状态](https://img.shields.io/badge/状态-生产就绪-green)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Vue](https://img.shields.io/badge/Vue-3.x-green)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)
![中文支持](https://img.shields.io/badge/中文-完全支持-red)


## 🌟 **核心功能**

### 🏠 **主页**
- 浏览预设角色（哈利波特、苏格拉底、爱因斯坦等）
- 按个性特征搜索和筛选角色
- 快速访问聊天历史和角色创建

### 👤 **高级角色创建**
- **6维个性系统**: 能量、友好度、幽默感、专业性、创造力、同理心
- **交互式雷达图**: 实时个性可视化
- **角色背景**: 故事背景、自定义指令、示例对话
- **头像上传**: 支持自定义角色图片
- **个性预设**: 快速模板（友好型、专业型、神秘型等）

### 💬 **智能聊天界面**
- **实时消息** 支持WebSocket
- **语音输入/输出** 支持按住说话录音
- **角色一致性回复** 基于个性配置文件
- **聊天历史持久化** 支持跨会话
- **移动端响应式** 类似微信的UI设计

### 🤖 **多提供商AI集成**
- **5种AI提供商**: Groq、OpenAI、Cohere、Anthropic、Ollama
- **智能回退机制**: 自动在提供商之间切换
- **基于规则的备用方案**: 无需API密钥即可工作
- **成本优化**: 使用多个服务的免费额度

### 🎙️ **语音功能**
- **语音识别**: Web Speech API + 可选云服务
- **文本转语音**: 浏览器合成 + 高级语音选项
- **语音录制**: 按住录音带视觉反馈
- **多语言支持**: 优化支持中文和英文

### 🧠 **3大核心AI技能**
1. **个性化对话**: 响应根据角色个性调整
2. **情感识别**: 检测用户情绪并相应回应
3. **记忆管理**: 维护对话上下文和历史

## 🚀 **快速开始**

### **环境要求**
- Node.js 16+
- npm 或 yarn

### **安装步骤**
```bash
# 克隆仓库
git clone <your-repository-url>
cd QiNiuYun

# 安装所有依赖
npm run install:all

# 启动开发服务器
# 新建两个终端，分别输入：
cd client
npm run dev
cd server
npm run dev
```

### **访问地址**
- **前端**: http://localhost:3000
- **后端API**: http://localhost:8080
- **聊天WebSocket**: ws://localhost:8080

## 🛠️ **技术栈**

### **前端**
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全和更好的开发体验
- **Vite** - 快速构建工具和开发服务器
- **TailwindCSS** - 实用优先的CSS框架
- **DaisyUI** - 美观的UI组件
- **Pinia** - Vue状态管理

### **后端**
- **Node.js + Express** - 服务器运行时和框架
- **TypeScript** - 全栈类型安全
- **SQLite** - 嵌入式数据库（生产就绪）
- **WebSocket** - 实时通信
- **Multer** - 文件上传处理

### **AI & 语音服务**
- **Groq API** - 快速LLM推理
- **OpenAI API** - GPT模型 + Whisper语音
- **Cohere API** - 命令语言模型
- **Anthropic Claude** - 宪法AI
- **Ollama** - 本地LLM支持
- **Web Speech API** - 浏览器原生语音功能

## 📁 **项目结构**

```
QiNiuYun/
├── client/                 # Vue.js 前端
│   ├── src/
│   │   ├── components/     # 可复用UI组件
│   │   ├── views/         # 页面组件（主页、聊天等）
│   │   ├── stores/        # Pinia状态管理
│   │   └── utils/         # 工具函数
│   └── dist/              # 构建的前端（生产环境）
├── server/                # Node.js 后端
│   ├── src/
│   │   ├── routes/        # API端点
│   │   ├── database/      # SQLite数据库逻辑
│   │   └── index.ts       # 服务器入口点
│   ├── database.db        # SQLite数据库文件
│   └── uploads/           # 用户上传文件
├── Front-end-design/      # 原始UI设计稿
├── DEPLOYMENT.md          # 生产部署指南
└── README.md              # 本文件
```

## ⚙️ **配置**

### **环境变量**
复制 `server/.env.example` 到 `server/.env` 并配置：

```env
# 必需配置
PORT=8080
NODE_ENV=development

# 可选AI API密钥（启用高级功能）
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here
COHERE_API_KEY=your_cohere_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# 可选语音服务
TTS_API_KEY=your_elevenlabs_key_here
TTS_SERVICE_URL=https://api.elevenlabs.io
```

### **免费API设置**（可选但推荐）
1. **Groq**: https://console.groq.com/ - 最快的推理速度
2. **OpenAI**: https://platform.openai.com/ - 最强大的模型
3. **Cohere**: https://dashboard.cohere.com/ - 优秀的对话能力
4. **Anthropic**: https://console.anthropic.com/ 

**注意**: 即使没有任何API密钥，应用也能通过内置的回退系统完美工作！

## 🧪 **测试**

### **手动测试**
```bash
# 启动开发服务器
# 新建两个终端，分别输入：
cd client
npm run dev
cd server
npm run dev

# 在浏览器中测试
# 1. 创建新角色
# 2. 开始聊天对话
# 3. 尝试语音录制（允许麦克风访问）
# 4. 测试基于个性的回复
```

### **API测试**
```bash
# 测试角色API
curl http://localhost:8080/api/characters

# 测试AI聊天
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"character_id":1,"message":"你好！","session_id":"test"}'

# 测试情感识别
curl -X POST http://localhost:8080/api/ai/emotion \
  -H "Content-Type: application/json" \
  -d '{"message":"我今天很开心！"}'
```

## 🎯 **核心特性演示**

### **1. 角色个性系统**
```javascript
// 6维个性影响所有回复
const personality = {
  energy: 85,        // 高能量 = 热情洋溢的回复
  friendliness: 90,  // 高友好度 = 温暖、欢迎
  humor: 70,         // 中等幽默 = 偶尔开玩笑
  professionalism: 50, // 平衡的休闲/专业
  creativity: 80,    // 高创造力 = 创新想法
  empathy: 95        // 高同理心 = 情感支持
}
```

### **2. 多提供商AI回退机制**
```javascript
// 按顺序尝试提供商直到成功
const providers = [
  'Groq (最快)',
  'OpenAI (最智能)',
  'Cohere (对话)',
  'Anthropic (安全)',
  'Ollama (本地)',
  '基于规则 (始终工作)'
]
```

### **3. 语音集成**
```javascript
// 语音识别 + 合成
const voiceFeatures = {
  speechRecognition: 'Web Speech API + Whisper',
  textToSpeech: '浏览器合成 + ElevenLabs',
  realTimeRecording: '按住说话UI',
  multiLanguage: '中文 + 英文优化'
}
```

## 📊 **性能指标**

- **前端包大小**: ~200KB 压缩后
- **后端内存**: ~50MB 基础使用量
- **数据库**: SQLite轻松处理10k+角色
- **AI响应时间**: 1-5秒（因提供商而异）
- **语音延迟**: 使用Web API接近实时

## 🔐 **安全特性**

- **输入验证**: 所有用户输入都经过清理
- **SQL注入防护**: 参数化查询
- **XSS防护**: 内容安全策略头
- **速率限制**: API端点保护
- **文件上传安全**: 类型和大小验证

## 🌐 **浏览器支持**

- **Chrome/Edge**: 完整功能包括语音
- **Firefox**: 完整功能包括语音
- **Safari**: 完整功能（语音可能需要HTTPS）
- **移动端**: 响应式设计，触摸优化

## 📈 **开发路线图**

### **第一阶段** ✅ (已完成)
- [x] 带个性系统的角色创建
- [x] 多提供商AI聊天
- [x] 语音输入/输出功能
- [x] 实时消息界面
- [x] 数据库持久化

### **第二阶段** (未来增强)
- [ ] 用户认证和账户系统
- [ ] 角色分享市场
- [ ] 群组对话
- [ ] 高级语音克隆
- [ ] 移动应用 (React Native)

### **第三阶段** (高级功能)
- [ ] 角色图像生成 (AI艺术)
- [ ] 多语言界面
- [ ] 自定义AI提供商的插件系统
- [ ] 高级分析和洞察

