export interface NotificationData {
  type: 'proactive_message' | 'new_message' | 'system';
  sessionId?: string;
  message?: {
    content: string;
    timestamp: string;
    character_name: string;
  };
  title?: string;
  body?: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private connectionId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: number | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  // 连接WebSocket
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket已连接');
      return;
    }

    try {
      const wsUrl = `ws://localhost:8080`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔗 WebSocket连接已建立');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket消息解析错误:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('📴 WebSocket连接已关闭');
        this.stopHeartbeat();
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('WebSocket连接失败:', error);
      this.attemptReconnect();
    }
  }

  // 断开连接
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionId = null;
  }

  // 处理收到的消息
  private handleMessage(data: any) {
    console.log('📨 收到WebSocket消息:', data);

    switch (data.type) {
      case 'connection_established':
        this.connectionId = data.connectionId;
        this.emit('connection_established', data);
        break;

      case 'notification':
      case 'session_notification':
      case 'global_notification':
        this.handleNotification(data.data);
        break;

      case 'heartbeat_response':
        // 心跳响应
        break;

      case 'session_registered':
        console.log('✅ 会话已注册:', data);
        this.emit('session_registered', data);
        break;

      default:
        console.log('未知消息类型:', data.type);
    }
  }

  // 处理通知
  private handleNotification(notification: NotificationData) {
    console.log('🔔 收到通知:', notification);

    // 触发通知事件
    this.emit('notification', notification);

    // 显示浏览器通知
    this.showBrowserNotification(notification);

    // 更新页面标题
    this.updatePageTitle(notification);
  }

  // 显示浏览器原生通知
  private async showBrowserNotification(notification: NotificationData) {
    if (!('Notification' in window)) {
      console.log('浏览器不支持通知');
      return;
    }

    // 请求通知权限
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      let title = '新消息';
      let body = '';
      let icon = '/favicon.ico';

      if (notification.type === 'proactive_message' && notification.message) {
        title = `${notification.message.character_name} 主动发起对话`;
        body = notification.message.content;
      } else if (notification.title && notification.body) {
        title = notification.title;
        body = notification.body;
      }

      const browserNotification = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: `chat-${notification.sessionId}`, // 避免重复通知
        requireInteraction: true, // 需要用户交互才消失
      });

      // 点击通知时的处理
      browserNotification.onclick = () => {
        window.focus();
        if (notification.sessionId) {
          // 可以在这里跳转到对应的聊天会话
          this.emit('notification_clicked', notification);
        }
        browserNotification.close();
      };

      // 3秒后自动关闭
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }

  // 更新页面标题显示未读消息
  private updatePageTitle(notification: NotificationData) {
    if (notification.type === 'proactive_message') {
      document.title = '🔔 新消息 - AI 聊天';

      // 恢复原标题
      setTimeout(() => {
        document.title = 'AI 聊天';
      }, 5000);
    }
  }

  // 注册会话
  registerSession(sessionId: string, userId?: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'register_session',
        sessionId,
        userId
      });
    }
  }

  // 发送消息
  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  }

  // 开始心跳
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      this.send({ type: 'heartbeat' });
    }, 30000); // 30秒心跳
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 重连机制
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('超过最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})，${delay}ms后重试`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // 事件监听
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  // 移除事件监听
  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 触发事件
  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // 获取连接状态
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // 请求通知权限
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('浏览器不支持通知');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }
}

// 导出单例实例
export const wsService = WebSocketService.getInstance();