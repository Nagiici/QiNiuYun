<template>
  <div class="virtual-message-container" ref="containerRef">
    <div
      :style="{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative'
      }"
    >
      <div
        v-for="item in virtualizer.getVirtualItems()"
        :key="item.key"
        :data-index="item.index"
        :ref="virtualizer.measureElement"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${item.start}px)`,
        }"
      >
        <div class="message-item" :class="getMessageClass(messages[item.index])">
          <!-- 消息头部：发送者和时间 -->
          <div class="message-header">
            <span class="message-sender">
              {{ messages[item.index].sender === 'user' ? '你' : '角色' }}
            </span>
            <span class="message-time">
              {{ formatTime(messages[item.index].timestamp) }}
            </span>
          </div>

          <!-- 消息内容 -->
          <div class="message-content">
            <div class="message-bubble">
              {{ messages[item.index].content }}
            </div>
          </div>

          <!-- 语音消息 -->
          <div v-if="messages[item.index].voice_url" class="voice-controls">
            <button
              class="btn btn-sm btn-circle"
              @click="playVoice(messages[item.index].voice_url!)"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
              </svg>
            </button>
          </div>

          <!-- 情感标识 -->
          <div v-if="messages[item.index].emotion" class="emotion-indicator">
            <span class="emotion-tag">{{ getEmotionText(messages[item.index].emotion!) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 滚动到底部按钮 -->
    <Transition name="fade">
      <button
        v-if="showScrollToBottom"
        class="scroll-to-bottom-btn btn btn-primary btn-circle btn-sm"
        @click="scrollToBottom"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';

interface Message {
  id?: number;
  session_id: string;
  sender: 'user' | 'ai';
  message_type: 'text' | 'voice';
  content: string;
  voice_url?: string;
  emotion?: string;
  timestamp: string;
}

interface Props {
  messages: Message[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  'scroll-to-bottom': [];
}>();

// 响应式引用
const containerRef = ref<HTMLElement>();
const showScrollToBottom = ref(false);

// 虚拟化设置
const virtualizer = useVirtualizer({
  count: computed(() => props.messages.length),
  getScrollElement: () => containerRef.value,
  estimateSize: () => 80, // 估计消息高度
  overscan: 5, // 额外渲染的项目数
});

// 消息样式类
const getMessageClass = (message: Message) => {
  return {
    'message-user': message.sender === 'user',
    'message-ai': message.sender === 'ai',
    'message-voice': message.message_type === 'voice'
  };
};

// 时间格式化
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 情感文本映射
const getEmotionText = (emotion: string) => {
  const emotionMap: Record<string, string> = {
    'happy': '😊',
    'sad': '😢',
    'excited': '🤩',
    'calm': '😌',
    'angry': '😠',
    'surprised': '😲',
    'confused': '😕',
    'thinking': '🤔'
  };
  return emotionMap[emotion] || '😊';
};

// 播放语音
const playVoice = (voiceUrl: string) => {
  const audio = new Audio(voiceUrl);
  audio.play().catch(console.error);
};

// 滚动到底部
const scrollToBottom = () => {
  if (containerRef.value) {
    const totalSize = virtualizer.getTotalSize();
    containerRef.value.scrollTo({
      top: totalSize,
      behavior: 'smooth'
    });
    showScrollToBottom.value = false;
  }
  emit('scroll-to-bottom');
};

// 监听滚动位置
const handleScroll = () => {
  if (!containerRef.value) return;

  const { scrollTop, scrollHeight, clientHeight } = containerRef.value;
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;

  showScrollToBottom.value = !isAtBottom && props.messages.length > 5;
};

// 自动滚动到新消息
const autoScrollToBottom = () => {
  nextTick(() => {
    if (containerRef.value) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.value;
      const wasAtBottom = scrollTop + clientHeight >= scrollHeight - 200;

      if (wasAtBottom) {
        scrollToBottom();
      }
    }
  });
};

// 监听消息变化
watch(() => props.messages.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    autoScrollToBottom();
  }
});

// 组件挂载
onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll);
  }

  // 初始滚动到底部
  nextTick(() => {
    scrollToBottom();
  });
});

// 组件卸载
onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.virtual-message-container {
  height: 100%;
  overflow: auto;
  position: relative;
  padding: 1rem;
  scroll-behavior: smooth;
}

.message-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.message-user {
  margin-left: auto;
  margin-right: 0;
  max-width: 80%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-ai {
  margin-left: 0;
  margin-right: auto;
  max-width: 80%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #1e293b;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.8;
}

.message-sender {
  font-weight: 600;
}

.message-time {
  opacity: 0.7;
}

.message-content {
  word-wrap: break-word;
  line-height: 1.5;
}

.message-bubble {
  padding: 0.5rem 0;
}

.voice-controls {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.emotion-indicator {
  margin-top: 0.25rem;
  display: flex;
  justify-content: flex-end;
}

.emotion-tag {
  font-size: 1.2rem;
}

.scroll-to-bottom-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 暗色主题适配 */
[data-theme="dark"] .message-ai {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .virtual-message-container {
    padding: 0.5rem;
  }

  .message-item {
    max-width: 90%;
  }

  .scroll-to-bottom-btn {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>