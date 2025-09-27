import { WebSocket } from 'ws';

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  sessionId?: string;
  lastActivity: Date;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, ClientConnection> = new Map();

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // 添加新的WebSocket连接
  addConnection(ws: WebSocket, connectionId: string) {
    const connection: ClientConnection = {
      ws,
      lastActivity: new Date()
    };

    this.connections.set(connectionId, connection);
    console.log(`📱 WebSocket连接已添加: ${connectionId}`);

    // 设置连接关闭时的清理
    ws.on('close', () => {
      this.removeConnection(connectionId);
    });

    // 处理连接错误
    ws.on('error', (error) => {
      console.error(`WebSocket连接错误 (${connectionId}):`, error);
      this.removeConnection(connectionId);
    });
  }

  // 移除WebSocket连接
  removeConnection(connectionId: string) {
    if (this.connections.has(connectionId)) {
      this.connections.delete(connectionId);
      console.log(`📱 WebSocket连接已移除: ${connectionId}`);
    }
  }

  // 设置连接的用户和会话信息
  setConnectionInfo(connectionId: string, userId?: string, sessionId?: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.userId = userId;
      connection.sessionId = sessionId;
      connection.lastActivity = new Date();
      console.log(`📱 连接信息已更新: ${connectionId} -> 用户:${userId}, 会话:${sessionId}`);
    }
  }

  // 向特定用户发送通知
  sendNotificationToUser(userId: string, notification: any) {
    let sent = 0;
    this.connections.forEach((connection, connectionId) => {
      if (connection.userId === userId && connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(JSON.stringify({
            type: 'notification',
            data: notification,
            timestamp: new Date().toISOString()
          }));
          sent++;
        } catch (error) {
          console.error(`发送通知失败 (${connectionId}):`, error);
          this.removeConnection(connectionId);
        }
      }
    });

    console.log(`📨 向用户 ${userId} 发送通知到 ${sent} 个连接`);
    return sent > 0;
  }

  // 向特定会话发送通知
  sendNotificationToSession(sessionId: string, notification: any) {
    let sent = 0;
    this.connections.forEach((connection, connectionId) => {
      if (connection.sessionId === sessionId && connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(JSON.stringify({
            type: 'session_notification',
            data: notification,
            timestamp: new Date().toISOString()
          }));
          sent++;
        } catch (error) {
          console.error(`发送会话通知失败 (${connectionId}):`, error);
          this.removeConnection(connectionId);
        }
      }
    });

    console.log(`📨 向会话 ${sessionId} 发送通知到 ${sent} 个连接`);
    return sent > 0;
  }

  // 广播主动消息通知
  broadcastProactiveMessage(sessionId: string, message: any) {
    const notification = {
      type: 'proactive_message',
      sessionId,
      message: {
        content: message.content,
        timestamp: message.timestamp,
        character_name: message.character_name || 'AI助手'
      }
    };

    // 尝试向特定会话发送
    const sessionSent = this.sendNotificationToSession(sessionId, notification);

    // 如果会话没有活跃连接，尝试向所有连接发送（用户可能在其他页面）
    if (!sessionSent) {
      let broadcastSent = 0;
      this.connections.forEach((connection, connectionId) => {
        if (connection.ws.readyState === WebSocket.OPEN) {
          try {
            connection.ws.send(JSON.stringify({
              type: 'global_notification',
              data: notification,
              timestamp: new Date().toISOString()
            }));
            broadcastSent++;
          } catch (error) {
            console.error(`广播通知失败 (${connectionId}):`, error);
            this.removeConnection(connectionId);
          }
        }
      });
      console.log(`📡 广播主动消息通知到 ${broadcastSent} 个连接`);
    }

    return sessionSent || false;
  }

  // 获取活跃连接统计
  getConnectionStats() {
    const total = this.connections.size;
    const withUser = Array.from(this.connections.values()).filter(c => c.userId).length;
    const withSession = Array.from(this.connections.values()).filter(c => c.sessionId).length;

    return {
      total,
      withUser,
      withSession,
      active: Array.from(this.connections.values()).filter(c =>
        c.ws.readyState === WebSocket.OPEN
      ).length
    };
  }

  // 清理不活跃的连接
  cleanupInactiveConnections() {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30分钟前
    const toRemove: string[] = [];

    this.connections.forEach((connection, connectionId) => {
      if (connection.lastActivity < cutoff || connection.ws.readyState !== WebSocket.OPEN) {
        toRemove.push(connectionId);
      }
    });

    toRemove.forEach(connectionId => {
      this.removeConnection(connectionId);
    });

    if (toRemove.length > 0) {
      console.log(`🧹 清理了 ${toRemove.length} 个不活跃的WebSocket连接`);
    }
  }
}