<template>
  <div class="min-h-screen bg-base-100 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- 面包屑导航 -->
      <div class="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <router-link to="/" class="link link-hover">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              主页
            </router-link>
          </li>
          <li><span class="text-base-content/60">用户设置</span></li>
        </ul>
      </div>

      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-base-content mb-2">用户设置</h1>
        <p class="text-base-content/70">个性化你的AI聊天体验</p>
      </div>

      <!-- 设置内容 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：设置选项 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 界面设置 -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body">
              <h2 class="card-title text-xl mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 6.5h9m-9 3h9m-9 3h9M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                界面设置
              </h2>

              <div class="space-y-4">
                <!-- 主题设置 -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">主题模式</span>
                  </label>
                  <div class="flex gap-4">
                    <button
                      @click="setTheme('light')"
                      class="btn btn-outline flex-1"
                      :class="{ 'btn-primary': currentTheme === 'light' }"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      浅色主题
                    </button>
                    <button
                      @click="setTheme('dark')"
                      class="btn btn-outline flex-1"
                      :class="{ 'btn-primary': currentTheme === 'dark' }"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      深色主题
                    </button>
                  </div>
                </div>

                <!-- 语言设置 -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">界面语言</span>
                  </label>
                  <select v-model="settings.language" class="select select-bordered focus:select-primary">
                    <option value="zh-CN">简体中文</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 聊天设置 -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body">
              <h2 class="card-title text-xl mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                </svg>
                聊天设置
              </h2>

              <div class="space-y-4">
                <!-- 自动语音播放 -->
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" v-model="settings.autoPlayVoice" class="toggle toggle-primary">
                    <div>
                      <span class="label-text font-medium">自动播放AI回复语音</span>
                      <div class="label-text-alt text-base-content/60">AI回复后自动播放语音</div>
                    </div>
                  </label>
                </div>

                <!-- 显示时间戳 -->
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" v-model="settings.showTimestamp" class="toggle toggle-primary">
                    <div>
                      <span class="label-text font-medium">显示消息时间戳</span>
                      <div class="label-text-alt text-base-content/60">在聊天界面显示详细的时间信息</div>
                    </div>
                  </label>
                </div>

                <!-- 自动保存聊天记录 -->
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" v-model="settings.autoSaveHistory" class="toggle toggle-primary">
                    <div>
                      <span class="label-text font-medium">自动保存聊天记录</span>
                      <div class="label-text-alt text-base-content/60">自动保存与AI的对话历史</div>
                    </div>
                  </label>
                </div>

                <!-- 回复速度 -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">AI回复速度</span>
                    <span class="label-text-alt">{{ getSpeedLabel(settings.replySpeed) }}</span>
                  </label>
                  <input
                    type="range"
                    v-model="settings.replySpeed"
                    min="1"
                    max="5"
                    class="range range-primary range-sm"
                  />
                  <div class="w-full flex justify-between text-xs px-2 text-base-content/60">
                    <span>慢</span>
                    <span>正常</span>
                    <span>快</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 隐私设置 -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body">
              <h2 class="card-title text-xl mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                隐私设置
              </h2>

              <div class="space-y-4">
                <!-- 数据收集 -->
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" v-model="settings.allowDataCollection" class="toggle toggle-accent">
                    <div>
                      <span class="label-text font-medium">允许数据收集</span>
                      <div class="label-text-alt text-base-content/60">帮助改善AI对话质量（匿名）</div>
                    </div>
                  </label>
                </div>

                <!-- 个性化推荐 -->
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" v-model="settings.personalizedRecommendation" class="toggle toggle-accent">
                    <div>
                      <span class="label-text font-medium">个性化推荐</span>
                      <div class="label-text-alt text-base-content/60">基于使用习惯推荐角色和功能</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 高级设置 -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body">
              <h2 class="card-title text-xl mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                高级设置
              </h2>

              <div class="space-y-4">
                <!-- API配置 -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">API服务</span>
                  </label>
                  <select v-model="settings.apiProvider" class="select select-bordered focus:select-primary">
                    <option value="local">本地Ollama</option>
                    <option value="openai">OpenAI API</option>
                    <option value="claude">Claude API</option>
                  </select>
                </div>

                <!-- 模型选择 -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">AI模型</span>
                  </label>
                  <select v-model="settings.model" class="select select-bordered focus:select-primary">
                    <option value="llama2">Llama 2</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                  </select>
                </div>

                <!-- 温度设置 -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">创造性程度</span>
                    <span class="label-text-alt">{{ settings.temperature }}</span>
                  </label>
                  <input
                    type="range"
                    v-model="settings.temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    class="range range-warning range-sm"
                  />
                  <div class="w-full flex justify-between text-xs px-2 text-base-content/60">
                    <span>保守</span>
                    <span>平衡</span>
                    <span>创造</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button @click="saveSettings" class="btn btn-primary btn-lg shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              保存设置
            </button>
            <button @click="resetSettings" class="btn btn-outline btn-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重置为默认
            </button>
            <button @click="exportData" class="btn btn-secondary btn-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出数据
            </button>
          </div>
        </div>

        <!-- 右侧：用户信息和统计 -->
        <div class="lg:col-span-1">
          <div class="space-y-6 sticky top-8">
            <!-- 用户信息 -->
            <div class="card bg-base-100 shadow-lg border border-base-300">
              <div class="card-body">
                <h3 class="card-title text-lg mb-4">用户信息</h3>

                <div class="flex flex-col items-center text-center">
                  <div class="avatar mb-4">
                    <div class="w-20 h-20 rounded-full">
                      <img src="https://ui-avatars.com/api/?name=User&size=80&background=6366f1&color=fff" alt="User Avatar" />
                    </div>
                  </div>
                  <h4 class="text-lg font-semibold">用户</h4>
                  <p class="text-sm text-base-content/60">AI聊天爱好者</p>
                  <div class="badge badge-primary badge-sm mt-2">活跃用户</div>
                </div>

                <div class="divider"></div>

                <div class="stats stats-vertical shadow-none">
                  <div class="stat px-0">
                    <div class="stat-title">创建角色</div>
                    <div class="stat-value text-primary text-2xl">5</div>
                  </div>
                  <div class="stat px-0">
                    <div class="stat-title">聊天会话</div>
                    <div class="stat-value text-secondary text-2xl">23</div>
                  </div>
                  <div class="stat px-0">
                    <div class="stat-title">使用天数</div>
                    <div class="stat-value text-accent text-2xl">15</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 使用统计 -->
            <div class="card bg-base-100 shadow-lg border border-base-300">
              <div class="card-body">
                <h3 class="card-title text-lg mb-4">使用统计</h3>

                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span>今日对话</span>
                      <span>12 条</span>
                    </div>
                    <progress class="progress progress-primary w-full" value="12" max="50"></progress>
                  </div>

                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span>语音使用</span>
                      <span>8 分钟</span>
                    </div>
                    <progress class="progress progress-secondary w-full" value="8" max="30"></progress>
                  </div>

                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span>创建角色</span>
                      <span>5 个</span>
                    </div>
                    <progress class="progress progress-accent w-full" value="5" max="10"></progress>
                  </div>
                </div>
              </div>
            </div>

            <!-- 快捷操作 -->
            <div class="card bg-base-100 shadow-lg border border-base-300">
              <div class="card-body">
                <h3 class="card-title text-lg mb-4">快捷操作</h3>

                <div class="space-y-2">
                  <button @click="clearAllHistory" class="btn btn-ghost w-full justify-start text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    清除所有聊天记录
                  </button>

                  <button @click="clearCache" class="btn btn-ghost w-full justify-start text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    清除缓存数据
                  </button>

                  <router-link to="/create" class="btn btn-ghost w-full justify-start text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    创建新角色
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useGlobalStore } from '@/stores/global';
import { useChatStore } from '@/stores/chat';

