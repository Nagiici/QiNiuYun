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

          <!-- 语音服务配置 -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body">
              <h2 class="card-title text-xl mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                语音服务配置
              </h2>

              <!-- TTS配置 -->
              <div class="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div class="collapse-title text-lg font-medium">
                  🎤 TTS语音合成服务
                  <span v-if="speechConfig.tts.currentProvider !== 'web'" class="badge badge-success badge-sm ml-2">已配置</span>
                </div>
                <div class="collapse-content">
                  <div class="space-y-4 pt-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">TTS服务提供商</span>
                      </label>
                      <select v-model="speechConfig.tts.currentProvider" @change="onTtsProviderChange" class="select select-bordered focus:select-primary">
                        <option value="web">浏览器内置 (免费)</option>
                        <option value="elevenlabs">ElevenLabs (高质量)</option>
                        <option value="openai">OpenAI TTS</option>
                        <option value="azure">Azure Speech</option>
                        <option value="google">Google Cloud TTS</option>
                      </select>
                    </div>

                    <!-- ElevenLabs配置 -->
                    <div v-if="speechConfig.tts.currentProvider === 'elevenlabs'" class="space-y-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">API密钥</span>
                          <button @click="testTtsConnection" :disabled="!speechConfig.tts.providers.elevenlabs.apiKey || testingTts" class="btn btn-ghost btn-xs">
                            <span v-if="testingTts" class="loading loading-spinner loading-xs"></span>
                            {{ testingTts ? '测试中...' : '测试连接' }}
                          </button>
                        </label>
                        <input
                          v-model="speechConfig.tts.providers.elevenlabs.apiKey"
                          type="password"
                          placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          class="input input-bordered focus:input-primary"
                        />
                      </div>
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">语音ID</span>
                        </label>
                        <select v-model="speechConfig.tts.providers.elevenlabs.voiceId" class="select select-bordered focus:select-primary">
                          <option value="21m00Tcm4TlvDq8ikWAM">Rachel (英语)</option>
                          <option value="AZnzlk1XvdvUeBnXmlld">Domi (英语)</option>
                          <option value="EXAVITQu4vr4xnSDxMaL">Bella (英语)</option>
                          <option value="MF3mGyEYCl7XYWbV9V6O">Elli (英语)</option>
                          <option value="TxGEqnHWrfWFTfGW9XjX">Josh (英语)</option>
                        </select>
                      </div>
                      <div class="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                          <span class="text-sm">获取API密钥：<a href="https://elevenlabs.io/" target="_blank" class="link">elevenlabs.io</a></span>
                        </div>
                      </div>
                    </div>

                    <!-- OpenAI TTS配置 -->
                    <div v-if="speechConfig.tts.currentProvider === 'openai'" class="space-y-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">API密钥</span>
                          <button @click="testTtsConnection" :disabled="!speechConfig.tts.providers.openai.apiKey || testingTts" class="btn btn-ghost btn-xs">
                            <span v-if="testingTts" class="loading loading-spinner loading-xs"></span>
                            {{ testingTts ? '测试中...' : '测试连接' }}
                          </button>
                        </label>
                        <input
                          v-model="speechConfig.tts.providers.openai.apiKey"
                          type="password"
                          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          class="input input-bordered focus:input-primary"
                        />
                      </div>
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">语音模型</span>
                        </label>
                        <select v-model="speechConfig.tts.providers.openai.voice" class="select select-bordered focus:select-primary">
                          <option value="alloy">Alloy</option>
                          <option value="echo">Echo</option>
                          <option value="fable">Fable</option>
                          <option value="onyx">Onyx</option>
                          <option value="nova">Nova</option>
                          <option value="shimmer">Shimmer</option>
                        </select>
                      </div>
                    </div>

                    <!-- Azure Speech配置 -->
                    <div v-if="speechConfig.tts.currentProvider === 'azure'" class="space-y-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">订阅密钥</span>
                        </label>
                        <input
                          v-model="speechConfig.tts.providers.azure.subscriptionKey"
                          type="password"
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          class="input input-bordered focus:input-primary"
                        />
                      </div>
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">服务区域</span>
                        </label>
                        <select v-model="speechConfig.tts.providers.azure.region" class="select select-bordered focus:select-primary">
                          <option value="eastus">East US</option>
                          <option value="eastasia">East Asia</option>
                          <option value="southeastasia">Southeast Asia</option>
                          <option value="westeurope">West Europe</option>
                        </select>
                      </div>
                    </div>

                    <!-- Google Cloud TTS配置 -->
                    <div v-if="speechConfig.tts.currentProvider === 'google'" class="space-y-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">API密钥</span>
                        </label>
                        <input
                          v-model="speechConfig.tts.providers.google.apiKey"
                          type="password"
                          placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          class="input input-bordered focus:input-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 语音识别配置 -->
              <div class="collapse collapse-arrow bg-base-200 mt-2">
                <input type="checkbox" />
                <div class="collapse-title text-lg font-medium">
                  🎙️ 语音识别服务
                  <span v-if="speechConfig.stt.currentProvider !== 'web'" class="badge badge-success badge-sm ml-2">已配置</span>
                </div>
                <div class="collapse-content">
                  <div class="space-y-4 pt-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">语音识别提供商</span>
                      </label>
                      <select v-model="speechConfig.stt.currentProvider" @change="onSttProviderChange" class="select select-bordered focus:select-primary">
                        <option value="web">浏览器内置 (免费)</option>
                        <option value="openai">OpenAI Whisper</option>
                        <option value="azure">Azure Speech</option>
                        <option value="google">Google Cloud STT</option>
                        <option value="baidu">百度语音</option>
                      </select>
                    </div>

                    <!-- OpenAI Whisper配置 -->
                    <div v-if="speechConfig.stt.currentProvider === 'openai'" class="space-y-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">API密钥</span>
                          <button @click="testSttConnection" :disabled="!speechConfig.stt.providers.openai.apiKey || testingStt" class="btn btn-ghost btn-xs">
                            <span v-if="testingStt" class="loading loading-spinner loading-xs"></span>
                            {{ testingStt ? '测试中...' : '测试连接' }}
                          </button>
                        </label>
                        <input
                          v-model="speechConfig.stt.providers.openai.apiKey"
                          type="password"
                          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          class="input input-bordered focus:input-primary"
                        />
                      </div>
                    </div>

                    <!-- Azure Speech配置 -->
                    <div v-if="speechConfig.stt.currentProvider === 'azure'" class="space-y-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">订阅密钥</span>
                        </label>
                        <input
                          v-model="speechConfig.stt.providers.azure.subscriptionKey"
                          type="password"
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          class="input input-bordered focus:input-primary"
                        />
                      </div>
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">服务区域</span>
                        </label>
                        <select v-model="speechConfig.stt.providers.azure.region" class="select select-bordered focus:select-primary">
                          <option value="eastus">East US</option>
                          <option value="eastasia">East Asia</option>
                          <option value="southeastasia">Southeast Asia</option>
                          <option value="westeurope">West Europe</option>
                        </select>
                      </div>
                    </div>

                    <!-- Google Cloud STT配置 -->
                    <div v-if="speechConfig.stt.currentProvider === 'google'" class="space-y-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">API密钥</span>
                        </label>
                        <input
                          v-model="speechConfig.stt.providers.google.apiKey"
                          type="password"
                          placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          class="input input-bordered focus:input-primary"
                        />
                      </div>
                    </div>

                    <!-- 百度语音配置 -->
                    <div v-if="speechConfig.stt.currentProvider === 'baidu'" class="space-y-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">API Key</span>
                        </label>
                        <input
                          v-model="speechConfig.stt.providers.baidu.apiKey"
                          type="password"
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                          class="input input-bordered focus:input-primary"
                        />
                      </div>
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text">Secret Key</span>
                        </label>
                        <input
                          v-model="speechConfig.stt.providers.baidu.secretKey"
                          type="password"
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          class="input input-bordered focus:input-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI提供商配置 -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body">
              <h2 class="card-title text-xl mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI提供商配置
              </h2>

              <!-- 当前使用的提供商 -->
              <div class="form-control mb-6">
                <label class="label">
                  <span class="label-text font-medium">当前AI提供商</span>
                  <span class="label-text-alt">
                    <div class="badge badge-primary">{{ getCurrentProviderName() }}</div>
                  </span>
                </label>
                <select v-model="aiConfig.currentProvider" @change="onProviderChange" class="select select-bordered focus:select-primary">
                  <option value="groq">Groq (推荐 - 速度最快)</option>
                  <option value="openai">OpenAI (GPT系列)</option>
                  <option value="cohere">Cohere (对话优化)</option>
                  <option value="anthropic">Anthropic (Claude系列)</option>
                  <option value="ollama">本地Ollama</option>
                  <option value="fallback">规则回退 (无需配置)</option>
                </select>
              </div>

              <div class="divider">API密钥配置</div>

              <!-- Groq配置 -->
              <div class="collapse collapse-arrow bg-base-200">
                <input type="checkbox" :checked="aiConfig.currentProvider === 'groq'" />
                <div class="collapse-title text-lg font-medium">
                  🚀 Groq API - 极速推理
                  <span v-if="aiConfig.providers.groq.apiKey" class="badge badge-success badge-sm ml-2">已配置</span>
                </div>
                <div class="collapse-content">
                  <div class="space-y-4 pt-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">API密钥</span>
                        <button @click="testConnection('groq')" :disabled="!aiConfig.providers.groq.apiKey || testingProvider === 'groq'" class="btn btn-ghost btn-xs">
                          <span v-if="testingProvider === 'groq'" class="loading loading-spinner loading-xs"></span>
                          {{ testingProvider === 'groq' ? '测试中...' : '测试连接' }}
                        </button>
                      </label>
                      <input
                        v-model="aiConfig.providers.groq.apiKey"
                        type="password"
                        placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        class="input input-bordered focus:input-primary"
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">模型</span>
                      </label>
                      <select v-model="aiConfig.providers.groq.model" class="select select-bordered focus:select-primary">
                        <option value="llama-3.1-70b-versatile">Llama 3.1 70B (推荐)</option>
                        <option value="llama-3.1-8b-instant">Llama 3.1 8B (更快)</option>
                        <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                      </select>
                    </div>
                    <div class="alert alert-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <span class="text-sm">免费获取API密钥：<a href="https://console.groq.com/" target="_blank" class="link">console.groq.com</a></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- OpenAI配置 -->
              <div class="collapse collapse-arrow bg-base-200 mt-2">
                <input type="checkbox" :checked="aiConfig.currentProvider === 'openai'" />
                <div class="collapse-title text-lg font-medium">
                  🧠 OpenAI API - GPT系列
                  <span v-if="aiConfig.providers.openai.apiKey" class="badge badge-success badge-sm ml-2">已配置</span>
                </div>
                <div class="collapse-content">
                  <div class="space-y-4 pt-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">API密钥</span>
                        <button @click="testConnection('openai')" :disabled="!aiConfig.providers.openai.apiKey || testingProvider === 'openai'" class="btn btn-ghost btn-xs">
                          <span v-if="testingProvider === 'openai'" class="loading loading-spinner loading-xs"></span>
                          {{ testingProvider === 'openai' ? '测试中...' : '测试连接' }}
                        </button>
                      </label>
                      <input
                        v-model="aiConfig.providers.openai.apiKey"
                        type="password"
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        class="input input-bordered focus:input-primary"
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">模型</span>
                      </label>
                      <select v-model="aiConfig.providers.openai.model" class="select select-bordered focus:select-primary">
                        <option value="gpt-4o-mini">GPT-4o Mini (推荐)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      </select>
                    </div>
                    <div class="alert alert-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <span class="text-sm">获取API密钥：<a href="https://platform.openai.com/" target="_blank" class="link">platform.openai.com</a></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cohere配置 -->
              <div class="collapse collapse-arrow bg-base-200 mt-2">
                <input type="checkbox" :checked="aiConfig.currentProvider === 'cohere'" />
                <div class="collapse-title text-lg font-medium">
                  💬 Cohere API - 对话专家
                  <span v-if="aiConfig.providers.cohere.apiKey" class="badge badge-success badge-sm ml-2">已配置</span>
                </div>
                <div class="collapse-content">
                  <div class="space-y-4 pt-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">API密钥</span>
                        <button @click="testConnection('cohere')" :disabled="!aiConfig.providers.cohere.apiKey || testingProvider === 'cohere'" class="btn btn-ghost btn-xs">
                          <span v-if="testingProvider === 'cohere'" class="loading loading-spinner loading-xs"></span>
                          {{ testingProvider === 'cohere' ? '测试中...' : '测试连接' }}
                        </button>
                      </label>
                      <input
                        v-model="aiConfig.providers.cohere.apiKey"
                        type="password"
                        placeholder="co_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        class="input input-bordered focus:input-primary"
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">模型</span>
                      </label>
                      <select v-model="aiConfig.providers.cohere.model" class="select select-bordered focus:select-primary">
                        <option value="command-r-plus">Command R+ (推荐)</option>
                        <option value="command-r">Command R</option>
                        <option value="command">Command</option>
                      </select>
                    </div>
                    <div class="alert alert-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <span class="text-sm">免费获取API密钥：<a href="https://dashboard.cohere.com/" target="_blank" class="link">dashboard.cohere.com</a></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Anthropic配置 -->
              <div class="collapse collapse-arrow bg-base-200 mt-2">
                <input type="checkbox" :checked="aiConfig.currentProvider === 'anthropic'" />
                <div class="collapse-title text-lg font-medium">
                  🎭 Anthropic API - Claude系列
                  <span v-if="aiConfig.providers.anthropic.apiKey" class="badge badge-success badge-sm ml-2">已配置</span>
                </div>
                <div class="collapse-content">
                  <div class="space-y-4 pt-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">API密钥</span>
                        <button @click="testConnection('anthropic')" :disabled="!aiConfig.providers.anthropic.apiKey || testingProvider === 'anthropic'" class="btn btn-ghost btn-xs">
                          <span v-if="testingProvider === 'anthropic'" class="loading loading-spinner loading-xs"></span>
                          {{ testingProvider === 'anthropic' ? '测试中...' : '测试连接' }}
                        </button>
                      </label>
                      <input
                        v-model="aiConfig.providers.anthropic.apiKey"
                        type="password"
                        placeholder="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        class="input input-bordered focus:input-primary"
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">模型</span>
                      </label>
                      <select v-model="aiConfig.providers.anthropic.model" class="select select-bordered focus:select-primary">
                        <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (推荐)</option>
                        <option value="claude-3-haiku-20240307">Claude 3 Haiku (更快)</option>
                        <option value="claude-3-opus-20240229">Claude 3 Opus (最强)</option>
                      </select>
                    </div>
                    <div class="alert alert-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <span class="text-sm">获取API密钥：<a href="https://console.anthropic.com/" target="_blank" class="link">console.anthropic.com</a></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ollama配置 -->
              <div class="collapse collapse-arrow bg-base-200 mt-2">
                <input type="checkbox" :checked="aiConfig.currentProvider === 'ollama'" />
                <div class="collapse-title text-lg font-medium">
                  🏠 本地Ollama - 完全私有
                  <span v-if="aiConfig.providers.ollama.baseURL" class="badge badge-success badge-sm ml-2">已配置</span>
                </div>
                <div class="collapse-content">
                  <div class="space-y-4 pt-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">服务器地址</span>
                        <button @click="testConnection('ollama')" :disabled="!aiConfig.providers.ollama.baseURL || testingProvider === 'ollama'" class="btn btn-ghost btn-xs">
                          <span v-if="testingProvider === 'ollama'" class="loading loading-spinner loading-xs"></span>
                          {{ testingProvider === 'ollama' ? '测试中...' : '测试连接' }}
                        </button>
                      </label>
                      <input
                        v-model="aiConfig.providers.ollama.baseURL"
                        type="url"
                        placeholder="http://localhost:11434"
                        class="input input-bordered focus:input-primary"
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">模型</span>
                      </label>
                      <select v-model="aiConfig.providers.ollama.model" class="select select-bordered focus:select-primary">
                        <option value="llama3.1:8b">Llama 3.1 8B (推荐)</option>
                        <option value="llama3.1:70b">Llama 3.1 70B</option>
                        <option value="qwen2.5:7b">Qwen 2.5 7B</option>
                        <option value="mistral:7b">Mistral 7B</option>
                        <option value="codellama:7b">CodeLlama 7B</option>
                      </select>
                    </div>
                    <div class="alert alert-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <span class="text-sm">下载安装：<a href="https://ollama.com/" target="_blank" class="link">ollama.com</a></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 高级参数 -->
              <div class="divider">高级参数</div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">创造性程度 (Temperature)</span>
                  <span class="label-text-alt">{{ aiConfig.temperature }}</span>
                </label>
                <input
                  type="range"
                  v-model="aiConfig.temperature"
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
import { api } from '@/utils/api';

