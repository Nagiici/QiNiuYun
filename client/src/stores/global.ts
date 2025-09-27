import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGlobalStore = defineStore('global', () => {
  // 全局加载状态
  const loading = ref(false);
  const loadingMessage = ref('');

  // 通知系统
  const notification = ref<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    action?: {
      label: string;
      handler: () => void;
    };
  } | null>(null);

  // 当前选中的角色
  const currentCharacter = ref<any>(null);

  // 侧边栏状态
  const sidebarCollapsed = ref(false);

  // 设置加载状态
  const setLoading = (isLoading: boolean, message = '') => {
    loading.value = isLoading;
    loadingMessage.value = message;
  };

  // 显示通知
  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options?: {
      duration?: number;
      action?: {
        label: string;
        handler: () => void;
      };
    }
  ) => {
    notification.value = {
      message,
      type,
      duration: options?.duration,
      action: options?.action
    };
  };

  // 清除通知
  const clearNotification = () => {
    notification.value = null;
  };

  // 设置当前角色
  const setCurrentCharacter = (character: any) => {
    currentCharacter.value = character;
    // 保存到localStorage
    if (character) {
      localStorage.setItem('currentCharacter', JSON.stringify(character));
    } else {
      localStorage.removeItem('currentCharacter');
    }
  };

  // 从localStorage恢复当前角色
  const restoreCurrentCharacter = () => {
    const saved = localStorage.getItem('currentCharacter');
    if (saved) {
      try {
        currentCharacter.value = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to restore current character:', error);
      }
    }
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value));
  };

  // 恢复侧边栏状态
  const restoreSidebarState = () => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      sidebarCollapsed.value = saved === 'true';
    }
  };

  return {
    loading,
    loadingMessage,
    notification,
    currentCharacter,
    sidebarCollapsed,
    setLoading,
    showNotification,
    clearNotification,
    setCurrentCharacter,
    restoreCurrentCharacter,
    toggleSidebar,
    restoreSidebarState,
  };
});