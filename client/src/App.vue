<template>
  <div id="app" class="min-h-screen bg-base-200">
    <!-- 导航栏 -->
    <header class="navbar bg-base-100 shadow-sm border-b border-base-300">
      <div class="navbar-start">
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><router-link to="/">主页</router-link></li>
            <li><router-link to="/create">创建人物</router-link></li>
            <li><router-link to="/settings">设置</router-link></li>
          </ul>
        </div>
        <router-link to="/" class="btn btn-ghost text-xl">
          🤖 AI人物聊天
        </router-link>
      </div>

      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li><router-link to="/" class="btn btn-ghost">主页</router-link></li>
          <li><router-link to="/create" class="btn btn-ghost">创建人物</router-link></li>
        </ul>
      </div>

      <div class="navbar-end">
        <!-- 主题切换 -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-300 rounded-box w-52">
            <li><a @click="setTheme('light')">🌞 浅色主题</a></li>
            <li><a @click="setTheme('dark')">🌙 深色主题</a></li>
          </ul>
        </div>

        <router-link to="/settings" class="btn btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </router-link>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="min-h-[calc(100vh-4rem)]">
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