const globalStore = useGlobalStore();
const chatStore = useChatStore();

// 响应式数据
const currentTheme = ref('light');
const testingProvider = ref('');
const testingTts = ref(false);
const testingStt = ref(false);

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

const aiConfig = reactive({
  currentProvider: 'groq',
  temperature: 0.7,
  providers: {
    groq: {
      apiKey: '',
      model: 'llama-3.1-70b-versatile'
    },
    openai: {
      apiKey: '',
      model: 'gpt-4o-mini'
    },
    cohere: {
      apiKey: '',
      model: 'command-r-plus'
    },
    anthropic: {
      apiKey: '',
      model: 'claude-3-5-sonnet-20241022'
    },
    ollama: {
      baseURL: 'http://localhost:11434',
      model: 'llama3.1:8b'
    }
  }
});

const speechConfig = reactive({
  tts: {
    currentProvider: 'web',
    providers: {
      elevenlabs: {
        apiKey: '',
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      },
      openai: {
        apiKey: '',
        voice: 'alloy'
      },
      azure: {
        subscriptionKey: '',
        region: 'eastus'
      },
      google: {
        apiKey: ''
      }
    }
  },
  stt: {
    currentProvider: 'web',
    providers: {
      openai: {
        apiKey: ''
      },
      azure: {
        subscriptionKey: '',
        region: 'eastus'
      },
      google: {
        apiKey: ''
      },
      baidu: {
        apiKey: '',
        secretKey: ''
      }
    }
  }
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

const saveSettings = async () => {
  // 保存设置到 localStorage
  localStorage.setItem('userSettings', JSON.stringify(settings));
  await saveAiConfiguration();
  await saveSpeechConfiguration();
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

// AI提供商相关方法
const getCurrentProviderName = () => {
  const names = {
    groq: 'Groq (极速推理)',
    openai: 'OpenAI (GPT系列)',
    cohere: 'Cohere (对话专家)',
    anthropic: 'Anthropic (Claude系列)',
    ollama: '本地Ollama',
    fallback: '规则回退'
  };
  return names[aiConfig.currentProvider as keyof typeof names] || '未知';
};

const onProviderChange = async () => {
  // 保存配置到后端和本地存储
  await saveAiConfiguration();
  globalStore.showNotification(`已切换到 ${getCurrentProviderName()}`, 'success');
};

const testConnection = async (provider: string) => {
  testingProvider.value = provider;

  try {
    // 根据不同提供商进行连接测试
    let testResult = false;

    switch (provider) {
      case 'groq':
        if (!aiConfig.providers.groq.apiKey) {
          throw new Error('请先输入 Groq API 密钥');
        }
        // 测试 Groq API 连接
        testResult = await testGroqConnection();
        break;

      case 'openai':
        if (!aiConfig.providers.openai.apiKey) {
          throw new Error('请先输入 OpenAI API 密钥');
        }
        // 测试 OpenAI API 连接
        testResult = await testOpenAIConnection();
        break;

      case 'cohere':
        if (!aiConfig.providers.cohere.apiKey) {
          throw new Error('请先输入 Cohere API 密钥');
        }
        // 测试 Cohere API 连接
        testResult = await testCohereConnection();
        break;

      case 'anthropic':
        if (!aiConfig.providers.anthropic.apiKey) {
          throw new Error('请先输入 Anthropic API 密钥');
        }
        // 测试 Anthropic API 连接
        testResult = await testAnthropicConnection();
        break;

      case 'ollama':
        if (!aiConfig.providers.ollama.baseURL) {
          throw new Error('请先输入 Ollama 服务器地址');
        }
        // 测试 Ollama 连接
        testResult = await testOllamaConnection();
        break;
    }

    if (testResult) {
      globalStore.showNotification(`${getCurrentProviderName()} 连接测试成功！`, 'success');
    } else {
      throw new Error('连接测试失败');
    }

  } catch (error: any) {
    console.error(`${provider} connection test failed:`, error);
    globalStore.showNotification(
      `${getCurrentProviderName()} 连接测试失败: ${error.message}`,
      'error'
    );
  } finally {
    testingProvider.value = '';
  }
};

// 各个提供商的连接测试函数
const testGroqConnection = async (): Promise<boolean> => {
  return await testProviderConnection('groq', aiConfig.providers.groq);
};

const testOpenAIConnection = async (): Promise<boolean> => {
  return await testProviderConnection('openai', aiConfig.providers.openai);
};

const testCohereConnection = async (): Promise<boolean> => {
  return await testProviderConnection('cohere', aiConfig.providers.cohere);
};

const testAnthropicConnection = async (): Promise<boolean> => {
  return await testProviderConnection('anthropic', aiConfig.providers.anthropic);
};

const testOllamaConnection = async (): Promise<boolean> => {
  return await testProviderConnection('ollama', aiConfig.providers.ollama);
};

// 通用的提供商连接测试函数
const testProviderConnection = async (provider: string, config: any): Promise<boolean> => {
  try {
    const response = await api.post('/ai/test-connection', {
      provider,
      config
    });
    return response.data.success;
  } catch (error: any) {
    console.error(`${provider} connection test failed:`, error);
    throw new Error(error.response?.data?.error || '连接测试失败');
  }
};

const saveAiConfiguration = async () => {
  try {
    // 保存到后端数据库
    await api.post('/ai/config', {
      currentProvider: aiConfig.currentProvider,
      temperature: aiConfig.temperature,
      providers: aiConfig.providers
    });

    // 同时保存到本地存储作为备份
    localStorage.setItem('aiConfig', JSON.stringify(aiConfig));
  } catch (error) {
    console.error('Failed to save AI configuration to backend:', error);
    // 即使后端保存失败，仍然保存到本地存储
    localStorage.setItem('aiConfig', JSON.stringify(aiConfig));
  }
};

const loadAiConfiguration = async () => {
  try {
    // 首先尝试从后端加载
    const response = await api.get('/ai/config');
    if (response.data) {
      Object.assign(aiConfig, {
        currentProvider: response.data.currentProvider,
        temperature: response.data.temperature,
        providers: response.data.providers
      });
      return;
    }
  } catch (error) {
    console.error('Failed to load AI configuration from backend:', error);
  }

  // 如果后端加载失败，尝试从本地存储加载
  const savedConfig = localStorage.getItem('aiConfig');
  if (savedConfig) {
    try {
      Object.assign(aiConfig, JSON.parse(savedConfig));
    } catch (error) {
      console.error('Failed to load AI configuration from localStorage:', error);
    }
  }
};

// 初始化
onMounted(async () => {
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

  // 恢复AI配置
  await loadAiConfiguration();

  // 恢复语音服务配置
  await loadSpeechConfiguration();
});

// =============== 语音服务配置管理 ===============

// TTS提供商变更
const onTtsProviderChange = async () => {
  await saveSpeechConfiguration();
  globalStore.showNotification(`已切换到 ${getTtsProviderName()}`, 'success');
};

// STT提供商变更
const onSttProviderChange = async () => {
  await saveSpeechConfiguration();
  globalStore.showNotification(`已切换到 ${getSttProviderName()}`, 'success');
};

// 获取TTS提供商名称
const getTtsProviderName = () => {
  const names = {
    web: '浏览器内置TTS',
    elevenlabs: 'ElevenLabs',
    openai: 'OpenAI TTS',
    azure: 'Azure Speech',
    google: 'Google Cloud TTS'
  };
  return names[speechConfig.tts.currentProvider as keyof typeof names] || '未知';
};

// 获取STT提供商名称
const getSttProviderName = () => {
  const names = {
    web: '浏览器内置语音识别',
    openai: 'OpenAI Whisper',
    azure: 'Azure Speech',
    google: 'Google Cloud STT',
    baidu: '百度语音'
  };
  return names[speechConfig.stt.currentProvider as keyof typeof names] || '未知';
};

// 测试TTS连接
const testTtsConnection = async () => {
  testingTts.value = true;

  try {
    const response = await api.post('/ai/speech/test-tts', {
      provider: speechConfig.tts.currentProvider,
      config: speechConfig.tts.providers[speechConfig.tts.currentProvider as keyof typeof speechConfig.tts.providers]
    });

    if (response.data.success) {
      globalStore.showNotification(`${getTtsProviderName()} 连接测试成功！`, 'success');
    } else {
      throw new Error('连接测试失败');
    }
  } catch (error: any) {
    console.error('TTS connection test failed:', error);
    globalStore.showNotification(
      `${getTtsProviderName()} 连接测试失败: ${error.response?.data?.error || error.message}`,
      'error'
    );
  } finally {
    testingTts.value = false;
  }
};

// 测试STT连接
const testSttConnection = async () => {
  testingStt.value = true;

  try {
    const response = await api.post('/ai/speech/test-stt', {
      provider: speechConfig.stt.currentProvider,
      config: speechConfig.stt.providers[speechConfig.stt.currentProvider as keyof typeof speechConfig.stt.providers]
    });

    if (response.data.success) {
      globalStore.showNotification(`${getSttProviderName()} 连接测试成功！`, 'success');
    } else {
      throw new Error('连接测试失败');
    }
  } catch (error: any) {
    console.error('STT connection test failed:', error);
    globalStore.showNotification(
      `${getSttProviderName()} 连接测试失败: ${error.response?.data?.error || error.message}`,
      'error'
    );
  } finally {
    testingStt.value = false;
  }
};

// 保存语音服务配置
const saveSpeechConfiguration = async () => {
  try {
    // 保存到后端数据库
    await api.post('/ai/speech/config', speechConfig);

    // 同时保存到本地存储作为备份
    localStorage.setItem('speechConfig', JSON.stringify(speechConfig));
  } catch (error) {
    console.error('Failed to save speech configuration to backend:', error);
    // 即使后端保存失败，仍然保存到本地存储
    localStorage.setItem('speechConfig', JSON.stringify(speechConfig));
  }
};

// 加载语音服务配置
const loadSpeechConfiguration = async () => {
  try {
    // 首先尝试从后端加载
    const response = await api.get('/ai/speech/config');
    if (response.data) {
      Object.assign(speechConfig, response.data);
      return;
    }
  } catch (error) {
    console.error('Failed to load speech configuration from backend:', error);
  }

  // 如果后端加载失败，尝试从本地存储加载
  const savedConfig = localStorage.getItem('speechConfig');
  if (savedConfig) {
    try {
      Object.assign(speechConfig, JSON.parse(savedConfig));
    } catch (error) {
      console.error('Failed to load speech configuration from localStorage:', error);
    }
  }
};
</script>