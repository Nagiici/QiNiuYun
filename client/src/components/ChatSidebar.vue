<template>
  <div class="flex flex-col overflow-hidden">
    <!-- 快速导航 - 固定在顶部 -->
    <div class="flex-shrink-0 p-2" :class="{ 'p-1': isCollapsed }">
      <ul class="menu gap-1" :class="{ 'items-center flex flex-col': isCollapsed }">
        <li>
          <router-link
            to="/"
            class="nav-hover focus-primary"
            :class="[{ 'active': $route.name === 'Home' }, { 'w-10 h-10 justify-center': isCollapsed }]"
            :title="isCollapsed ? '主页' : ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span v-show="!isCollapsed" class="font-medium">主页</span>
          </router-link>
        </li>

        <li>
          <router-link
            to="/create"
            class="nav-hover focus-primary"
            :class="[{ 'active': $route.name === 'CreateCharacter' }, { 'w-10 h-10 justify-center': isCollapsed }]"
            :title="isCollapsed ? '创建人物' : ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span v-show="!isCollapsed" class="font-medium">创建人物</span>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- 历史会话标题 - 固定 -->
    <div class="flex-shrink-0 px-4" :class="{ 'px-2': isCollapsed }">
      <div v-show="!isCollapsed" class="divider text-xs text-base-content/50 my-1">
        <span>历史会话</span>
      </div>
    </div>

    <!-- 历史会话列表 - 可滚动区域 -->
    <div class="flex-1 overflow-y-auto px-4" :class="{ 'px-2': isCollapsed }">
      <!-- 加载状态 -->
      <div v-if="chatStore.loading" class="text-center py-4">
        <span class="loading loading-spinner loading-md"></span>
        <p v-show="!isCollapsed" class="text-sm text-base-content/60 mt-2">加载中...</p>
      </div>

      <!-- 会话列表 -->
      <div v-else-if="chatStore.sessions.length > 0" class="space-y-2 pb-2">
        <div
          v-for="session in chatStore.sessions"
          :key="session.id"
          class="chat-history-item nav-hover p-2 rounded-lg cursor-pointer border border-transparent transition-colors duration-200"
          :class="[{ 'active': currentSessionId === session.id }, { 'p-1': isCollapsed }]"
          @click="loadSession(session)"
          :title="isCollapsed ? session.character_name : ''"
        >
          <div class="flex items-center gap-3" :class="{ 'justify-center h-10': isCollapsed }">
            <div class="avatar placeholder relative">
              <div class="w-8 h-8 rounded-full bg-accent text-accent-content text-xs">
                {{ session.character_name.charAt(0) }}
              </div>
              <!-- 未读消息指示器 -->
              <div v-if="session.unread_count && session.unread_count > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <span class="text-primary-content text-xs font-bold">{{ session.unread_count > 9 ? '9+' : session.unread_count }}</span>
              </div>
            </div>
            <div v-show="!isCollapsed" class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-medium text-sm truncate">{{ session.character_name }}</p>
                <!-- 主动消息指示器 -->
                <span v-if="hasProactiveMessage(session)" class="badge badge-primary badge-xs">AI主动</span>
              </div>
              <p class="text-xs opacity-70 truncate">{{ session.last_message }}</p>
              <p class="text-xs opacity-50 mt-0.5">{{ formatRelativeTime(session.last_activity) }}</p>
            </div>
          </div>

          <!-- 会话操作 -->
          <div v-show="!isCollapsed" class="flex gap-1 mt-1">
            <button
              class="btn btn-ghost btn-xs"
              @click.stop="resumeSession(session)"
              title="恢复对话"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
              </svg>
            </button>
            <button
              class="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content"
              @click.stop="deleteSession(session)"
              title="删除会话"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-base-content/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
        </svg>
        <p v-show="!isCollapsed" class="text-sm text-base-content/60">暂无历史会话</p>
        <p v-show="!isCollapsed" class="text-xs text-base-content/40 mt-1">选择角色开始对话</p>
      </div>
    </div>

    <!-- 侧边栏底部 - 固定在底部 -->
    <div class="mt-auto flex-shrink-0 border-t border-base-300 p-1" :class="{ 'p-0.5': isCollapsed }">
      <!-- 主题切换 -->
      <div class="dropdown dropdown-top w-full mb-0.5">
        <div tabindex="0" role="button" class="btn btn-ghost btn-xs w-full nav-hover focus-primary h-8" :class="{ 'justify-start': !isCollapsed, 'justify-center w-10': isCollapsed }">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span v-show="!isCollapsed" class="text-xs">主题</span>
        </div>
        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-300 rounded-box w-52">
          <li><a @click="setTheme('light')">🌞 浅色主题</a></li>
          <li><a @click="setTheme('dark')">🌙 深色主题</a></li>
        </ul>
      </div>

      <router-link
        to="/settings"
        class="btn btn-ghost btn-xs w-full nav-hover focus-primary h-8"
        :class="{ 'justify-start': !isCollapsed, 'justify-center w-10': isCollapsed }"
        :title="isCollapsed ? '设置' : ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span v-show="!isCollapsed" class="text-xs">设置</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onActivated, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatStore, type ChatSession } from '@/stores/chat';
