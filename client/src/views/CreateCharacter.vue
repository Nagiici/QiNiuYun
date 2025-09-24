<template>
  <div class="min-h-screen bg-base-100 p-4">
    <div class="max-w-7xl mx-auto">
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
          <li><span class="text-base-content/60">创建人物</span></li>
        </ul>
      </div>

      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-base-content mb-2">创建AI人物</h1>
        <p class="text-base-content/70">自定义你的AI角色，设置性格特征和对话风格</p>
      </div>

      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：角色创建表单 -->
        <div class="lg:col-span-2">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- 基础信息 -->
            <div class="card bg-base-100 shadow-lg border border-base-300">
              <div class="card-body">
                <h2 class="card-title text-xl mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  基础信息
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">人物名称</span>
                      <span class="label-text-alt text-error">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="characterData.name"
                      placeholder="输入人物名称"
                      class="input input-bordered focus:input-primary"
                      required
                    />
                    <label class="label">
                      <span class="label-text-alt text-base-content/60">为你的AI角色起一个独特的名字</span>
                    </label>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">预设性格</span>
                    </label>
                    <select v-model="characterData.personality_preset" class="select select-bordered focus:select-primary">
                      <option value="">选择预设性格</option>
                      <option value="friendly">友善亲切</option>
                      <option value="professional">专业严谨</option>
                      <option value="humorous">幽默风趣</option>
                      <option value="wise">睿智深沉</option>
                      <option value="energetic">活泼开朗</option>
                      <option value="mysterious">神秘莫测</option>
                    </select>
                    <label class="label">
                      <span class="label-text-alt text-base-content/60">选择一个基础性格模板</span>
                    </label>
                  </div>
                </div>

                <div class="form-control mt-4">
                  <label class="label">
                    <span class="label-text font-medium">人物描述</span>
                    <span class="label-text-alt text-error">*</span>
                  </label>
                  <textarea
                    v-model="characterData.description"
                    class="textarea textarea-bordered focus:textarea-primary h-24"
                    placeholder="描述你的AI角色的背景、特点和个性..."
                    required
                  ></textarea>
                  <label class="label">
                    <span class="label-text-alt text-base-content/60">详细描述有助于AI更好地理解角色定位</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 高级设置 -->
            <div class="space-y-2">
              <!-- 自定义指令 -->
              <div class="collapse collapse-arrow bg-base-100 border border-base-300 shadow-lg">
                <input type="checkbox" />
                <div class="collapse-title font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  自定义指令
                </div>
                <div class="collapse-content">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">系统指令</span>
                    </label>
                    <textarea
                      v-model="characterData.custom_instructions"
                      class="textarea textarea-bordered focus:textarea-primary h-32"
                      placeholder="输入自定义的系统指令，用于精确控制AI的行为模式..."
                    ></textarea>
                    <label class="label">
                      <span class="label-text-alt text-base-content/60">高级用户可以通过自定义指令实现更精确的角色控制</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- 输入输出样例 -->
              <div class="collapse collapse-arrow bg-base-100 border border-base-300 shadow-lg">
                <input type="checkbox" />
                <div class="collapse-title font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                  </svg>
                  输入输出样例
                </div>
                <div class="collapse-content">
                  <div class="space-y-4">
                    <div
                      v-for="(example, index) in characterData.examples"
                      :key="index"
                      class="example-pair p-4 border border-base-300 rounded-lg bg-base-200"
                    >
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                          <label class="label">
                            <span class="label-text">用户输入示例</span>
                          </label>
                          <textarea
                            v-model="example.input"
                            class="textarea textarea-bordered focus:textarea-primary h-20"
                            placeholder="用户可能会说的话..."
                          ></textarea>
                        </div>
                        <div class="form-control">
                          <label class="label">
                            <span class="label-text">AI回复示例</span>
                          </label>
                          <textarea
                            v-model="example.output"
                            class="textarea textarea-bordered focus:textarea-primary h-20"
                            placeholder="AI应该如何回复..."
                          ></textarea>
                        </div>
                      </div>
                      <button
                        type="button"
                        @click="removeExample(index)"
                        class="btn btn-ghost btn-sm text-error mt-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        移除
                      </button>
                    </div>
                  </div>
                  <div class="flex gap-2 mt-4">
                    <button type="button" @click="addExample" class="btn btn-outline btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      添加样例
                    </button>
                  </div>
                </div>
              </div>

              <!-- 故事背景 -->
              <div class="collapse collapse-arrow bg-base-100 border border-base-300 shadow-lg">
                <input type="checkbox" />
                <div class="collapse-title font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  故事背景
                </div>
                <div class="collapse-content">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">背景故事</span>
                    </label>
                    <textarea
                      v-model="characterData.story_background"
                      class="textarea textarea-bordered focus:textarea-primary h-32"
                      placeholder="描述角色的世界观、历史背景或特殊设定..."
                    ></textarea>
                    <label class="label">
                      <span class="label-text-alt text-base-content/60">丰富的背景故事能让对话更加生动有趣</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button type="submit" class="btn btn-primary btn-lg shadow-lg" :disabled="loading">
                <span v-if="loading" class="loading loading-spinner loading-sm mr-2"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                </svg>
                保存人物并聊天
              </button>
              <button type="button" @click="saveAndReturn" class="btn btn-secondary btn-lg shadow-lg" :disabled="loading">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                保存人物并返回主页
              </button>
              <router-link to="/" class="btn btn-outline btn-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                取消
              </router-link>
            </div>
          </form>
        </div>

        <!-- 右侧：角色头像和性格设置 -->
        <div class="lg:col-span-1">
          <div class="space-y-6 sticky top-8">
            <!-- 角色头像上传 -->
            <div class="card bg-base-100 shadow-lg border border-base-300">
              <div class="card-body">
                <h3 class="card-title text-lg mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  人物头像
                </h3>

                <div class="form-control">
                  <div
                    @click="$refs.avatarInput.click()"
                    class="avatar-upload-area border-2 border-dashed border-base-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  >
                    <div class="avatar-preview">
                      <div v-if="avatarPreview" class="w-32 h-32 mx-auto mb-4">
                        <img :src="avatarPreview" alt="Avatar Preview" class="w-full h-full rounded-full object-cover border-4 border-primary" />
                      </div>
                      <div v-else class="w-32 h-32 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p class="text-base-content/60 mb-2">点击上传头像</p>
                      <p class="text-sm text-base-content/40">支持 JPG、PNG 格式，建议尺寸 512x512</p>
                    </div>
                  </div>
                  <input
                    ref="avatarInput"
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleAvatarUpload"
                  />
                </div>
              </div>
            </div>

            <!-- 性格特征雷达图 -->
            <PersonalityRadar v-model="characterData.personality_data" />

            <!-- 测试输出 -->
            <div class="card bg-base-100 shadow-lg border border-base-300">
              <div class="card-body">
                <h3 class="card-title text-lg mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
                  </svg>
                  测试输出
                </h3>

                <div class="form-control mb-4">
                  <label class="label">
                    <span class="label-text">测试问题</span>
                  </label>
                  <input
                    type="text"
                    v-model="testInput"
                    placeholder="输入一个测试问题..."
                    class="input input-bordered focus:input-primary"
                  />
                </div>

                <button type="button" @click="testCharacterOutput" class="btn btn-primary btn-block mb-4" :disabled="testLoading">
                  <span v-if="testLoading" class="loading loading-spinner loading-sm mr-2"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 001.5-1.5V9c0-.828-.672-1.5-1.5-1.5M15 10h-1.5A1.5 1.5 0 0112 11.5v-.5c0-.828.672-1.5 1.5-1.5m6 5.5v.5a3 3 0 01-3 3h-6a3 3 0 01-3-3v-.5m14-5.5a2 2 0 00-2-2h-10a2 2 0 00-2 2m14 0v5.5m0-5.5a2 2 0 012 2v4a2 2 0 01-2 2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485A2 2 0 015.172 19h-2.343A2 2 0 011 17v-2.343a2 2 0 01.586-1.414L9.172 5.657A2 2 0 0111 4.414V7.343z" />
                  </svg>
                  测试输出
                </button>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">AI回复预览</span>
                  </label>
                  <div class="textarea textarea-bordered min-h-24 bg-base-200 text-base-content/70 p-4 whitespace-pre-wrap">
                    {{ testOutput || '在这里查看AI根据当前设置生成的回复...' }}
                  </div>
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
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCharactersStore } from '@/stores/characters';
import { useChatStore } from '@/stores/chat';
import { useGlobalStore } from '@/stores/global';
import PersonalityRadar from '@/components/PersonalityRadar.vue';

