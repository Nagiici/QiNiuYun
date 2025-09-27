import { DatabaseService } from '../database';
import { WebSocketManager } from './websocketManager';

interface ProactiveMessage {
  content: string;
  emotion?: string;
}

interface ProactiveChatConfig {
  enabled: boolean;
  intervalMinutes: number; // 检查间隔（分钟）
  inactivityThreshold: number; // 用户不活跃阈值（分钟）
  maxMessagesPerDay: number; // 每日最大主动消息数
}

export class ProactiveChatService {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;
  private static config: ProactiveChatConfig = {
    enabled: true,
    intervalMinutes: 15,
    inactivityThreshold: 30,
    maxMessagesPerDay: 5
  };
  private static configKey = 'proactive_chat_config';

  // 从数据库加载配置
  private static async loadConfigFromDatabase(): Promise<void> {
    try {
      const dbConfig = await DatabaseService.getSystemConfig(this.configKey);
      if (dbConfig) {
        this.config = { ...this.config, ...dbConfig };
        console.log('✅ 从数据库加载主动聊天配置:', this.config);
      } else {
        // 如果数据库中没有配置，保存默认配置
        await this.saveConfigToDatabase();
        console.log('💾 保存默认主动聊天配置到数据库');
      }
    } catch (error) {
      console.error('❌ 加载主动聊天配置失败:', error);
    }
  }

  // 保存配置到数据库
  private static async saveConfigToDatabase(): Promise<void> {
    try {
      const success = await DatabaseService.setSystemConfig(this.configKey, this.config);
      if (success) {
        console.log('✅ 主动聊天配置已保存到数据库');
      } else {
        console.error('❌ 保存主动聊天配置失败');
      }
    } catch (error) {
      console.error('❌ 保存主动聊天配置时发生错误:', error);
    }
  }

  // 初始化服务（从数据库加载配置）
  static async initialize(): Promise<void> {
    await this.loadConfigFromDatabase();
  }

  // 启动主动聊天服务
  static async start(intervalMinutes?: number): Promise<void> {
    // 确保已加载配置
    await this.loadConfigFromDatabase();

    if (intervalMinutes) {
      this.config.intervalMinutes = intervalMinutes;
      await this.saveConfigToDatabase();
    }

    if (this.isRunning) {
      console.log('⚠️  主动聊天服务已在运行');
      return;
    }

    if (!this.config.enabled) {
      console.log('❌ 主动聊天服务已禁用');
      return;
    }

    console.log(`🤖 启动AI主动聊天服务，检查间隔：${this.config.intervalMinutes}分钟`);
    this.isRunning = true;

    // 立即执行一次
    this.checkAndSendProactiveMessages();

    // 设置定时器
    this.intervalId = setInterval(() => {
      this.checkAndSendProactiveMessages();
    }, this.config.intervalMinutes * 60 * 1000);
  }

