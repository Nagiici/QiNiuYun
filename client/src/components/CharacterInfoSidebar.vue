<template>
  <div class="p-4 space-y-6">
    <!-- 人物信息 -->
    <div v-if="character" class="card bg-base-200 shadow-sm">
      <div class="card-body">
        <div class="flex items-center space-x-4">
          <div class="avatar">
            <div class="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img :src="character.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&size=64&background=6366f1&color=fff`" :alt="character.name" />
            </div>
          </div>
          <div>
            <h2 class="card-title text-xl font-bold">{{ character.name }}</h2>
          </div>
        </div>
        <div class="divider my-2"></div>
        <div class="space-y-2 text-sm">
          <p><strong class="font-medium">性格:</strong> {{ character.personality || '未定义' }}</p>
          <div>
            <strong class="font-medium">标签:</strong>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="tag in character.tags" :key="tag" class="badge badge-neutral">{{ tag }}</span>
            </div>
          </div>
          <div class="pt-2">
            <strong class="font-medium">简介:</strong>
            <p class="text-base-content/80 whitespace-pre-wrap">{{ character.description || '暂无简介' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话数据 -->
    <div class="card bg-base-200 shadow-sm">
      <div class="card-body">
        <h3 class="card-title text-base font-semibold">对话统计</h3>
        <div class="stats stats-vertical shadow-inner bg-base-100">
          <div class="stat">
            <div class="stat-title">持续时间</div>
            <div class="stat-value text-lg">{{ conversationDuration }}</div>
            <div class="stat-desc">从首次对话开始</div>
          </div>
          <div class="stat">
            <div class="stat-title">消息总数</div>
            <div class="stat-value text-lg">{{ messageCount }}</div>
            <div class="stat-desc">包含用户与AI</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import type { PropType } from 'vue';
import type { Character } from '@/stores/characters';
import type { ChatMessage } from '@/stores/chat';

const props = defineProps({
  character: {
    type: Object as PropType<Character | null>,
    required: true,
  },
  messages: {
    type: Array as PropType<ChatMessage[]>,
    required: true,
  },
});

const now = ref(new Date());
let timer: number;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const messageCount = computed(() => props.messages.length);

const conversationDuration = computed(() => {
  if (props.messages.length === 0) {
    return '00:00:00';
  }
  const startTime = new Date(props.messages[0].timestamp).getTime();
  const diff = now.value.getTime() - startTime;

  if (diff < 0) return '00:00:00';

  const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
  const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
});
</script>
<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>