import { useCharactersStore } from '@/stores/characters';
import { useGlobalStore } from '@/stores/global';
import { useNotifications } from '@/composables/useNotifications';

// Props
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const charactersStore = useCharactersStore();
const globalStore = useGlobalStore();
const notifications = useNotifications();

// 计算属性
const currentSessionId = computed(() => {
  return chatStore.currentSession?.id;
});

// 方法
const setTheme = (theme: string) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

const formatRelativeTime = (timestamp: string) => {
  const now = new Date().getTime();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}分钟前`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}小时前`;
  } else {
    const days = Math.floor(diff / day);
    return `${days}天前`;
  }
};

// 判断会话是否包含主动消息
const hasProactiveMessage = (session: ChatSession) => {
  // 简单的判断逻辑：如果有未读消息，可能是主动消息
  // 更精确的判断需要检查具体的消息内容，但这会增加API调用
  return session.unread_count && session.unread_count > 0;
};

const loadSession = async (session: ChatSession) => {
  try {
    // 加载会话消息
    await chatStore.loadSessionMessages(session.id);

    // 标记会话为已读
    if (session.unread_count && session.unread_count > 0) {
      await chatStore.markSessionAsRead(session.id);
    }

    // 设置当前角色
    const character = await charactersStore.fetchCharacterById(session.character_id);
    globalStore.setCurrentCharacter(character);

    // 跳转到聊天页面
    router.push(`/chat/${session.character_id}`);
  } catch (error) {
    console.error('Failed to load session:', error);
    globalStore.showNotification('加载会话失败', 'error');
  }
};

const resumeSession = async (session: ChatSession) => {
  await loadSession(session);
};

const deleteSession = async (session: ChatSession) => {
  if (confirm(`确定要删除与 ${session.character_name} 的对话记录吗？`)) {
    try {
      await chatStore.deleteSession(session.id);
      globalStore.showNotification('会话已删除', 'success');
    } catch (error) {
      console.error('Failed to delete session:', error);
      globalStore.showNotification('删除会话失败', 'error');
    }
  }
};

// 获取会话列表的函数
const refreshSessions = async () => {
  try {
    await chatStore.fetchSessions();
  } catch (error) {
    console.error('Failed to fetch chat sessions:', error);
  }
};

// 监听路由变化，当返回首页时刷新会话列表
watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName === 'Home') {
      refreshSessions();
    }
  }
);

// 监听WebSocket通知，实时更新会话列表
const setupRealtimeUpdates = () => {
  // 监听主动消息通知
  notifications.notifications.value.forEach(notification => {
    if (notification.type === 'proactive_message') {
      // 当收到主动消息通知时，刷新会话列表
      refreshSessions();
    }
  });
};

// 生命周期
onMounted(() => {
  refreshSessions();
  setupRealtimeUpdates();
});

// 当组件激活时也刷新会话列表（用于keep-alive场景）
onActivated(() => {
  refreshSessions();
  setupRealtimeUpdates();
});

// 监听通知变化，实时更新
watch(
  () => notifications.notifications.value,
  (newNotifications) => {
    const hasProactiveMessage = newNotifications.some(n => n.type === 'proactive_message');
    if (hasProactiveMessage) {
      // 延迟一点刷新，确保后端数据已更新
      setTimeout(() => {
        refreshSessions();
      }, 1000);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.nav-hover:hover {
  background-color: rgba(99, 102, 241, 0.1);
  transform: translateX(4px);
}

.nav-hover.active {
  background-color: hsl(var(--b2));
  color: hsl(var(--bc));
  font-weight: 600;
}

.chat-history-item:hover {
  transform: translateX(2px);
}

.focus-primary:focus {
  outline: 2px solid rgba(99, 102, 241, 1);
  outline-offset: 2px;
}
</style>
