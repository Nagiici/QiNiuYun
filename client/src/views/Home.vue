<template>
  <div class="min-h-screen bg-base-100">
    <!-- 侧边栏 -->
    <div class="drawer">
      <input id="drawer-toggle" type="checkbox" class="drawer-toggle" v-model="sidebarOpen" />

      <!-- 主内容区域 -->
      <div class="drawer-content flex flex-col">
        <!-- 移动端菜单按钮 -->
        <div class="navbar lg:hidden bg-base-100 border-b border-base-300">
          <div class="flex-none">
            <label for="drawer-toggle" class="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div class="flex-1">
            <h1 class="text-lg font-bold">AI人物聊天</h1>
          </div>
        </div>

        <!-- 主页内容 -->
        <div class="flex-1 lg:ml-80 p-4">
          <!-- Hero区域 -->
          <section class="hero min-h-96 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl mb-8">
            <div class="hero-content text-center max-w-4xl">
              <div class="bg-base-100/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <h1 class="text-5xl font-bold text-base-content mb-4 fade-in">
                  开启你的AI伴侣世界
                </h1>
                <p class="text-xl text-base-content/80 mb-6 slide-up">
                  定制专属AI角色，畅享智能对话
                </p>

                <!-- 体验功能按钮 -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <button
                    class="btn btn-primary btn-lg shadow-lg btn-hover-lift"
                    @click="startQuickChat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                    </svg>
                    免费体验对话
                  </button>

                  <router-link
                    to="/create"
                    class="btn btn-secondary btn-lg shadow-lg btn-hover-lift"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    创建新人物
                  </router-link>
                </div>

                <div class="flex items-center justify-center gap-8 text-lg text-base-content/70">
                  <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>创建</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <span>探索</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>连接</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 热门角色轮播 -->
          <section class="mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-3xl font-bold text-base-content">热门精选人物</h2>
              <div class="flex gap-2">
                <button
                  class="btn btn-sm"
                  :class="filterType === 'all' ? 'btn-primary' : 'btn-ghost'"
                  @click="filterType = 'all'"
                >
                  全部
                </button>
                <button
                  class="btn btn-sm"
                  :class="filterType === 'historical' ? 'btn-primary' : 'btn-ghost'"
                  @click="filterType = 'historical'"
                >
                  历史人物
                </button>
                <button
                  class="btn btn-sm"
                  :class="filterType === 'fictional' ? 'btn-primary' : 'btn-ghost'"
                  @click="filterType = 'fictional'"
                >
                  虚构角色
                </button>
              </div>
            </div>

            <div class="carousel carousel-center max-w-full space-x-4 bg-base-200/30 rounded-box p-4">
              <div
                v-for="character in filteredCharacters"
                :key="character.id"
                class="carousel-item"
              >
                <div class="card w-64 bg-base-100 shadow-lg hover:shadow-xl card-hover cursor-pointer transition-all duration-300"
                     @click="selectCharacter(character)">
                  <figure class="px-4 pt-4">
                    <img
                      :src="character.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&size=200&background=6366f1&color=fff`"
                      :alt="character.name"
                      class="rounded-xl w-full h-32 object-cover character-avatar"
                    />
                  </figure>
                  <div class="card-body p-4">
                    <h3 class="card-title text-lg">{{ character.name }}</h3>
                    <p class="text-sm text-base-content/70 line-clamp-2">
                      {{ character.description }}
                    </p>
                    <div class="card-actions justify-between items-center mt-4">
                      <div class="badge badge-secondary badge-sm">{{ getCharacterType(character) }}</div>
                      <button
                        class="btn btn-primary btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        @click.stop="quickChat(character)"
                      >
                        快速对话
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 角色网格 -->
          <section class="mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-3xl font-bold text-base-content">
                探索我们的AI人物宝库
              </h2>
              <div class="flex items-center gap-4">
                <!-- 搜索框 -->
                <div class="form-control">
                  <div class="input-group">
                    <input
                      type="text"
                      placeholder="搜索人物..."
                      class="input input-bordered input-sm"
                      v-model="searchQuery"
                    />
                    <button class="btn btn-square btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- 排序选择 -->
                <div class="dropdown dropdown-end">
                  <div tabindex="0" role="button" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    排序
                  </div>
                  <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a @click="sortBy = 'name'">按名称排序</a></li>
                    <li><a @click="sortBy = 'newest'">最新添加</a></li>
                    <li><a @click="sortBy = 'popular'">最受欢迎</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div
                v-for="character in sortedCharacters"
                :key="character.id"
                class="character-card"
              >
                <div class="card bg-base-100 shadow-lg hover:shadow-xl card-hover group cursor-pointer transition-all duration-300"
                     @click="selectCharacter(character)">
                  <figure class="px-4 pt-4">
                    <img
                      :src="character.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&size=280&background=6366f1&color=fff`"
                      :alt="character.name"
                      class="rounded-xl w-full h-48 object-cover character-avatar"
                    />
                  </figure>
                  <div class="card-body p-4">
                    <h3 class="card-title text-lg mb-2">{{ character.name }}</h3>
                    <p class="text-sm text-base-content/70 mb-4 line-clamp-3">
                      {{ character.description }}
                    </p>
                    <div class="card-actions justify-between items-center">
                      <div class="badge badge-secondary badge-sm">{{ getCharacterType(character) }}</div>
                      <button
                        class="btn btn-primary btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        @click.stop="quickChat(character)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                        </svg>
                        快速对话
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 没有角色时的提示 -->
            <div v-if="sortedCharacters.length === 0" class="text-center py-12">
              <div class="text-6xl mb-4">🤖</div>
              <h3 class="text-2xl font-bold mb-2">暂无匹配的角色</h3>
              <p class="text-base-content/60 mb-6">尝试调整搜索条件或创建新的AI角色</p>
              <router-link to="/create" class="btn btn-primary">
                创建新角色
              </router-link>
            </div>
          </section>

          <!-- 创建角色CTA -->
          <section class="py-16 px-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl">
            <div class="max-w-4xl mx-auto text-center">
              <div class="bg-base-100/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <h2 class="text-4xl font-bold text-base-content mb-4">
                  没有找到心仪的人物？
                </h2>
                <p class="text-xl text-base-content/80 mb-8">
                  立即创建你的专属AI伴侣！
                </p>

                <div class="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                  <div class="flex items-center gap-3 text-base-content/70">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09" />
                    </svg>
                    <span>个性化定制</span>
                  </div>
                  <div class="flex items-center gap-3 text-base-content/70">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 8.25c0-2.485-2.099-4.5-4.687-4.5-1.936 0-3.598 1.126-4.313 2.733-.715-1.607-2.377-2.733-4.312-2.733C5.098 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span>独特性格</span>
                  </div>
                  <div class="flex items-center gap-3 text-base-content/70">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.51.041-1.02.072v3.091l-3-3q-2.031 0-4.02-.163a2.1 2.1 0 01-.825-.242m9.345-8.334a2 2 0 00-.476-.095 48.6 48.6 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.5 48.5 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.865.113 1.74.194V21l4.155-4.155" />
                    </svg>
                    <span>智能对话</span>
                  </div>
                </div>

                <router-link
                  to="/create"
                  class="btn btn-primary btn-lg shadow-lg hover:shadow-xl btn-hover-lift"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  创建新人物
                </router-link>

                <div class="mt-6 text-sm text-base-content/60">
                  <p>💡 提示：可以基于历史人物、虚构角色或完全原创的设定来创建</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="drawer-side">
        <label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
        <aside class="w-80 min-h-full bg-base-100 text-base-content border-r border-base-300">
          <ChatSidebar />
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCharactersStore } from '@/stores/characters';
import { useChatStore } from '@/stores/chat';
import { useGlobalStore } from '@/stores/global';
import ChatSidebar from '@/components/ChatSidebar.vue';

