<template>
  <div class="min-h-screen bg-base-100 flex flex-col">
    <!-- 聊天界面头部 -->
    <header class="bg-base-100 border-b border-base-300 p-4">
      <div class="flex items-center justify-between max-w-4xl mx-auto">
        <!-- 左侧：返回按钮和角色信息 -->
        <div class="flex items-center gap-4">
          <button @click="$router.push('/')" class="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div v-if="currentCharacter" class="flex items-center gap-3">
            <div class="avatar">
              <div class="w-12 h-12 rounded-full">
                <img
                  :src="currentCharacter.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCharacter.name)}&size=48&background=6366f1&color=fff`"
                  :alt="currentCharacter.name"
                />
              </div>
            </div>
            <div>
              <h1 class="font-bold text-lg">{{ currentCharacter.name }}</h1>
              <p class="text-sm text-base-content/60">{{ currentCharacter.description }}</p>
            </div>
          </div>
          <div v-else>
            <h1 class="font-bold text-lg">AI 聊天</h1>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="flex items-center gap-2">
          <!-- 语音开关 -->
          <button
            @click="voiceEnabled = !voiceEnabled"
            class="btn btn-ghost btn-circle"
            :class="{ 'text-primary': voiceEnabled }"
            title="切换语音功能"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <!-- 清空聊天 -->
          <button @click="clearChat" class="btn btn-ghost btn-circle" title="清空聊天记录">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 聊天消息区域 -->
    <main class="flex-1 overflow-y-auto p-4" ref="messagesContainer">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="text-center py-12">
          <div class="avatar mb-6">
            <div class="w-20 h-20 rounded-full">
              <img
                :src="currentCharacter?.avatar || 'https://ui-avatars.com/api/?name=AI&size=80&background=6366f1&color=fff'"
                :alt="currentCharacter?.name || 'AI'"
              />
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-2">
            你好！我是{{ currentCharacter?.name || 'AI助手' }}
          </h2>
          <p class="text-base-content/70 mb-6">
            {{ currentCharacter?.description || '很高兴与你对话！有什么我可以帮助你的吗？' }}
          </p>
          <div class="flex flex-wrap gap-2 justify-center">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="sendMessage(suggestion)"
              class="btn btn-outline btn-sm"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-for="message in messages" :key="message.timestamp" class="message-bubble">
          <!-- 时间分隔线 -->
          <div v-if="shouldShowTimeStamp(message)" class="divider text-xs text-base-content/40">
            {{ formatTime(message.timestamp) }}
          </div>

          <!-- AI消息 -->
          <div v-if="message.sender === 'ai'" class="chat chat-start">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full relative">
                <img
                  :src="currentCharacter?.avatar || 'https://ui-avatars.com/api/?name=AI&size=40&background=6366f1&color=fff'"
                  :alt="currentCharacter?.name || 'AI'"
                />
                <!-- 主动消息指示器 -->
                <div v-if="message.is_proactive" class="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center" title="主动消息">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="chat-header text-sm text-base-content/60 mb-1 flex items-center gap-2">
              {{ currentCharacter?.name || 'AI助手' }}
              <!-- 主动消息标签 -->
              <span v-if="message.is_proactive" class="badge badge-primary badge-xs">主动</span>
              <time class="text-xs opacity-50 ml-1">{{ formatMessageTime(message.timestamp) }}</time>
            </div>
            <div class="chat-bubble shadow-sm" :class="message.is_proactive ? 'bg-primary/10 border border-primary/20' : 'bg-base-200 text-base-content'">
              {{ message.content }}
            </div>
            <div class="chat-footer opacity-50 text-xs mt-1 flex items-center gap-2">
              <span>已读</span>
              <!-- 主动消息提示 -->
              <span v-if="message.is_proactive" class="text-primary">AI主动发起</span>
              <!-- 语音播放按钮 -->
              <button
                v-if="voiceEnabled && message.message_type === 'text'"
                @click="speakMessage(message.content)"
                class="btn btn-ghost btn-xs"
                title="播放语音"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 9v6a1 1 0 01-1 1H7a1 1 0 01-1-1V9a1 1 0 011-1h1a1 1 0 011 1zM4.5 8A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16h1.5L12 20V4L6 8H4.5z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 用户消息 -->
          <div v-else class="chat chat-end">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full">
                <img
                  src="https://ui-avatars.com/api/?name=User&size=40&background=ec4899&color=fff"
                  alt="User"
                />
              </div>
            </div>
            <div class="chat-header text-sm text-base-content/60 mb-1">
              <time class="text-xs opacity-50 mr-1">{{ formatMessageTime(message.timestamp) }}</time>
              我
            </div>
            <div class="chat-bubble chat-bubble-primary text-primary-content shadow-sm">
              {{ message.content }}
            </div>
            <div class="chat-footer opacity-50 text-xs mt-1">
              已发送
            </div>
          </div>
        </div>

        <!-- AI思考中指示器 -->
        <div v-if="chatStore.typing" class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img
                :src="currentCharacter?.avatar || 'https://ui-avatars.com/api/?name=AI&size=40&background=6366f1&color=fff'"
                :alt="currentCharacter?.name || 'AI'"
              />
            </div>
          </div>
          <div class="chat-bubble bg-base-200 text-base-content shadow-sm">
            <span class="loading loading-dots loading-md"></span>
          </div>
        </div>
      </div>
    </main>

    <!-- 消息输入区域 -->
    <footer class="bg-base-100 border-t border-base-200 p-4">
      <div class="max-w-4xl mx-auto flex items-end gap-2">
        <!-- 语音录制按钮 -->
        <button
          v-if="voiceEnabled"
          @mousedown="startVoiceRecording"
          @mouseup="stopVoiceRecording"
          @touchstart="startVoiceRecording"
          @touchend="stopVoiceRecording"
          class="btn btn-circle"
          :class="isRecording ? 'btn-error' : 'btn-ghost'"
          title="按住录音"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <!-- 附件按钮 -->
        <button class="btn btn-ghost btn-circle" title="发送图片">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </button>

        <!-- 消息输入框 -->
        <textarea
          ref="messageInput"
          v-model="newMessage"
          @keydown="handleKeydown"
          @input="adjustTextareaHeight"
          placeholder="输入消息..."
          class="textarea textarea-bordered flex-1 resize-none leading-tight max-h-32"
          rows="1"
        ></textarea>

        <!-- 发送按钮 -->
        <button
          @click="sendUserMessage"
          :disabled="!newMessage.trim() || chatStore.typing"
          class="btn btn-primary shadow-sm"
          title="发送消息"
        >
          <span class="hidden sm:inline">发送</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      <!-- 录音指示器 -->
      <div v-if="isRecording" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-base-100 p-8 rounded-lg shadow-lg text-center">
          <div class="text-6xl mb-4">🎤</div>
          <div class="flex justify-center mb-4">
            <div v-for="i in 5" :key="i" class="voice-wave"></div>
          </div>
          <p class="text-lg font-medium mb-2">正在录音...</p>
          <p class="text-sm text-base-content/60">松开结束录音</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatStore, type ChatMessage } from '@/stores/chat';
