<template>
  <div class="h-full flex flex-col">
    <!-- 侧边栏头部 -->
    <div class="p-4 border-b border-base-300">
      <div class="flex items-center gap-3">
        <div class="avatar placeholder">
          <div class="w-10 h-10 rounded-full bg-primary text-primary-content">
            <span class="text-lg">🤖</span>
          </div>
        </div>
        <div>
          <h2 class="font-bold text-base">AI聊天</h2>
          <p class="text-xs text-base-content/60">智能人物对话平台</p>
        </div>
      </div>
    </div>

    <!-- 快速导航 -->
    <div class="p-4">
      <ul class="menu gap-2">
        <li>
          <router-link
            to="/"
            class="nav-hover focus-primary"
            :class="{ 'active': $route.name === 'Home' }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span class="font-medium">主页</span>
          </router-link>
        </li>

        <li>
          <router-link
            to="/create"
            class="nav-hover focus-primary"
            :class="{ 'active': $route.name === 'CreateCharacter' }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="font-medium">创建人物</span>
          </router-link>
        </li>

        <li v-if="globalStore.currentCharacter">
          <router-link
            :to="`/chat/${globalStore.currentCharacter.id}`"
            class="nav-hover focus-primary"
            :class="{ 'active': $route.name === 'Chat' }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
            </svg>
            <span class="font-medium">当前聊天</span>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- 当前角色信息 -->
    <div v-if="globalStore.currentCharacter" class="px-4 mb-4">
      <div class="card bg-base-200 shadow-sm">
        <div class="card-body p-3">
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class="w-10 h-10 rounded-full">
                <img
                  :src="globalStore.currentCharacter.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(globalStore.currentCharacter.name)}&size=40&background=6366f1&color=fff`"
                  :alt="globalStore.currentCharacter.name"
                />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm truncate">{{ globalStore.currentCharacter.name }}</p>
              <p class="text-xs text-base-content/60 truncate">当前对话角色</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史会话 -->
    <div class="flex-1 overflow-y-auto">
      <div class="px-4">
        <div class="divider text-xs text-base-content/50">
          <span>历史会话</span>
        </div>
      </div>

      <div class="px-4 pb-4">
        <!-- 加载状态 -->
        <div v-if="chatStore.loading" class="text-center py-8">
          <span class="loading loading-spinner loading-md"></span>
          <p class="text-sm text-base-content/60 mt-2">加载中...</p>
        </div>

        <!-- 会话列表 -->
        <div v-else-if="chatStore.sessions.length > 0" class="space-y-2">
          <div
            v-for="session in chatStore.sessions"
            :key="session.id"
            class="chat-history-item p-3 rounded-lg cursor-pointer border border-transparent hover:border-primary hover:bg-base-200 transition-all duration-200"
            :class="{ 'bg-primary text-primary-content': currentSessionId === session.id }"
            @click="loadSession(session)"
          >
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="w-8 h-8 rounded-full bg-accent text-accent-content text-xs">
                  {{ session.character_name.charAt(0) }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ session.character_name }}</p>
                <p class="text-xs opacity-70 truncate">{{ session.last_message }}</p>
                <p class="text-xs opacity-50 mt-1">{{ formatRelativeTime(session.last_activity) }}</p>
              </div>
            </div>

            <!-- 会话操作 -->
            <div class="flex gap-1 mt-2">
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
        <div v-else class="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
          </svg>
          <p class="text-sm text-base-content/60">暂无历史会话</p>
          <p class="text-xs text-base-content/40 mt-1">选择角色开始对话</p>
        </div>
      </div>
    </div>

    <!-- 侧边栏底部 -->
    <div class="p-4 border-t border-base-300">
      <router-link
        to="/settings"
        class="btn btn-ghost w-full justify-start nav-hover focus-primary"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-sm">设置</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatStore, type ChatSession } from '@/stores/chat';
import { useCharactersStore } from '@/stores/characters';
import { useGlobalStore } from '@/stores/global';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const charactersStore = useCharactersStore();
const globalStore = useGlobalStore();

// 计算属性
const currentSessionId = computed(() => {
  return chatStore.currentSession?.id;
});

// 方法
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

const loadSession = async (session: ChatSession) => {
  try {
    // 加载会话消息
    await chatStore.loadSessionMessages(session.id);

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

// 生命周期
onMounted(async () => {
  try {
    await chatStore.fetchSessions();
  } catch (error) {
    console.error('Failed to fetch chat sessions:', error);
  }
});
</script>

<style scoped>
.nav-hover:hover {
  background-color: rgba(99, 102, 241, 0.1);
  transform: translateX(4px);
}

.nav-hover.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(236, 72, 153, 1) 100%);
  color: white;
}

.chat-history-item:hover {
  transform: translateX(2px);
}

.focus-primary:focus {
  outline: 2px solid rgba(99, 102, 241, 1);
  outline-offset: 2px;
}
</style>