const router = useRouter();
const charactersStore = useCharactersStore();
const chatStore = useChatStore();
const globalStore = useGlobalStore();

// 响应式数据
const sidebarOpen = ref(false);
const filterType = ref('all');
const searchQuery = ref('');
const sortBy = ref('popular');

// 计算属性
const filteredCharacters = computed(() => {
  let filtered = charactersStore.characters;

  // 按类型筛选
  if (filterType.value !== 'all') {
    filtered = filtered.filter(character =>
      getCharacterType(character).toLowerCase().includes(filterType.value)
    );
  }

  // 搜索筛选
  if (searchQuery.value.trim()) {
    filtered = charactersStore.searchCharacters(searchQuery.value);
  }

  return filtered.slice(0, 8); // 轮播只显示前8个
});

const sortedCharacters = computed(() => {
  let result = filteredCharacters.value;

  switch (sortBy.value) {
    case 'name':
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      result = [...result].sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      break;
    case 'popular':
    default:
      // 模拟热门度排序
      result = [...result].sort(() => Math.random() - 0.5);
      break;
  }

  return result;
});

// 方法
const getCharacterType = (character: any) => {
  const preset = character.personality_preset || 'friendly';
  const typeMap: { [key: string]: string } = {
    friendly: '友善',
    professional: '专业',
    humorous: '幽默',
    wise: '智慧',
    energetic: '活泼',
    mysterious: '神秘',
    brave: '勇敢',
    historical: '历史人物',
    fictional: '虚构角色',
    scientist: '科学家'
  };
  return typeMap[preset] || '角色';
};

const selectCharacter = (character: any) => {
  globalStore.setCurrentCharacter(character);
  router.push(`/chat/${character.id}`);
};

const quickChat = async (character: any) => {
  try {
    globalStore.setLoading(true, '正在启动对话...');

    // 创建新的聊天会话
    await chatStore.createSession(character.id, character.name);

    // 跳转到聊天页面
    globalStore.setCurrentCharacter(character);
    router.push(`/chat/${character.id}`);
  } catch (error) {
    console.error('Failed to start quick chat:', error);
    globalStore.showNotification('启动对话失败，请重试', 'error');
  } finally {
    globalStore.setLoading(false);
  }
};

const startQuickChat = () => {
  // 随机选择一个默认角色进行体验
  const defaultCharacters = charactersStore.characters.slice(0, 3);
  if (defaultCharacters.length > 0) {
    const randomCharacter = defaultCharacters[Math.floor(Math.random() * defaultCharacters.length)];
    quickChat(randomCharacter);
  } else {
    globalStore.showNotification('暂无可用角色，请先创建一个角色', 'warning');
    router.push('/create');
  }
};

// 生命周期
onMounted(async () => {
  try {
    globalStore.setLoading(true, '正在加载角色列表...');
    await charactersStore.fetchCharacters();
    await chatStore.fetchSessions();
  } catch (error) {
    console.error('Failed to load data:', error);
    globalStore.showNotification('加载失败，请检查网络连接', 'error');
  } finally {
    globalStore.setLoading(false);
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.carousel {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.carousel::-webkit-scrollbar {
  display: none;
}
</style>