const globalStore = useGlobalStore();
const chatStore = useChatStore();

// 响应式数据
const currentTheme = ref('light');

const settings = reactive({
  language: 'zh-CN',
  autoPlayVoice: true,
  showTimestamp: true,
  autoSaveHistory: true,
  replySpeed: 3,
  allowDataCollection: true,
  personalizedRecommendation: true,
  apiProvider: 'local',
  model: 'llama2',
  temperature: 0.7
});

// 方法
const getSpeedLabel = (speed: number) => {
  const labels = ['很慢', '慢', '正常', '快', '很快'];
  return labels[speed - 1] || '正常';
};

const setTheme = (theme: string) => {
  currentTheme.value = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  globalStore.showNotification(`已切换到${theme === 'light' ? '浅色' : '深色'}主题`, 'success');
};

const saveSettings = () => {
  // 保存设置到 localStorage
  localStorage.setItem('userSettings', JSON.stringify(settings));
  globalStore.showNotification('设置已保存', 'success');
};

const resetSettings = () => {
  if (confirm('确定要重置所有设置为默认值吗？')) {
    // 重置设置
    Object.assign(settings, {
      language: 'zh-CN',
      autoPlayVoice: true,
      showTimestamp: true,
      autoSaveHistory: true,
      replySpeed: 3,
      allowDataCollection: true,
      personalizedRecommendation: true,
      apiProvider: 'local',
      model: 'llama2',
      temperature: 0.7
    });

    // 重置主题
    setTheme('light');

    globalStore.showNotification('设置已重置为默认值', 'info');
  }
};

const exportData = () => {
  try {
    const exportData = {
      settings,
      chatHistory: chatStore.sessions,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ai-chat-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    globalStore.showNotification('数据导出成功', 'success');
  } catch (error) {
    console.error('Export failed:', error);
    globalStore.showNotification('数据导出失败', 'error');
  }
};

const clearAllHistory = () => {
  if (confirm('确定要清除所有聊天记录吗？此操作不可撤销。')) {
    // 清除聊天历史
    chatStore.sessions.splice(0);
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatSessions');

    globalStore.showNotification('所有聊天记录已清除', 'info');
  }
};

const clearCache = () => {
  if (confirm('确定要清除缓存数据吗？')) {
    // 清除缓存但保留重要设置
    const keysToKeep = ['theme', 'userSettings', 'currentCharacter'];
    const itemsToKeep: { [key: string]: string | null } = {};

    keysToKeep.forEach(key => {
      itemsToKeep[key] = localStorage.getItem(key);
    });

    localStorage.clear();

    keysToKeep.forEach(key => {
      if (itemsToKeep[key] !== null) {
        localStorage.setItem(key, itemsToKeep[key]!);
      }
    });

    globalStore.showNotification('缓存已清除', 'info');
  }
};

// 初始化
onMounted(() => {
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme') || 'light';
  currentTheme.value = savedTheme;

  // 恢复用户设置
  const savedSettings = localStorage.getItem('userSettings');
  if (savedSettings) {
    try {
      Object.assign(settings, JSON.parse(savedSettings));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }
});
</script>