import express from 'express';
import { DatabaseService } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { validate, validateParams, sessionSchema, idParamSchema } from '../middleware/validation';
import { ProactiveChatService } from '../services/proactiveChatService';

export const chatsRouter = express.Router();

// 获取聊天会话列表
chatsRouter.get('/sessions', async (req, res) => {
  try {
    const sessions = await DatabaseService.getChatSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// 创建新的聊天会话
chatsRouter.post('/sessions', validate(sessionSchema), async (req, res) => {
  try {
    const { character_id, character_name } = req.body;

    if (!character_id || !character_name) {
      return res.status(400).json({ error: 'Character ID and name are required' });
    }

    const sessionId = uuidv4();
    await DatabaseService.createChatSession(sessionId, character_id, character_name);

    res.status(201).json({
      id: sessionId,
      character_id,
      character_name,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// 获取特定会话的消息
chatsRouter.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await DatabaseService.getChatMessages(sessionId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// 发送消息到会话
chatsRouter.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sender, content, message_type = 'text', emotion, is_proactive = false } = req.body;

    if (!sender || !content) {
      return res.status(400).json({ error: 'Sender and content are required' });
    }

    await DatabaseService.addChatMessage(sessionId, sender, content, message_type, emotion, is_proactive);

    res.status(201).json({
      sessionId,
      sender,
      content,
      message_type,
      emotion,
      is_proactive,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding chat message:', error);
    res.status(500).json({ error: 'Failed to add chat message' });
  }
});

// 删除聊天会话
chatsRouter.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await DatabaseService.deleteChatSession(sessionId);

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

// 清理损坏的会话数据
chatsRouter.post('/sessions/cleanup', async (req, res) => {
  try {
    await DatabaseService.cleanCorruptedSessions();
    res.status(200).json({ message: 'Corrupted sessions cleaned successfully' });
  } catch (error) {
    console.error('Error cleaning corrupted sessions:', error);
    res.status(500).json({ error: 'Failed to clean corrupted sessions' });
  }
});

// 手动触发AI主动聊天检查（测试用）
chatsRouter.post('/proactive/trigger', async (req, res) => {
  try {
    await ProactiveChatService.triggerProactiveCheck();
    res.status(200).json({ message: 'Proactive chat check triggered successfully' });
  } catch (error) {
    console.error('Error triggering proactive chat:', error);
    res.status(500).json({ error: 'Failed to trigger proactive chat' });
  }
});

// 标记会话已读
chatsRouter.post('/sessions/:sessionId/mark-read', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await DatabaseService.markSessionAsRead(sessionId);
    res.status(200).json({ message: 'Session marked as read' });
  } catch (error) {
    console.error('Error marking session as read:', error);
    res.status(500).json({ error: 'Failed to mark session as read' });
  }
});

// 获取主动聊天配置
chatsRouter.get('/proactive/config', async (req, res) => {
  try {
    const config = ProactiveChatService.getConfig();
    res.json(config);
  } catch (error) {
    console.error('获取主动聊天配置失败:', error);
    res.status(500).json({ error: 'Failed to get proactive chat config' });
  }
});

// 更新主动聊天配置
chatsRouter.put('/proactive/config', async (req, res) => {
  try {
    const { enabled, intervalMinutes, inactivityThreshold, maxMessagesPerDay } = req.body;

    const newConfig: any = {};
    if (typeof enabled === 'boolean') newConfig.enabled = enabled;
    if (typeof intervalMinutes === 'number' && intervalMinutes > 0) newConfig.intervalMinutes = intervalMinutes;
    if (typeof inactivityThreshold === 'number' && inactivityThreshold > 0) newConfig.inactivityThreshold = inactivityThreshold;
    if (typeof maxMessagesPerDay === 'number' && maxMessagesPerDay >= 0) newConfig.maxMessagesPerDay = maxMessagesPerDay;

    await ProactiveChatService.updateConfig(newConfig);

    const updatedConfig = ProactiveChatService.getConfig();
    res.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error('更新主动聊天配置失败:', error);
    res.status(500).json({ error: 'Failed to update proactive chat config' });
  }
});

// 重启主动聊天服务
chatsRouter.post('/proactive/restart', async (req, res) => {
  try {
    ProactiveChatService.restart();
    res.json({ success: true, message: 'Proactive chat service restarted' });
  } catch (error) {
    console.error('重启主动聊天服务失败:', error);
    res.status(500).json({ error: 'Failed to restart proactive chat service' });
  }
});