import { useCharactersStore } from '@/stores/characters';
import { useGlobalStore } from '@/stores/global';
import { useNotifications } from '@/composables/useNotifications';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const charactersStore = useCharactersStore();
const globalStore = useGlobalStore();
const notifications = useNotifications();

// 响应式数据
const newMessage = ref('');
const voiceEnabled = ref(true);
const isRecording = ref(false);
const messagesContainer = ref<HTMLElement>();
const messageInput = ref<HTMLTextAreaElement>();

// 计算属性
const currentCharacter = computed(() => globalStore.currentCharacter);
const messages = computed(() => chatStore.messages);

// 建议回复
const suggestions = computed(() => {
  if (!currentCharacter.value) return ['你好', '介绍一下你自己', '我们聊什么呢？'];

  const character = currentCharacter.value;
  if (character.name === '哈利波特') {
    return ['告诉我霍格沃茨的故事', '你最喜欢的魔法咒语是什么？', '介绍一下你的朋友们'];
  } else if (character.name === '苏格拉底') {
    return ['什么是智慧？', '生活的意义是什么？', '我们如何获得真理？'];
  } else if (character.name === '爱因斯坦') {
    return ['解释一下相对论', '科学发现的过程是什么？', '想象力和知识哪个更重要？'];
  }

  return ['你好', '介绍一下你自己', '我们聊什么呢？'];
});

// 方法
const shouldShowTimeStamp = (message: ChatMessage) => {
  const messageIndex = messages.value.indexOf(message);
  if (messageIndex === 0) return true;

  const previousMessage = messages.value[messageIndex - 1];
  const currentTime = new Date(message.timestamp);
  const previousTime = new Date(previousMessage.timestamp);

  // 如果间隔超过5分钟，显示时间戳
  return currentTime.getTime() - previousTime.getTime() > 5 * 60 * 1000;
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const adjustTextareaHeight = () => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto';
    messageInput.value.style.height = `${Math.min(messageInput.value.scrollHeight, 128)}px`;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendUserMessage();
  }
};

