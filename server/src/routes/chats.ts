import express from 'express';
import { DatabaseService } from '../database';
import { v4 as uuidv4 } from 'uuid';

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
chatsRouter.post('/sessions', async (req, res) => {
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
    const { sender, content, message_type = 'text', emotion } = req.body;

    if (!sender || !content) {
      return res.status(400).json({ error: 'Sender and content are required' });
    }

    await DatabaseService.addChatMessage(sessionId, sender, content, message_type, emotion);

    res.status(201).json({
      sessionId,
      sender,
      content,
      message_type,
      emotion,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding chat message:', error);
    res.status(500).json({ error: 'Failed to add chat message' });
  }
});