const router = useRouter();
const charactersStore = useCharactersStore();
const chatStore = useChatStore();
const globalStore = useGlobalStore();

// 响应式数据
const loading = ref(false);
const testLoading = ref(false);
const avatarPreview = ref<string | null>(null);
const testInput = ref('');
const testOutput = ref('');

const characterData = reactive({
  name: '',
  description: '',
  personality_preset: '',
  custom_instructions: '',
  story_background: '',
  is_public: false,
  avatar: null as string | null,
  personality_data: {
    energy: 50,
    friendliness: 50,
    humor: 50,
    professionalism: 50,
    creativity: 50,
    empathy: 50
  },
  examples: [] as Array<{ input: string; output: string }>
});

// 方法
const addExample = () => {
  characterData.examples.push({ input: '', output: '' });
};

const removeExample = (index: number) => {
  characterData.examples.splice(index, 1);
};

const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    globalStore.showNotification('请选择有效的图片文件', 'error');
    return;
  }

  // 验证文件大小 (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    globalStore.showNotification('图片文件不能超过5MB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string;
    characterData.avatar = avatarPreview.value;
  };
  reader.readAsDataURL(file);
};

const testCharacterOutput = () => {
  if (!testInput.value.trim()) {
    globalStore.showNotification('请输入测试问题', 'warning');
    return;
  }

  testLoading.value = true;

  // 模拟AI回复生成
  setTimeout(() => {
    testOutput.value = generateMockResponse(testInput.value);
    testLoading.value = false;
  }, 1500);
};

