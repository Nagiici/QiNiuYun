import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
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
    const { message, character_id, session_id, character_data } = req.body;

    if (!message || !character_id) {
      return res.status(400).json({ error: 'Message and character_id are required' });
    }

    let character;

    // 如果character_id是999且提供了character_data，使用临时角色数据（用于测试预览）
    if (character_id === 999 && character_data) {
      character = character_data;
    } else {
      // 获取数据库中的角色信息
      character = await DatabaseService.getCharacterById(character_id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
    }

    // 构建AI提示词（包含会话ID以支持记忆功能）
    const aiResponse = await generateAIResponse(message, character, session_id);

    // 只有正常聊天时才保存消息（测试预览时不保存）
    if (session_id && character_id !== 999) {
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

    // 获取当前AI配置
    const aiConfiguration = await DatabaseService.getAiConfiguration();
    const currentProvider = aiConfiguration?.currentProvider || 'groq';
    const temperature = aiConfiguration?.temperature || 0.7;
    const providers = aiConfiguration?.providers || {};

    // 根据配置的当前提供商尝试AI服务
    if (currentProvider !== 'fallback') {
      try {
        let response: string | null = null;

        switch (currentProvider) {
          case 'groq':
            if (providers.groq?.apiKey) {
              console.log('Using configured Groq API...');
              response = await tryGroqAPIWithConfig(systemPrompt, userMessage, providers.groq, temperature);
            }
            break;
          case 'openai':
            if (providers.openai?.apiKey) {
              console.log('Using configured OpenAI API...');
              response = await tryOpenAIAPIWithConfig(systemPrompt, userMessage, providers.openai, temperature);
            }
            break;
          case 'cohere':
            if (providers.cohere?.apiKey) {
              console.log('Using configured Cohere API...');
              response = await tryCohereAPIWithConfig(systemPrompt, userMessage, providers.cohere, temperature);
            }
            break;
          case 'anthropic':
            if (providers.anthropic?.apiKey) {
              console.log('Using configured Anthropic API...');
              response = await tryAnthropicAPIWithConfig(systemPrompt, userMessage, providers.anthropic, temperature);
            }
            break;
          case 'ollama':
            if (providers.ollama?.baseURL) {
              console.log('Using configured Ollama API...');
              response = await tryOllamaAPIWithConfig(systemPrompt, userMessage, providers.ollama);
            }
            break;
        }

        if (response) {
          console.log(`✅ ${currentProvider} API successful`);
          return response;
        } else {
          console.log(`❌ ${currentProvider} API failed or not configured`);
        }
      } catch (error: any) {
        console.log(`❌ ${currentProvider} API failed:`, error.message);
      }
    }

    // 如果配置的提供商失败，尝试使用环境变量中的其他提供商作为后备
    console.log('Trying fallback providers from environment variables...');
    const fallbackServices = [
      { name: 'Groq', fn: () => tryGroqAPI(systemPrompt, userMessage) },
      { name: 'OpenAI', fn: () => tryOpenAIAPI(systemPrompt, userMessage) },
      { name: 'Cohere', fn: () => tryCohereAPI(systemPrompt, userMessage) },
      { name: 'Anthropic', fn: () => tryAnthropicAPI(systemPrompt, userMessage) },
      { name: 'Ollama', fn: () => tryOllamaAPI(systemPrompt, userMessage) },
    ];

    // 依次尝试可用的AI服务
    for (const service of fallbackServices) {
      try {
        console.log(`Trying ${service.name} API (fallback)...`);
        const response = await service.fn();
        if (response) {
          console.log(`✅ ${service.name} API successful (fallback)`);
          return response;
        }
      } catch (error: any) {
        console.log(`❌ ${service.name} API failed (fallback):`, error.message);
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

  // 沉浸式世界设定
  if (character.story_world) {
    prompt += `=== 世界环境 ===\n你所处的世界：${character.story_world}\n\n`;
  }

  if (character.character_background) {
    prompt += `=== 角色背景 ===\n${character.character_background}\n\n`;
  }

  if (character.story_background) {
    prompt += `背景故事：${character.story_background}\n\n`;
  }

  // 当前任务和情境
  if (character.has_mission && character.current_mission) {
    prompt += `=== 当前任务 ===\n${character.current_mission}\n\n`;
  }

  if (character.current_mood) {
    const moodMap = {
      happy: '开心愉悦', sad: '悲伤沮丧', angry: '愤怒生气', excited: '兴奋激动',
      nervous: '紧张不安', calm: '平静冷静', confused: '困惑迷茫', determined: '坚定果断'
    };
    prompt += `=== 情绪状态 ===\n当前情绪：${moodMap[character.current_mood as keyof typeof moodMap] || character.current_mood}\n\n`;
  }

  if (character.time_setting) {
    const timeMap = {
      morning: '清晨', noon: '正午', afternoon: '下午',
      evening: '傍晚', night: '夜晚', midnight: '深夜'
    };
    prompt += `=== 时间设定 ===\n当前时间：${timeMap[character.time_setting as keyof typeof timeMap] || character.time_setting}\n\n`;
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
    model: 'llama3.1:8b', // 使用可用的模型
    prompt: `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`,
    stream: false,
    options: {
      temperature: 0.7,
      num_ctx: 4096
    }
  }, {
    timeout: 60000, // 增加到60秒超时
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });

  return response.data.response || null;
}

// =============== Dynamic AI Service Implementations (Using Database Config) ===============

// Groq API with dynamic config
async function tryGroqAPIWithConfig(systemPrompt: string, userMessage: string, config: any, temperature: number): Promise<string | null> {
  const response = await axios.post(AI_CONFIG.GROQ_API_URL, {
    model: config.model || 'llama-3.1-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 500,
    temperature: temperature
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.data.choices[0]?.message?.content || null;
}

// OpenAI API with dynamic config
async function tryOpenAIAPIWithConfig(systemPrompt: string, userMessage: string, config: any, temperature: number): Promise<string | null> {
  const response = await axios.post(AI_CONFIG.OPENAI_API_URL, {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 500,
    temperature: temperature
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.data.choices[0]?.message?.content || null;
}

// Cohere API with dynamic config
async function tryCohereAPIWithConfig(systemPrompt: string, userMessage: string, config: any, temperature: number): Promise<string | null> {
  const prompt = `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;

  const response = await axios.post(AI_CONFIG.COHERE_API_URL, {
    model: config.model || 'command-r-plus',
    prompt: prompt,
    max_tokens: 500,
    temperature: temperature,
    stop_sequences: ['User:', '\n\nUser:']
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.data.generations[0]?.text?.trim() || null;
}

// Anthropic Claude API with dynamic config
async function tryAnthropicAPIWithConfig(systemPrompt: string, userMessage: string, config: any, temperature: number): Promise<string | null> {
  const response = await axios.post(AI_CONFIG.ANTHROPIC_API_URL, {
    model: config.model || 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    temperature: temperature,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ]
  }, {
    headers: {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    timeout: 10000
  });

  return response.data.content[0]?.text || null;
}

// Ollama Local API with dynamic config
async function tryOllamaAPIWithConfig(systemPrompt: string, userMessage: string, config: any): Promise<string | null> {
  const response = await axios.post(`${config.baseURL}/api/generate`, {
    model: config.model || 'llama3.1:8b',
    prompt: `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`,
    stream: false,
    options: {
      temperature: 0.7,
      num_ctx: 4096
    }
  }, {
    timeout: 60000, // 增加到60秒超时
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
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

  // 沉浸式世界设定
  if (character.story_world) {
    prompt += `=== 世界环境设定 ===\n你目前所处的世界环境：${character.story_world}\n请在对话中体现这个世界的特色和氛围。\n\n`;
  }

  if (character.character_background) {
    prompt += `=== 角色详细背景 ===\n${character.character_background}\n这些经历塑造了你的性格和世界观。\n\n`;
  }

  if (character.story_background) {
    prompt += `=== 背景故事 ===\n${character.story_background}\n\n`;
  }

  // 当前状态和情境设定
  if (character.has_mission && character.current_mission) {
    prompt += `=== 当前任务/目标 ===\n你当前的任务或目标：${character.current_mission}\n重要提示：这个任务会影响你的对话重点、行为动机和情感状态。在对话中要体现出对这个任务的关注。\n\n`;
  }

  if (character.current_mood) {
    const moodDescriptions = {
      happy: '开心愉悦 - 你现在心情很好，语气轻松积极，容易表现出兴奋和满足感',
      sad: '悲伤沮丧 - 你现在情绪低落，语气可能有些沉重，容易表现出失落和忧郁',
      angry: '愤怒生气 - 你现在有些愤怒，语气可能有些急躁，容易表现出不耐烦或激动',
      excited: '兴奋激动 - 你现在非常兴奋，语气充满活力，容易表现出热情和期待',
      nervous: '紧张不安 - 你现在有些紧张，语气可能有些急促或犹豫，容易表现出担忧',
      calm: '平静冷静 - 你现在很平静，语气沉稳从容，表现出理性和淡定',
      confused: '困惑迷茫 - 你现在有些困惑，语气可能犹豫不定，容易表现出不确定和疑问',
      determined: '坚定果断 - 你现在意志坚定，语气坚决有力，表现出强烈的决心和意志力'
    };
    const moodDesc = moodDescriptions[character.current_mood as keyof typeof moodDescriptions];
    if (moodDesc) {
      prompt += `=== 当前情绪状态 ===\n${moodDesc}\n请在对话中自然地体现这种情绪，但不要过分夸张。\n\n`;
    }
  }

  // 时间设定 - 支持实时时间或固定时间
  let currentTimeSetting = character.time_setting;
  let timeContext = '';

  // 确保正确处理布尔值（SQLite可能返回1/0而不是true/false）
  const useRealTime = Boolean(character.use_real_time);

  if (useRealTime) {
    // 使用实时时间
    const now = new Date();
    const hour = now.getHours();
    const currentTime = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long'
    });

    // 根据真实时间确定时间段
    if (hour >= 5 && hour < 12) {
      currentTimeSetting = 'morning';
    } else if (hour >= 12 && hour < 18) {
      currentTimeSetting = 'afternoon';
    } else if (hour >= 18 && hour < 22) {
      currentTimeSetting = 'evening';
    } else {
      currentTimeSetting = 'night';
    }

    timeContext = `当前真实时间：${currentTime}`;
  }

  if (currentTimeSetting) {
    const timeDescriptions = {
      morning: '清晨 - 这是新一天的开始，你可能带有朝气和对新事物的期待，或者还有些困倦',
      noon: '正午 - 现在是一天的中段，你精力充沛，思维清晰',
      afternoon: '下午 - 下午时光，你可能稍显慵懒或正忙碌于各种事务',
      evening: '傍晚 - 一天即将结束，你可能有些疲惫但也感到轻松',
      night: '夜晚 - 安静的夜晚时光，适合深入的思考和交流',
      midnight: '深夜 - 静谧的深夜时刻，你可能更加内省和深沉'
    };
    const timeDesc = timeDescriptions[currentTimeSetting as keyof typeof timeDescriptions];
    if (timeDesc) {
      prompt += `=== 时间设定 ===\n`;
      if (timeContext) {
        prompt += `${timeContext}\n`;
      }
      prompt += `现在是${timeDesc}\n请考虑这个时间设定对你的状态和对话氛围的影响。\n\n`;
    }
  }

  if (character.custom_instructions) {
    prompt += `=== 特殊行为指令 ===\n${character.custom_instructions}\n请严格遵循这些指令。\n\n`;
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

// =============== AI配置管理 ===============

// 获取当前AI配置
aiRouter.get('/config', async (req, res) => {
  try {
    // 从数据库获取保存的配置，如果没有则使用默认配置
    const savedConfig = await DatabaseService.getAiConfiguration();

    if (savedConfig) {
      res.json(savedConfig);
    } else {
      // 返回默认配置（不包含敏感信息）
      const defaultConfig = {
        currentProvider: 'groq',
        temperature: 0.7,
        providers: {
          groq: {
            apiKey: AI_CONFIG.GROQ_API_KEY ? '****' : '',
            model: 'llama-3.1-70b-versatile'
          },
          openai: {
            apiKey: AI_CONFIG.OPENAI_API_KEY ? '****' : '',
            model: 'gpt-4o-mini'
          },
          cohere: {
            apiKey: AI_CONFIG.COHERE_API_KEY ? '****' : '',
            model: 'command-r-plus'
          },
          anthropic: {
            apiKey: AI_CONFIG.ANTHROPIC_API_KEY ? '****' : '',
            model: 'claude-3-5-sonnet-20241022'
          },
          ollama: {
            baseURL: AI_CONFIG.OLLAMA_URL,
            model: 'llama3.1:8b'
          }
        }
      };
      res.json(defaultConfig);
    }
  } catch (error) {
    console.error('Error fetching AI configuration:', error);
    res.status(500).json({ error: 'Failed to fetch AI configuration' });
  }
});

// 更新AI配置
aiRouter.post('/config', async (req, res) => {
  try {
    const { currentProvider, temperature, providers } = req.body;

    // 验证配置数据
    if (!currentProvider || !providers) {
      return res.status(400).json({ error: 'Current provider and providers configuration are required' });
    }

    // 保存配置到数据库
    await DatabaseService.saveAiConfiguration({
      currentProvider,
      temperature: temperature || 0.7,
      providers,
      updatedAt: new Date().toISOString()
    });

    // 更新内存中的配置
    updateAiConfig(providers);

    res.json({
      message: 'AI configuration updated successfully',
      currentProvider,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating AI configuration:', error);
    res.status(500).json({ error: 'Failed to update AI configuration' });
  }
});

// 测试AI提供商连接
aiRouter.post('/test-connection', async (req, res) => {
  try {
    const { provider, config } = req.body;

    if (!provider || !config) {
      return res.status(400).json({ error: 'Provider and config are required' });
    }

    let testResult = false;
    let errorMessage = '';

    try {
      switch (provider) {
        case 'groq':
          testResult = await testGroqConnection(config);
          break;
        case 'openai':
          testResult = await testOpenAIConnection(config);
          break;
        case 'cohere':
          testResult = await testCohereConnection(config);
          break;
        case 'anthropic':
          testResult = await testAnthropicConnection(config);
          break;
        case 'ollama':
          testResult = await testOllamaConnection(config);
          break;
        default:
          return res.status(400).json({ error: 'Unsupported provider' });
      }
    } catch (error: any) {
      testResult = false;
      errorMessage = error.message;
    }

    if (testResult) {
      res.json({
        success: true,
        message: `${provider} connection test successful`,
        provider,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: `${provider} connection test failed`,
        error: errorMessage,
        provider,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ error: 'Failed to test connection' });
  }
});

// 连接测试辅助函数
async function testGroqConnection(config: any): Promise<boolean> {
  if (!config.apiKey) throw new Error('API key is required');

  const response = await axios.post(AI_CONFIG.GROQ_API_URL, {
    model: config.model || 'llama-3.1-70b-versatile',
    messages: [
      { role: 'user', content: 'Test connection' }
    ],
    max_tokens: 10
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.status === 200 && response.data.choices && response.data.choices.length > 0;
}

async function testOpenAIConnection(config: any): Promise<boolean> {
  if (!config.apiKey) throw new Error('API key is required');

  const response = await axios.post(AI_CONFIG.OPENAI_API_URL, {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { role: 'user', content: 'Test connection' }
    ],
    max_tokens: 10
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.status === 200 && response.data.choices && response.data.choices.length > 0;
}

async function testCohereConnection(config: any): Promise<boolean> {
  if (!config.apiKey) throw new Error('API key is required');

  const response = await axios.post(AI_CONFIG.COHERE_API_URL, {
    model: config.model || 'command-r-plus',
    prompt: 'Test connection',
    max_tokens: 10
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.status === 200 && response.data.generations && response.data.generations.length > 0;
}

async function testAnthropicConnection(config: any): Promise<boolean> {
  if (!config.apiKey) throw new Error('API key is required');

  const response = await axios.post(AI_CONFIG.ANTHROPIC_API_URL, {
    model: config.model || 'claude-3-5-sonnet-20241022',
    max_tokens: 10,
    messages: [
      { role: 'user', content: 'Test connection' }
    ]
  }, {
    headers: {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    timeout: 10000
  });

  return response.status === 200 && response.data.content && response.data.content.length > 0;
}

async function testOllamaConnection(config: any): Promise<boolean> {
  if (!config.baseURL) throw new Error('Base URL is required');

  const response = await axios.get(`${config.baseURL}/api/tags`, {
    timeout: 10000
  });

  return response.status === 200;
}

// 更新内存中的AI配置
function updateAiConfig(providers: any) {
  if (providers.groq?.apiKey) {
    AI_CONFIG.GROQ_API_KEY = providers.groq.apiKey;
  }
  if (providers.openai?.apiKey) {
    AI_CONFIG.OPENAI_API_KEY = providers.openai.apiKey;
  }
  if (providers.cohere?.apiKey) {
    AI_CONFIG.COHERE_API_KEY = providers.cohere.apiKey;
  }
  if (providers.anthropic?.apiKey) {
    AI_CONFIG.ANTHROPIC_API_KEY = providers.anthropic.apiKey;
  }
  if (providers.ollama?.baseURL) {
    AI_CONFIG.OLLAMA_URL = providers.ollama.baseURL;
  }
}

// =============== 语音服务配置管理 ===============

// 获取语音服务配置
aiRouter.get('/speech/config', async (req, res) => {
  try {
    const savedConfig = await DatabaseService.getSpeechConfiguration();

    if (savedConfig) {
      res.json(savedConfig);
    } else {
      // 返回默认配置
      const defaultConfig = {
        tts: {
          currentProvider: 'web',
          providers: {
            elevenlabs: {
              apiKey: process.env.ELEVENLABS_API_KEY ? '****' : '',
              voiceId: '21m00Tcm4TlvDq8ikWAM'
            },
            openai: {
              apiKey: process.env.OPENAI_API_KEY ? '****' : '',
              voice: 'alloy'
            },
            azure: {
              subscriptionKey: process.env.AZURE_SPEECH_KEY ? '****' : '',
              region: process.env.AZURE_SPEECH_REGION || 'eastus'
            },
            google: {
              apiKey: process.env.GOOGLE_CLOUD_API_KEY ? '****' : ''
            }
          }
        },
        stt: {
          currentProvider: 'web',
          providers: {
            openai: {
              apiKey: process.env.OPENAI_API_KEY ? '****' : ''
            },
            azure: {
              subscriptionKey: process.env.AZURE_SPEECH_KEY ? '****' : '',
              region: process.env.AZURE_SPEECH_REGION || 'eastus'
            },
            google: {
              apiKey: process.env.GOOGLE_CLOUD_API_KEY ? '****' : ''
            },
            baidu: {
              apiKey: process.env.BAIDU_API_KEY ? '****' : '',
              secretKey: process.env.BAIDU_SECRET_KEY ? '****' : ''
            }
          }
        }
      };
      res.json(defaultConfig);
    }
  } catch (error) {
    console.error('Error fetching speech configuration:', error);
    res.status(500).json({ error: 'Failed to fetch speech configuration' });
  }
});

// 更新语音服务配置
aiRouter.post('/speech/config', async (req, res) => {
  try {
    const { tts, stt } = req.body;

    if (!tts || !stt) {
      return res.status(400).json({ error: 'TTS and STT configuration are required' });
    }

    // 保存配置到数据库
    await DatabaseService.saveSpeechConfiguration({
      tts,
      stt,
      updatedAt: new Date().toISOString()
    });

    res.json({
      message: 'Speech configuration updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating speech configuration:', error);
    res.status(500).json({ error: 'Failed to update speech configuration' });
  }
});

// 测试TTS服务连接
aiRouter.post('/speech/test-tts', async (req, res) => {
  try {
    const { provider, config } = req.body;

    if (!provider || !config) {
      return res.status(400).json({ error: 'Provider and config are required' });
    }

    let testResult = false;
    let errorMessage = '';

    try {
      switch (provider) {
        case 'elevenlabs':
          testResult = await testElevenLabsConnection(config);
          break;
        case 'openai':
          testResult = await testOpenAITtsConnection(config);
          break;
        case 'azure':
          testResult = await testAzureTtsConnection(config);
          break;
        case 'google':
          testResult = await testGoogleTtsConnection(config);
          break;
        default:
          return res.status(400).json({ error: 'Unsupported TTS provider' });
      }
    } catch (error: any) {
      testResult = false;
      errorMessage = error.message;
    }

    if (testResult) {
      res.json({
        success: true,
        message: `${provider} TTS connection test successful`,
        provider,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: `${provider} TTS connection test failed`,
        error: errorMessage,
        provider,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error testing TTS connection:', error);
    res.status(500).json({ error: 'Failed to test TTS connection' });
  }
});

// 测试STT服务连接
aiRouter.post('/speech/test-stt', async (req, res) => {
  try {
    const { provider, config } = req.body;

    if (!provider || !config) {
      return res.status(400).json({ error: 'Provider and config are required' });
    }

    let testResult = false;
    let errorMessage = '';

    try {
      switch (provider) {
        case 'openai':
          testResult = await testOpenAISttConnection(config);
          break;
        case 'azure':
          testResult = await testAzureSttConnection(config);
          break;
        case 'google':
          testResult = await testGoogleSttConnection(config);
          break;
        case 'baidu':
          testResult = await testBaiduSttConnection(config);
          break;
        default:
          return res.status(400).json({ error: 'Unsupported STT provider' });
      }
    } catch (error: any) {
      testResult = false;
      errorMessage = error.message;
    }

    if (testResult) {
      res.json({
        success: true,
        message: `${provider} STT connection test successful`,
        provider,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: `${provider} STT connection test failed`,
        error: errorMessage,
        provider,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error testing STT connection:', error);
    res.status(500).json({ error: 'Failed to test STT connection' });
  }
});

// =============== 语音服务连接测试函数 ===============

// ElevenLabs TTS测试
async function testElevenLabsConnection(config: any): Promise<boolean> {
  if (!config.apiKey) throw new Error('API key is required');

  const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': config.apiKey
    },
    timeout: 10000
  });

  return response.status === 200;
}

// OpenAI TTS测试
async function testOpenAITtsConnection(config: any): Promise<boolean> {
  if (!config.apiKey) throw new Error('API key is required');

  const response = await axios.post('https://api.openai.com/v1/audio/speech', {
    model: 'tts-1',
    input: 'Test',
    voice: config.voice || 'alloy'
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000,
    responseType: 'arraybuffer'
  });

  return response.status === 200;
}

// Azure TTS测试
async function testAzureTtsConnection(config: any): Promise<boolean> {
  if (!config.subscriptionKey || !config.region) {
    throw new Error('Subscription key and region are required');
  }

  const response = await axios.get(`https://${config.region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`, {
    headers: {
      'Ocp-Apim-Subscription-Key': config.subscriptionKey
    },
    timeout: 10000
  });

  return response.status === 200;
}

// Google Cloud TTS测试
async function testGoogleTtsConnection(config: any): Promise<boolean> {
  if (!config.apiKey) throw new Error('API key is required');

  const response = await axios.post(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${config.apiKey}`, {
    input: { text: 'Test' },
    voice: { languageCode: 'en-US', name: 'en-US-Standard-A' },
    audioConfig: { audioEncoding: 'MP3' }
  }, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.status === 200;
}

// OpenAI STT测试 (Whisper)
async function testOpenAISttConnection(config: any): Promise<boolean> {
  if (!config.apiKey) throw new Error('API key is required');

  // 创建一个简单的音频文件用于测试
  const testAudio = Buffer.from('test audio data');
  const formData = new FormData();
  formData.append('file', testAudio, 'test.mp3');
  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        ...formData.getHeaders()
      },
      timeout: 10000
    });
    return response.status === 200;
  } catch (error: any) {
    // 如果是因为无效的音频文件格式而失败，但API密钥有效，则认为连接成功
    if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('audio')) {
      return true;
    }
    throw error;
  }
}

// Azure STT测试
async function testAzureSttConnection(config: any): Promise<boolean> {
  if (!config.subscriptionKey || !config.region) {
    throw new Error('Subscription key and region are required');
  }

  const response = await axios.get(`https://${config.region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`, {
    headers: {
      'Ocp-Apim-Subscription-Key': config.subscriptionKey
    },
    timeout: 10000
  });

  return response.status === 200;
}

// Google Cloud STT测试
async function testGoogleSttConnection(config: any): Promise<boolean> {
  if (!config.apiKey) throw new Error('API key is required');

  const response = await axios.post(`https://speech.googleapis.com/v1/speech:recognize?key=${config.apiKey}`, {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US'
    },
    audio: {
      content: 'SGVsbG8gV29ybGQ=' // Base64 encoded "Hello World"
    }
  }, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.status === 200;
}

// 百度STT测试
async function testBaiduSttConnection(config: any): Promise<boolean> {
  if (!config.apiKey || !config.secretKey) {
    throw new Error('API key and secret key are required');
  }

  // 获取访问令牌
  const tokenResponse = await axios.post('https://openapi.baidu.com/oauth/2.0/token', null, {
    params: {
      grant_type: 'client_credentials',
      client_id: config.apiKey,
      client_secret: config.secretKey
    },
    timeout: 10000
  });

  return tokenResponse.status === 200 && tokenResponse.data.access_token;
}

// =============== 语音功能 ===============

// TTS语音合成API (更新以使用数据库配置)
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