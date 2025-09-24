import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/utils/api';

export interface ChatMessage {
  id?: number;
  session_id: string;
  sender: 'user' | 'ai';
  message_type: 'text' | 'voice';
  content: string;
  voice_url?: string;
  emotion?: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  character_id: number;
  character_name: string;
  last_message: string;
  last_activity: string;
  created_at: string;
}

export const useChatStore = defineStore('chat', () => {
  const currentSession = ref<ChatSession | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const sessions = ref<ChatSession[]>([]);
  const loading = ref(false);
  const typing = ref(false);

  // 获取聊天会话列表
  const fetchSessions = async () => {
    try {
      const response = await api.get('/chats/sessions');
      sessions.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
      throw error;
    }
  };

  // 创建新的聊天会话
  const createSession = async (characterId: number, characterName: string) => {
    try {
      const response = await api.post('/chats/sessions', {
        character_id: characterId,
        character_name: characterName
      });

      const newSession = response.data;
      currentSession.value = newSession;
      sessions.value.unshift(newSession);
      messages.value = [];

      return newSession;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw error;
    }
  };

  // 加载会话消息
  const loadSessionMessages = async (sessionId: string) => {
    loading.value = true;
    try {
      const response = await api.get(`/chats/sessions/${sessionId}/messages`);
      messages.value = response.data;

      // 找到对应的会话
      const session = sessions.value.find(s => s.id === sessionId);
      if (session) {
        currentSession.value = session;
      }

      return response.data;
    } catch (error) {
      console.error('Failed to load session messages:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 发送消息
  const sendMessage = async (content: string, messageType: 'text' | 'voice' = 'text') => {
    if (!currentSession.value) {
      throw new Error('No active session');
    }

    const userMessage: ChatMessage = {
      session_id: currentSession.value.id,
      sender: 'user',
      message_type: messageType,
      content,
      timestamp: new Date().toISOString()
    };

    // 立即添加用户消息到界面
    messages.value.push(userMessage);

    try {
      // 保存用户消息到数据库
      await api.post(`/chats/sessions/${currentSession.value.id}/messages`, {
        sender: 'user',
        content,
        message_type: messageType
      });

      // 开始打字指示器
      typing.value = true;

      // 调用AI生成回复
      const aiResponse = await api.post('/ai/chat', {
        message: content,
        character_id: currentSession.value.character_id,
        session_id: currentSession.value.id
      });

      // 添加AI回复
      const aiMessage: ChatMessage = {
        session_id: currentSession.value.id,
        sender: 'ai',
        message_type: 'text',
        content: aiResponse.data.response,
        timestamp: new Date().toISOString()
      };

      messages.value.push(aiMessage);

      // 更新会话的最后消息
      if (currentSession.value) {
        currentSession.value.last_message = aiResponse.data.response;
        currentSession.value.last_activity = new Date().toISOString();

        // 更新sessions数组中的对应会话
        const sessionIndex = sessions.value.findIndex(s => s.id === currentSession.value!.id);
        if (sessionIndex !== -1) {
          sessions.value[sessionIndex] = { ...currentSession.value };
        }
      }

      return aiMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      typing.value = false;
    }
  };

  // 清除当前会话
  const clearCurrentSession = () => {
    currentSession.value = null;
    messages.value = [];
  };

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    try {
      // 调用API删除会话
      await api.delete(`/chats/sessions/${sessionId}`);

      // 从本地状态中移除
      sessions.value = sessions.value.filter(s => s.id !== sessionId);

      if (currentSession.value?.id === sessionId) {
        clearCurrentSession();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  };

  // 清理损坏的会话数据
  const cleanCorruptedSessions = async () => {
    try {
      await api.post('/chats/sessions/cleanup');
      // 重新获取会话列表
      await fetchSessions();
    } catch (error) {
      console.error('Failed to clean corrupted sessions:', error);
      throw error;
    }
  };

  return {
    currentSession,
    messages,
    sessions,
    loading,
    typing,
    fetchSessions,
    createSession,
    loadSessionMessages,
    sendMessage,
    clearCurrentSession,
    deleteSession,
    cleanCorruptedSessions,
  };
});