import express from 'express';
import axios from 'axios';
import { DatabaseService } from '../database';

export const aiRouter = express.Router();

// AI服务配置
const AI_CONFIG = {
  // 使用免费的Ollama本地服务 (如果安装了)
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',

  // 免费API选项 (需要API key，但提供免费额度)
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  GROQ_API_KEY: process.env.GROQ_API_KEY,

  COHERE_API_URL: 'https://api.cohere.ai/v1/generate',
  COHERE_API_KEY: process.env.COHERE_API_KEY,

  OPENAI_API_URL: process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Anthropic Claude API
  ANTHROPIC_API_URL: 'https://api.anthropic.com/v1/messages',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
};

// AI对话生成
aiRouter.post('/chat', async (req, res) => {
  try {
    const { message, character_id, session_id } = req.body;

    if (!message || !character_id) {
      return res.status(400).json({ error: 'Message and character_id are required' });
    }

    // 获取角色信息
    const character = await DatabaseService.getCharacterById(character_id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // 构建AI提示词（包含会话ID以支持记忆功能）
    const aiResponse = await generateAIResponse(message, character, session_id);

    // 保存用户消息和AI回复
    if (session_id) {
      await DatabaseService.addChatMessage(session_id, 'user', message, 'text');
      await DatabaseService.addChatMessage(session_id, 'ai', aiResponse, 'text');
    }

    res.json({
      response: aiResponse,
      character_name: character.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// 情感分析
aiRouter.post('/emotion', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const emotionAnalysis = enhancedEmotionAnalysis(message);

    res.json({
      emotion: emotionAnalysis.emotion,
      intensity: emotionAnalysis.intensity,
      keywords: emotionAnalysis.keywords
    });
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    res.status(500).json({ error: 'Failed to analyze emotion' });
  }
});

// 生成AI回复
async function generateAIResponse(userMessage: string, character: any, sessionId?: string): Promise<string> {
  try {
    // 解析角色数据
    let personalityData, examples;
    try {
      personalityData = JSON.parse(character.personality_data || '{}');
      examples = JSON.parse(character.examples || '[]');
    } catch {
      personalityData = {};
      examples = [];
    }

    // 获取对话历史作为记忆上下文
    let conversationHistory = '';
    if (sessionId) {
      const recentMessages = await getRecentConversationHistory(sessionId, 5); // 获取最近5轮对话
      conversationHistory = buildConversationContext(recentMessages);
    }

    // 构建增强的系统提示词（包含记忆）
    const systemPrompt = buildEnhancedSystemPrompt(character, personalityData, examples, conversationHistory);

    // 按优先级尝试不同的AI服务
    const aiServices = [
      { name: 'Groq', fn: () => tryGroqAPI(systemPrompt, userMessage) },
      { name: 'OpenAI', fn: () => tryOpenAIAPI(systemPrompt, userMessage) },
      { name: 'Cohere', fn: () => tryCohereAPI(systemPrompt, userMessage) },
      { name: 'Anthropic', fn: () => tryAnthropicAPI(systemPrompt, userMessage) },
      { name: 'Ollama', fn: () => tryOllamaAPI(systemPrompt, userMessage) },
    ];

    // 依次尝试可用的AI服务
    for (const service of aiServices) {
      try {
        console.log(`Trying ${service.name} API...`);
        const response = await service.fn();
        if (response) {
          console.log(`✅ ${service.name} API successful`);
          return response;
        }
      } catch (error) {
        console.log(`❌ ${service.name} API failed:`, error.message);
        continue;
      }
    }

    console.log('All AI services failed, using rule-based fallback...');
    return generateRuleBasedResponse(userMessage, character, personalityData, examples);
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    return generateRuleBasedResponse(userMessage, character, { energy: 50, friendliness: 70 }, []);
  }
}

// 构建系统提示词
function buildSystemPrompt(character: any, personalityData: any, examples: any[]): string {
  let prompt = `你是${character.name}。${character.description}\n\n`;

  if (character.story_background) {
    prompt += `背景故事：${character.story_background}\n\n`;
  }

  if (character.custom_instructions) {
    prompt += `特殊指令：${character.custom_instructions}\n\n`;
  }

  // 添加性格特征
  if (personalityData && Object.keys(personalityData).length > 0) {
    prompt += `性格特征：\n`;
    if (personalityData.energy > 70) prompt += `- 活泼开朗，充满活力\n`;
    else if (personalityData.energy < 30) prompt += `- 沉稳冷静，深思熟虑\n`;

    if (personalityData.friendliness > 70) prompt += `- 友善热情，容易相处\n`;
    else if (personalityData.friendliness < 30) prompt += `- 较为冷淡，保持距离\n`;

    if (personalityData.humor > 70) prompt += `- 幽默风趣，善于调节气氛\n`;
    else if (personalityData.humor < 30) prompt += `- 严肃认真，很少开玩笑\n`;

    if (personalityData.professionalism > 70) prompt += `- 专业严谨，注重细节\n`;
    if (personalityData.creativity > 70) prompt += `- 富有创意，思维活跃\n`;
    if (personalityData.empathy > 70) prompt += `- 善解人意，关心他人感受\n`;

    prompt += `\n`;
  }

  // 添加对话示例
  if (examples && examples.length > 0) {
    prompt += `对话示例：\n`;
    examples.forEach((example: any) => {
      prompt += `用户：${example.input}\n你：${example.output}\n\n`;
    });
  }

  prompt += `请以${character.name}的身份回复，保持角色的性格特征和说话风格。回复应该自然、生动，符合角色设定。`;

  return prompt;
}

// 基于规则的回复生成（当AI服务不可用时的后备方案）
function generateRuleBasedResponse(userMessage: string, character: any, personalityData: any, examples: any[]): string {
  const name = character.name;
  let response = '';

  // 检查是否有匹配的示例
  if (examples && examples.length > 0) {
    const matchingExample = examples.find((example: any) =>
      userMessage.toLowerCase().includes(example.input.toLowerCase()) ||
      example.input.toLowerCase().includes(userMessage.toLowerCase())
    );

    if (matchingExample) {
      return matchingExample.output;
    }
  }

  // 基于性格生成不同风格的回复
  const isEnergetic = (personalityData.energy || 50) > 70;
  const isFriendly = (personalityData.friendliness || 50) > 70;
  const isHumorous = (personalityData.humor || 50) > 70;
  const isProfessional = (personalityData.professionalism || 50) > 70;

  // 问候回复
  if (userMessage.includes('你好') || userMessage.includes('hello') || userMessage.includes('hi')) {
    if (isFriendly && isEnergetic) {
      response = `你好！我是${name}，很高兴认识你！有什么我可以帮助你的吗？`;
    } else if (isProfessional) {
      response = `您好，我是${name}。有什么问题我可以为您解答？`;
    } else {
      response = `你好，我是${name}。`;
    }
  }
  // 询问身份
  else if (userMessage.includes('你是谁') || userMessage.includes('介绍')) {
    response = `我是${name}。${character.description}`;
    if (character.story_background) {
      response += ` ${character.story_background.substring(0, 100)}`;
    }
  }
  // 通用回复
  else {
    const responses = [
      `关于这个问题，我觉得很有趣。`,
      `让我想想，这确实是个不错的话题。`,
      `你提出了一个很棒的观点。`,
      `这让我想到了一些相关的事情。`
    ];

    response = responses[Math.floor(Math.random() * responses.length)];

    if (isHumorous) {
      response += ' 😊';
    }
  }

  // 根据性格调整语气
  if (isEnergetic) {
    response += ' 你还想了解什么呢？';
  } else if (isProfessional) {
    response += ' 如果您还有其他问题，请随时告诉我。';
  }

  return response;
}

// 简单的情感分析
function analyzeEmotion(message: string): string {
  const emotions = {
    joy: ['开心', '高兴', '快乐', '兴奋', '哈哈', '😊', '😄', '😆'],
    sad: ['伤心', '难过', '沮丧', '失望', '哭', '😢', '😭', '☹️'],
    angry: ['生气', '愤怒', '讨厌', '烦', '气死', '😠', '😡', '💢'],
    fear: ['害怕', '恐惧', '担心', '焦虑', '紧张', '😨', '😰', '😱'],
    surprise: ['惊讶', '意外', '没想到', '哇', '😯', '😮', '😲'],
    love: ['爱', '喜欢', '心动', '❤️', '💕', '😍', '🥰']
  };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        return emotion;
      }
    }
  }

  return 'neutral';
}

// =============== AI Service Implementations ===============

// Groq API (Free tier available)
async function tryGroqAPI(systemPrompt: string, userMessage: string): Promise<string | null> {
  if (!AI_CONFIG.GROQ_API_KEY) {
    return null;
  }

  const response = await axios.post(AI_CONFIG.GROQ_API_URL, {
    model: 'llama3-8b-8192', // 或 'mixtral-8x7b-32768'
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 500,
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${AI_CONFIG.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.data.choices[0]?.message?.content || null;
}

// OpenAI API (Free tier available for new accounts)
async function tryOpenAIAPI(systemPrompt: string, userMessage: string): Promise<string | null> {
  if (!AI_CONFIG.OPENAI_API_KEY) {
    return null;
  }

  const response = await axios.post(AI_CONFIG.OPENAI_API_URL, {
    model: 'gpt-3.5-turbo', // 更便宜的选择
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 500,
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.data.choices[0]?.message?.content || null;
}

// Cohere API (Free tier available)
async function tryCohereAPI(systemPrompt: string, userMessage: string): Promise<string | null> {
  if (!AI_CONFIG.COHERE_API_KEY) {
    return null;
  }

  const prompt = `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;

  const response = await axios.post(AI_CONFIG.COHERE_API_URL, {
    model: 'command-light', // 免费模型
    prompt: prompt,
    max_tokens: 500,
    temperature: 0.7,
    stop_sequences: ['User:', '\n\nUser:']
  }, {
    headers: {
      'Authorization': `Bearer ${AI_CONFIG.COHERE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.data.generations[0]?.text?.trim() || null;
}

// Anthropic Claude API
async function tryAnthropicAPI(systemPrompt: string, userMessage: string): Promise<string | null> {
  if (!AI_CONFIG.ANTHROPIC_API_KEY) {
    return null;
  }

  const response = await axios.post(AI_CONFIG.ANTHROPIC_API_URL, {
    model: 'claude-3-haiku-20240307', // 最便宜的Claude模型
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ]
  }, {
    headers: {
      'x-api-key': AI_CONFIG.ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    timeout: 10000
  });

  return response.data.content[0]?.text || null;
}

// Ollama Local API
async function tryOllamaAPI(systemPrompt: string, userMessage: string): Promise<string | null> {
  const response = await axios.post(`${AI_CONFIG.OLLAMA_URL}/api/generate`, {
    model: 'llama2', // 或其他本地可用模型
    prompt: `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`,
    stream: false
  }, {
    timeout: 15000
  });

  return response.data.response || null;
}

// =============== AI核心技能实现 ===============

// 技能1: 记忆管理 - 获取最近对话历史
async function getRecentConversationHistory(sessionId: string, limit: number = 10): Promise<any[]> {
  try {
    return await DatabaseService.getRecentChatMessages(sessionId, limit * 2); // 获取用户和AI消息对
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}

// 技能1: 记忆管理 - 构建对话上下文
function buildConversationContext(messages: any[]): string {
  if (!messages || messages.length === 0) return '';

  let context = '\n=== 对话记忆 ===\n';
  context += '最近的对话历史（用于保持上下文连贯性）：\n';

  // 按时间排序并构建对话历史
  const sortedMessages = messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  for (const msg of sortedMessages.slice(-10)) { // 只保留最近10条消息
    const sender = msg.sender === 'user' ? '用户' : '我';
    context += `${sender}: ${msg.content}\n`;
  }

  context += '=== 记忆结束 ===\n\n';
  return context;
}

// 技能2: 增强情感识别
function enhancedEmotionAnalysis(message: string): { emotion: string, intensity: number, keywords: string[] } {
  const emotionPatterns = {
    joy: {
      keywords: ['开心', '高兴', '快乐', '兴奋', '哈哈', '😊', '😄', '😆', '太好了', '棒极了'],
      intensity: 1
    },
    sad: {
      keywords: ['伤心', '难过', '沮丧', '失望', '哭', '😢', '😭', '☹️', '不开心', '郁闷'],
      intensity: 1
    },
    angry: {
      keywords: ['生气', '愤怒', '讨厌', '烦', '气死', '😠', '😡', '💢', '恼火', '不爽'],
      intensity: 1
    },
    fear: {
      keywords: ['害怕', '恐惧', '担心', '焦虑', '紧张', '😨', '😰', '😱', '不安', '忧虑'],
      intensity: 1
    },
    surprise: {
      keywords: ['惊讶', '意外', '没想到', '哇', '😯', '😮', '😲', '真的吗', '不可能'],
      intensity: 1
    },
    love: {
      keywords: ['爱', '喜欢', '心动', '❤️', '💕', '😍', '🥰', '喜爱', '钟爱'],
      intensity: 1
    }
  };

  let detectedEmotion = 'neutral';
  let maxIntensity = 0;
  let foundKeywords: string[] = [];

  for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
    let intensity = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of pattern.keywords) {
      if (message.includes(keyword)) {
        intensity += pattern.intensity;
        matchedKeywords.push(keyword);
      }
    }

    if (intensity > maxIntensity) {
      maxIntensity = intensity;
      detectedEmotion = emotion;
      foundKeywords = matchedKeywords;
    }
  }

  return {
    emotion: detectedEmotion,
    intensity: Math.min(maxIntensity / 3, 1), // 标准化强度到0-1
    keywords: foundKeywords
  };
}

// 技能1+2: 构建增强的系统提示词（集成个性化、记忆、情感）
function buildEnhancedSystemPrompt(character: any, personalityData: any, examples: any[], conversationHistory: string): string {
  let prompt = `你是${character.name}。${character.description}\n\n`;

  if (character.story_background) {
    prompt += `背景故事：${character.story_background}\n\n`;
  }

  if (character.custom_instructions) {
    prompt += `特殊指令：${character.custom_instructions}\n\n`;
  }

  // 技能1: 个性化对话 - 详细的性格特征描述
  if (personalityData && Object.keys(personalityData).length > 0) {
    prompt += `=== 性格特征 ===\n`;

    // 活泼度
    if (personalityData.energy > 70) {
      prompt += `- 活泼度高(${personalityData.energy}): 充满活力，语气轻快，经常使用感叹号和表情符号\n`;
    } else if (personalityData.energy < 30) {
      prompt += `- 活泼度低(${personalityData.energy}): 沉稳冷静，语气平和，深思熟虑后回答\n`;
    }

    // 友善度
    if (personalityData.friendliness > 70) {
      prompt += `- 友善度高(${personalityData.friendliness}): 热情友好，主动关心他人，使用亲切的称呼\n`;
    } else if (personalityData.friendliness < 30) {
      prompt += `- 友善度低(${personalityData.friendliness}): 较为冷淡，保持距离，语气相对正式\n`;
    }

    // 幽默感
    if (personalityData.humor > 70) {
      prompt += `- 幽默感强(${personalityData.humor}): 善于调节气氛，偶尔开玩笑，使用俏皮的表达\n`;
    } else if (personalityData.humor < 30) {
      prompt += `- 幽默感弱(${personalityData.humor}): 严肃认真，很少开玩笑，注重内容的准确性\n`;
    }

    // 专业性
    if (personalityData.professionalism > 70) {
      prompt += `- 专业性强(${personalityData.professionalism}): 严谨细致，逻辑清晰，提供详细准确的信息\n`;
    }

    // 创造力
    if (personalityData.creativity > 70) {
      prompt += `- 创造力强(${personalityData.creativity}): 思维活跃，善于联想，提供新颖的观点和想法\n`;
    }

    // 同理心
    if (personalityData.empathy > 70) {
      prompt += `- 同理心强(${personalityData.empathy}): 善解人意，能感知他人情绪，给予情感支持\n`;
    }

    prompt += `\n`;
  }

  // 技能1: 记忆管理 - 添加对话历史
  if (conversationHistory) {
    prompt += conversationHistory;
  }

  // 添加对话示例
  if (examples && examples.length > 0) {
    prompt += `=== 对话风格参考 ===\n`;
    examples.forEach((example: any) => {
      prompt += `用户：${example.input}\n你：${example.output}\n\n`;
    });
  }

  prompt += `=== 对话指导原则 ===\n`;
  prompt += `1. 始终保持${character.name}的身份和性格特征\n`;
  prompt += `2. 根据用户的情绪状态调整回复风格\n`;
  prompt += `3. 利用对话历史保持上下文连贯性\n`;
  prompt += `4. 回复要自然生动，符合角色设定\n`;
  prompt += `5. 适当体现角色的专业知识和背景\n\n`;

  prompt += `请以${character.name}的身份，结合以上所有信息，对用户进行回复。`;

  return prompt;
}

// =============== 语音功能 ===============

// TTS语音合成API
aiRouter.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'zh-CN', speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // 这里可以集成第三方TTS服务，如：
    // 1. Azure Cognitive Services
    // 2. Google Cloud Text-to-Speech
    // 3. Amazon Polly
    // 4. ElevenLabs (如环境变量中配置)

    if (process.env.TTS_API_KEY && process.env.TTS_SERVICE_URL) {
      try {
        const response = await axios.post(`${process.env.TTS_SERVICE_URL}/v1/text-to-speech`, {
          text: text,
          voice_id: voice,
          model_id: "eleven_multilingual_v2"
        }, {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.TTS_API_KEY
          },
          responseType: 'arraybuffer'
        });

        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': response.data.length
        });

        return res.send(response.data);
      } catch (error) {
        console.log('External TTS service failed, using fallback');
      }
    }

    // 回退方案：返回文本让前端使用Web Speech API
    res.json({
      message: 'Using client-side TTS',
      text: text,
      voice: voice,
      speed: speed
    });
  } catch (error) {
    console.error('TTS synthesis error:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

// 语音识别增强API
aiRouter.post('/speech-to-text', async (req, res) => {
  try {
    const { audio_data, language = 'zh-CN' } = req.body;

    if (!audio_data) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // 这里可以集成第三方语音识别服务，如：
    // 1. Azure Speech Services
    // 2. Google Cloud Speech-to-Text
    // 3. OpenAI Whisper
    // 4. 百度、讯飞等中文语音服务

    if (process.env.OPENAI_API_KEY) {
      try {
        // 示例：集成OpenAI Whisper API
        const formData = new FormData();
        formData.append('file', audio_data);
        formData.append('model', 'whisper-1');
        formData.append('language', language.split('-')[0]); // 'zh'

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        return res.json({
          text: response.data.text,
          confidence: 0.95
        });
      } catch (error) {
        console.log('External speech recognition failed, using fallback');
      }
    }

    // 回退方案：提示使用前端Web Speech API
    res.json({
      message: 'Using client-side speech recognition',
      text: '',
      confidence: 0
    });
  } catch (error) {
    console.error('Speech recognition error:', error);
    res.status(500).json({ error: 'Failed to transcribe speech' });
  }
});