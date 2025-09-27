import { ref, onMounted, onUnmounted } from 'vue';
import { wsService, type NotificationData } from '@/services/websocketService';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '@/stores/global';

export function useNotifications() {
  const router = useRouter();
  const globalStore = useGlobalStore();

  const isConnected = ref(false);
  const notificationPermission = ref<NotificationPermission>('default');
  const unreadCount = ref(0);
  const notifications = ref<NotificationData[]>([]);

  // 初始化WebSocket连接
  const initializeWebSocket = () => {
    wsService.connect();

    // 监听连接状态
    wsService.on('connected', () => {
      isConnected.value = true;
      console.log('🔗 WebSocket通知服务已连接');
    });

    wsService.on('disconnected', () => {
      isConnected.value = false;
      console.log('📴 WebSocket通知服务已断开');
    });

    // 监听通知
    wsService.on('notification', handleNotification);

    // 监听通知点击
    wsService.on('notification_clicked', handleNotificationClick);
  };

  // 处理收到的通知
  const handleNotification = (notification: NotificationData) => {
    console.log('🔔 处理通知:', notification);

    // 添加到通知列表
    notifications.value.unshift(notification);

    // 更新未读计数
    if (notification.type === 'proactive_message') {
      unreadCount.value++;
    }

    // 显示应用内通知
    showInAppNotification(notification);
  };

  // 显示应用内通知
  const showInAppNotification = (notification: NotificationData) => {
    if (notification.type === 'proactive_message' && notification.message) {
      globalStore.showNotification(
        `${notification.message.character_name}: ${notification.message.content}`,
        'info',
        {
          duration: 5000,
          action: {
            label: '查看',
            handler: () => handleNotificationClick(notification)
          }
        }
      );
    }
  };

  // 处理通知点击
  const handleNotificationClick = (notification: NotificationData) => {
    if (notification.sessionId) {
      // 跳转到对应的聊天会话
      router.push(`/chat/${notification.sessionId.replace(/[^0-9]/g, '')}`);
      markNotificationAsRead(notification);
    }
  };

  // 标记通知为已读
  const markNotificationAsRead = (notification: NotificationData) => {
    const index = notifications.value.findIndex(n => n === notification);
    if (index > -1) {
      notifications.value.splice(index, 1);
      if (notification.type === 'proactive_message') {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    }
  };

  // 清除所有通知
  const clearAllNotifications = () => {
    notifications.value = [];
    unreadCount.value = 0;
  };

  // 注册当前会话
  const registerSession = (sessionId: string, userId?: string) => {
    if (wsService.isConnected()) {
      wsService.registerSession(sessionId, userId);
    }
  };

  // 请求通知权限
  const requestNotificationPermission = async () => {
    const granted = await wsService.requestNotificationPermission();
    notificationPermission.value = Notification.permission;

    if (granted) {
      globalStore.showNotification('通知权限已开启', 'success');
    } else {
      globalStore.showNotification('通知权限被拒绝，您将无法接收推送通知', 'warning');
    }

    return granted;
  };

  // 检查通知权限状态
  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      notificationPermission.value = Notification.permission;
    }
  };

  // 获取WebSocket连接状态
  const getConnectionStatus = () => {
    return {
      connected: isConnected.value,
      permission: notificationPermission.value,
      unreadCount: unreadCount.value
    };
  };

  // 生命周期管理
  onMounted(() => {
    checkNotificationPermission();
    initializeWebSocket();
  });

  onUnmounted(() => {
    // 移除事件监听
    wsService.off('notification', handleNotification);
    wsService.off('notification_clicked', handleNotificationClick);
  });

  return {
    // 状态
    isConnected,
    notificationPermission,
    unreadCount,
    notifications,

    // 方法
    requestNotificationPermission,
    registerSession,
    markNotificationAsRead,
    clearAllNotifications,
    getConnectionStatus,
    handleNotificationClick
  };
}