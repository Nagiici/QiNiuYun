<template>
  <div id="app" class="h-screen bg-base-200 flex flex-col">
    <!-- 导航栏 -->

    <!-- 主内容区域 -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- 全局通知 -->
    <div v-if="notification" class="toast toast-top toast-end z-50">
      <div :class="`alert alert-${notification.type}`">
        <span>{{ notification.message }}</span>
        <div v-if="notification.action" class="flex gap-2">
          <button @click="notification.action.handler" class="btn btn-sm">
            {{ notification.action.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 全局加载遮罩 -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-base-100 p-8 rounded-lg shadow-lg">
        <div class="flex items-center space-x-4">
          <span class="loading loading-spinner loading-lg"></span>
          <span class="text-lg">{{ loadingMessage || '加载中...' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGlobalStore } from './stores/global';
import { useChatStore } from '@/stores/chat';
import { useCharactersStore } from '@/stores/characters';
import { useNotifications } from '@/composables/useNotifications';

const globalStore = useGlobalStore();
const chatStore = useChatStore();
const charactersStore = useCharactersStore();
const notifications = useNotifications();

// 响应式数据
const notification = ref<{ message: string; type: string } | null>(null);
const loading = ref(false);
const loadingMessage = ref('');

// 主题切换
const setTheme = (theme: string) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

// 初始化主题
onMounted(async () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  // 恢复当前角色
  globalStore.restoreCurrentCharacter();

  // 获取聊天会话列表
  try {
    await chatStore.fetchSessions();
  } catch (error) {
    console.error('Failed to load chat sessions:', error);
  }

  // 获取角色列表
  try {
    await charactersStore.fetchCharacters();
  } catch (error) {
    console.error('Failed to load characters:', error);
  }

  // 请求通知权限
  if (Notification.permission === 'default') {
    setTimeout(() => {
      notifications.requestNotificationPermission();
    }, 2000); // 延迟2秒请求，避免过于突兀
  }

  // 监听全局状态变化
  globalStore.$subscribe((mutation, state) => {
    if (state.notification) {
      notification.value = state.notification;
      const duration = state.notification.duration || 3000;
      setTimeout(() => {
        notification.value = null;
        globalStore.clearNotification();
      }, duration);
    }

    loading.value = state.loading;
    loadingMessage.value = state.loadingMessage;
  });
});
</script>