const sendMessage = (content: string) => {
  newMessage.value = content;
  sendUserMessage();
};

const sendUserMessage = async () => {
  if (!newMessage.value.trim() || chatStore.typing) return;

  const content = newMessage.value.trim();
  newMessage.value = '';

  // 重置输入框高度
  if (messageInput.value) {
    messageInput.value.style.height = 'auto';
  }

  try {
    // 传递角色信息，以便在没有会话时自动创建
    const character = currentCharacter.value;
    await chatStore.sendMessage(
      content,
      'text',
      character?.id,
      character?.name
    );
    scrollToBottom();
  } catch (error) {
    console.error('Failed to send message:', error);
    globalStore.showNotification('发送消息失败，请重试', 'error');
  }
};

const clearChat = () => {
  if (confirm('确定要清空聊天记录吗？此操作不可撤销。')) {
    chatStore.messages.splice(0);
    globalStore.showNotification('聊天记录已清空', 'info');
  }
};

// 语音功能
const speakMessage = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    // 尝试使用中文语音
    const voices = speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice =>
      voice.lang.includes('zh') || voice.name.includes('Chinese')
    );
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    speechSynthesis.speak(utterance);
  } else {
    globalStore.showNotification('您的浏览器不支持语音合成功能', 'warning');
  }
};

const startVoiceRecording = () => {
  if (!voiceEnabled.value) return;

  isRecording.value = true;

  // 语音识别 (如果浏览器支持)
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      newMessage.value = transcript;
      isRecording.value = false;
    };

    recognition.onerror = () => {
      isRecording.value = false;
      globalStore.showNotification('语音识别失败，请重试', 'error');
    };

    recognition.onend = () => {
      isRecording.value = false;
    };

    recognition.start();
  } else {
    // 模拟录音功能
    setTimeout(() => {
      isRecording.value = false;
      globalStore.showNotification('您的浏览器不支持语音识别功能', 'warning');
    }, 2000);
  }
};

const stopVoiceRecording = () => {
  isRecording.value = false;
};

// 初始化
const initializeChat = async () => {
  const characterId = route.params.characterId as string;

  if (characterId && characterId !== 'undefined') {
    try {
      globalStore.setLoading(true, '正在加载角色信息...');

      // 强制清空消息输入框，避免重复消息显示
      newMessage.value = '';

      // 重置输入框高度
      if (messageInput.value) {
        messageInput.value.style.height = 'auto';
      }

      // 获取角色信息
      const character = await charactersStore.fetchCharacterById(Number(characterId));
      globalStore.setCurrentCharacter(character);

      // 检查是否需要切换到新角色（避免重复加载相同角色的数据）
      const shouldLoadNewSession = !chatStore.currentSession ||
                                  chatStore.currentSession.character_id !== Number(characterId);

      if (shouldLoadNewSession) {
        // 检查是否有现有会话
        const existingSession = chatStore.sessions.find(s => s.character_id === Number(characterId));

        if (existingSession) {
          // 如果找到现有会话，加载该会话的消息
          await chatStore.loadSessionMessages(existingSession.id);
          // 注册WebSocket会话
          notifications.registerSession(existingSession.id);
        } else {
          // 不立即创建新会话，等用户发送第一条消息时再创建
          chatStore.clearCurrentSession();
        }
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      globalStore.showNotification('加载聊天失败，请重试', 'error');
      router.push('/');
    } finally {
      globalStore.setLoading(false);
    }
  }

  // 自动滚动到底部
  scrollToBottom();
};

// 监听路由参数变化，当角色ID变化时重新初始化聊天
watch(() => route.params.characterId, async (newCharacterId, oldCharacterId) => {
  if (newCharacterId && newCharacterId !== oldCharacterId) {
    // 立即清理输入框，避免重复显示
    newMessage.value = '';

    // 清理当前聊天状态
    chatStore.clearCurrentSession();

    // 重新初始化聊天
    await initializeChat();
  }
});

// 生命周期
onMounted(async () => {
  await initializeChat();

  // 获取语音列表
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
  }
});
</script>

<style scoped>
.message-bubble {
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.voice-wave {
  display: inline-block;
  width: 4px;
  height: 16px;
  background: var(--color-primary);
  margin: 0 2px;
  border-radius: 2px;
  animation: pulse 1s infinite;
}

.voice-wave:nth-child(2) { animation-delay: 0.1s; }
.voice-wave:nth-child(3) { animation-delay: 0.2s; }
.voice-wave:nth-child(4) { animation-delay: 0.3s; }
.voice-wave:nth-child(5) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1.5); }
}

/* 自定义滚动条 */
main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>