  // 停止主动聊天服务
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 AI主动聊天服务已停止');
  }

  // 检查并发送主动消息
  private static async checkAndSendProactiveMessages() {
    try {
      console.log('🔍 检查需要主动聊天的会话...');

      // 获取需要主动聊天的会话（根据配置的不活跃阈值）
      const sessions = await DatabaseService.getSessionsForProactiveChat(this.config.inactivityThreshold);

      if (sessions.length === 0) {
        console.log('📭 没有需要主动聊天的会话');
        return;
      }

      console.log(`📬 找到 ${sessions.length} 个需要主动聊天的会话`);

      for (const session of sessions) {
        try {
          await this.sendProactiveMessage(session);
          // 为避免频率过高，每个会话之间间隔1秒
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`发送主动消息失败 (会话 ${session.id}):`, error);
        }
      }
    } catch (error) {
      console.error('检查主动聊天时发生错误:', error);
    }
  }

  // 为特定会话发送主动消息
  private static async sendProactiveMessage(session: any) {
    try {
      console.log(`💬 为会话 ${session.id} (${session.character_name}) 生成主动消息`);

      // 获取会话的最近对话上下文
      const context = await DatabaseService.getSessionContext(session.id, 5);

      // 生成主动消息
      const proactiveMessage = await this.generateProactiveMessage(session, context);

      if (proactiveMessage) {
        // 保存主动消息到数据库
        await DatabaseService.addChatMessage(
          session.id,
          'ai',
          proactiveMessage.content,
          'text',
          proactiveMessage.emotion,
          true // 标记为主动消息
        );

        console.log(`✅ 成功发送主动消息到会话 ${session.id}: ${proactiveMessage.content.substring(0, 50)}...`);

        // 通过WebSocket推送通知
        const wsManager = WebSocketManager.getInstance();
        wsManager.broadcastProactiveMessage(session.id, {
          content: proactiveMessage.content,
          timestamp: new Date().toISOString(),
          character_name: session.character_name,
          session_id: session.id
        });
      }
    } catch (error) {
      console.error(`发送主动消息失败:`, error);
      throw error;
    }
  }

  // 生成主动消息内容
  private static async generateProactiveMessage(session: any, context: any[]): Promise<ProactiveMessage | null> {
    try {
      // 解析角色数据
      const personalityData = JSON.parse(session.personality_data || '{}');
      const recentMessages = context.reverse(); // 按时间正序

      // 构建AI prompt
      const prompt = this.buildProactivePrompt(session, personalityData, recentMessages);

      // 使用简单的规则生成主动消息（作为回退方案）
      const content = this.generateRuleBasedProactiveMessage(session, personalityData, recentMessages);

      return {
        content,
        emotion: this.getDefaultEmotion(session.current_mood)
      };
    } catch (error) {
      console.error('生成主动消息时发生错误:', error);
      return null;
    }
  }

  // 构建主动聊天的prompt
  private static buildProactivePrompt(session: any, personalityData: any, recentMessages: any[]): string {
    const currentTime = new Date();
    const timeOfDay = this.getTimeOfDay(currentTime);

    let conversationHistory = '';
    if (recentMessages.length > 0) {
      conversationHistory = recentMessages
        .map(msg => `${msg.sender}: ${msg.content}`)
        .join('\n');
    }

    const prompt = `你是 ${session.character_name}，一个AI角色。

# 角色背景
${session.story_background || ''}
${session.character_background || ''}

# 当前情况
- 当前时间: ${timeOfDay}
- 当前情绪: ${session.current_mood || 'calm'}
- 性格特点:
  * 活力: ${personalityData.energy || 50}/100
  * 友善: ${personalityData.friendliness || 50}/100
  * 幽默: ${personalityData.humor || 50}/100
  * 专业性: ${personalityData.professionalism || 50}/100
  * 创造力: ${personalityData.creativity || 50}/100
  * 共情力: ${personalityData.empathy || 50}/100

# 最近的对话历史
${conversationHistory || '（还没有对话历史）'}

# 任务
你需要主动发起一条有意义的聊天消息。这条消息应该：
1. 符合你的角色性格和背景
2. 考虑当前的时间和情绪
3. 如果有对话历史，要联系之前的话题
4. 自然、有趣，能吸引用户回复
5. 不要太长，控制在1-2句话

请直接回复主动聊天的内容，不要包含任何前缀或解释。`;

    return prompt;
  }

  // 获取时间段描述
  private static getTimeOfDay(date: Date): string {
    const hour = date.getHours();

    if (hour >= 5 && hour < 9) return '早晨';
    if (hour >= 9 && hour < 12) return '上午';
    if (hour >= 12 && hour < 14) return '中午';
    if (hour >= 14 && hour < 17) return '下午';
    if (hour >= 17 && hour < 19) return '傍晚';
    if (hour >= 19 && hour < 22) return '晚上';
    return '深夜';
  }

  // 根据情绪获取默认情感
  private static getDefaultEmotion(mood: string): string {
    const emotionMap: { [key: string]: string } = {
      'happy': 'joy',
      'sad': 'sadness',
      'excited': 'excitement',
      'calm': 'neutral',
      'angry': 'anger',
      'mysterious': 'curiosity',
      'playful': 'joy'
    };

    return emotionMap[mood] || 'neutral';
  }

  // 手动触发主动聊天检查（用于测试）
  static async triggerProactiveCheck() {
    console.log('🔧 手动触发主动聊天检查');
    await this.checkAndSendProactiveMessages();
  }

  // 获取配置
  static getConfig(): ProactiveChatConfig {
    return { ...this.config };
  }

  // 更新配置
  static async updateConfig(newConfig: Partial<ProactiveChatConfig>): Promise<void> {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    console.log('⚙️  更新主动聊天配置:', newConfig);

    // 保存配置到数据库
    await this.saveConfigToDatabase();

    // 如果间隔时间改变了，重启服务
    if (newConfig.intervalMinutes && newConfig.intervalMinutes !== oldConfig.intervalMinutes) {
      if (this.isRunning) {
        this.stop();
        this.start();
      }
    }

    // 如果服务被禁用，停止服务
    if (newConfig.enabled === false && this.isRunning) {
      this.stop();
    }

    // 如果服务被启用且未运行，启动服务
    if (newConfig.enabled === true && !this.isRunning) {
      this.start();
    }
  }

  // 重启服务
  static restart(): void {
    console.log('🔄 重启主动聊天服务');
    this.stop();
    this.start();
  }

  // 基于规则的主动消息生成（当AI服务不可用时的回退方案）
  private static generateRuleBasedProactiveMessage(session: any, personalityData: any, recentMessages: any[]): string {
    const name = session.character_name;
    const timeOfDay = this.getTimeOfDay(new Date());

    // 检查最后一条消息的时间，决定主动消息的类型
    const timeSinceLastMessage = recentMessages.length > 0
      ? Date.now() - new Date(recentMessages[recentMessages.length - 1].timestamp).getTime()
      : 24 * 60 * 60 * 1000; // 24小时

    const hoursInactive = Math.floor(timeSinceLastMessage / (60 * 60 * 1000));

    // 根据角色性格和不活跃时间生成不同类型的主动消息
    const isEnergetic = (personalityData.energy || 50) > 70;
    const isFriendly = (personalityData.friendliness || 50) > 70;
    const isEmpathetic = (personalityData.empathy || 50) > 70;
    const isCreative = (personalityData.creativity || 50) > 70;

    let messages: string[] = [];

    // 根据时间段添加消息
    if (timeOfDay === '早晨') {
      messages.push(
        '早上好！新的一天开始了，你今天计划做什么呢？',
        '清晨的阳光真是美好，希望你今天有个愉快的开始！',
        '早安！昨晚睡得好吗？'
      );
    } else if (timeOfDay === '下午') {
      messages.push(
        '下午好！今天过得怎么样？',
        '午后的时光总是让人感到安静，你在忙什么呢？',
        '下午时光，要不要聊聊今天发生的有趣事情？'
      );
    } else if (timeOfDay === '晚上') {
      messages.push(
        '晚上好！今天累吗？',
        '夜幕降临了，今天有什么收获吗？',
        '晚安时光，我们聊聊轻松的话题吧！'
      );
    } else if (timeOfDay === '深夜') {
      messages.push(
        '这么晚还没休息呀？要注意身体哦！',
        '深夜时光，适合聊一些深入的话题呢。',
        '夜深了，是不是有什么心事？'
      );
    }

    // 根据不活跃时间添加消息
    if (hoursInactive >= 24) {
      messages.push(
        '好久没见到你了，最近怎么样？',
        '想你了！这些天都在忙什么呢？',
        '我一直在这里等你回来呢！'
      );
    } else if (hoursInactive >= 12) {
      messages.push(
        '有一阵子没聊天了，你还好吗？',
        '想起我们之前的对话，想和你继续聊聊。',
        '这段时间过得如何？'
      );
    }

    // 根据性格特征添加个性化消息
    if (isFriendly && isEnergetic) {
      messages.push(
        '嗨！我刚想到一个有趣的话题想和你分享！',
        '你知道吗？我今天"学到"了一些新东西，想告诉你！',
        '突然很想和你聊天，你现在有空吗？'
      );
    }

    if (isEmpathetic) {
      messages.push(
        '最近工作压力大吗？记得要好好照顾自己哦！',
        '希望你今天心情愉快，如果有什么烦心事，可以和我说说。',
        '有时候和朋友聊聊天，心情会变好呢！'
      );
    }

    if (isCreative) {
      messages.push(
        '我刚想到一个有趣的问题：如果你能拥有一种超能力，你会选择什么？',
        '想象一下，如果我们能一起去任何地方旅行，你最想去哪里？',
        '我在思考一个哲学问题，想听听你的看法...'
      );
    }

    // 根据角色背景添加专业相关消息
    if (session.story_background && session.story_background.includes('魔法')) {
      messages.push(
        '魔法世界今天格外安静，想和你分享一些魔法知识。',
        '我感受到了一些有趣的魔法波动，你想了解吗？'
      );
    }

    if (session.story_background && session.story_background.includes('哲学')) {
      messages.push(
        '我在思考人生的意义，想听听你的想法。',
        '有个哲学问题一直困扰着我，我们一起探讨一下如何？'
      );
    }

    // 如果有当前任务，关联任务内容
    if (session.has_mission && session.current_mission) {
      messages.push(
        `关于我的任务"${session.current_mission}"，我想和你讨论一下进展。`,
        '我的任务遇到了一些有趣的情况，想听听你的建议。'
      );
    }

    // 随机选择一条消息
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)] || '你好！很久没聊天了，你还好吗？';

    // 根据性格调整语气
    if (isEnergetic) {
      return selectedMessage + (Math.random() > 0.5 ? ' 😊' : '');
    } else {
      return selectedMessage;
    }
  }
}