// 预设性格模板
const personalityPresets = {
  friendly: { energy: 70, friendliness: 90, humor: 60, professionalism: 50, creativity: 60, empathy: 80 },
  professional: { energy: 40, friendliness: 60, humor: 30, professionalism: 90, creativity: 50, empathy: 60 },
  humorous: { energy: 80, friendliness: 70, humor: 95, professionalism: 40, creativity: 85, empathy: 65 },
  wise: { energy: 30, friendliness: 70, humor: 40, professionalism: 80, creativity: 70, empathy: 90 },
  energetic: { energy: 95, friendliness: 80, humor: 75, professionalism: 50, creativity: 80, empathy: 70 },
  mysterious: { energy: 40, friendliness: 30, humor: 20, professionalism: 70, creativity: 90, empathy: 50 }
};

// 监听预设性格变化
watch(() => characterData.personality_preset, (newPreset) => {
  if (newPreset && personalityPresets[newPreset as keyof typeof personalityPresets]) {
    characterData.personality_data = { ...personalityPresets[newPreset as keyof typeof personalityPresets] };
  }
});

const generateMockResponse = (input: string): string => {
  const personality = characterData.personality_data;
  const name = characterData.name || '我';

  let response = `你好！我是${name}。`;

  if (personality.friendliness > 70) {
    response += '很高兴和你聊天！';
  }

  if (personality.humor > 70) {
    response += ' 😊';
  }

  if (personality.professionalism > 70) {
    response += `\n\n关于你的问题"${input}"，这确实是个很好的问题。`;
  } else {
    response += `\n\n关于"${input}"这个问题，`;
  }

  if (personality.creativity > 70) {
    response += '让我从一个独特的角度来回答...';
  }

  if (personality.empathy > 70) {
    response += '\n\n我理解你的想法，';
  }

  response += '\n\n这只是一个基于当前性格设置的模拟回复。实际的AI回复会更加智能和个性化。';

  return response;
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    globalStore.setLoading(true, '正在创建角色...');

    // 验证必填字段
    if (!characterData.name.trim() || !characterData.description.trim()) {
      globalStore.showNotification('请填写所有必填字段', 'error');
      return;
    }

    // 创建角色
    const newCharacter = await charactersStore.createCharacter(characterData);

    // 设置为当前角色
    globalStore.setCurrentCharacter(newCharacter);

    // 创建聊天会话
    await chatStore.createSession(newCharacter.id, newCharacter.name);

    globalStore.showNotification('角色创建成功！正在跳转到聊天页面...', 'success');

    // 跳转到聊天页面
    setTimeout(() => {
      router.push(`/chat/${newCharacter.id}`);
    }, 1500);
  } catch (error) {
    console.error('Failed to create character:', error);
    globalStore.showNotification('创建角色失败，请重试', 'error');
  } finally {
    loading.value = false;
    globalStore.setLoading(false);
  }
};

const saveAndReturn = async () => {
  try {
    loading.value = true;
    globalStore.setLoading(true, '正在保存角色...');

    // 验证必填字段
    if (!characterData.name.trim() || !characterData.description.trim()) {
      globalStore.showNotification('请填写所有必填字段', 'error');
      return;
    }

    // 创建角色
    await charactersStore.createCharacter(characterData);

    globalStore.showNotification('角色保存成功！', 'success');

    // 返回主页
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (error) {
    console.error('Failed to save character:', error);
    globalStore.showNotification('保存角色失败，请重试', 'error');
  } finally {
    loading.value = false;
    globalStore.setLoading(false);
  }
};
</script>

<style scoped>
.example-pair:hover {
  background: rgba(99, 102, 241, 0.02);
  border-color: rgba(99, 102, 241, 0.3);
}

.avatar-upload-area:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 1);
}
</style>