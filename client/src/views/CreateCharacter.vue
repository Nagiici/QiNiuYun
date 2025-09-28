
<template>
  <div class="flex h-screen bg-base-100">
    <!-- 侧边栏 -->
    <aside
      class="flex flex-col h-full bg-base-100 text-base-content border-r border-base-300 transition-all duration-300 relative hidden lg:block"
      :class="sidebarOpen ? 'w-72' : 'w-20'"
    >
      <div class="flex items-center justify-between h-16 px-4 flex-shrink-0">
        <router-link to="/" class="btn btn-ghost text-xl" v-show="sidebarOpen">
          🤖 AI人物聊天
        </router-link>
        <!-- 桌面端侧边栏切换按钮 -->
        <button
          @click="toggleSidebar"
          class="btn btn-square btn-ghost hidden lg:flex hover:bg-base-200 transition-colors z-10"
          :title="sidebarOpen ? '收起边栏' : '展开边栏'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 transition-transform duration-300" :class="{ 'rotate-180': sidebarOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <ChatSidebar :is-collapsed="!sidebarOpen" class="flex-1 min-h-0" />
    </aside>

    <!-- 主内容区域 -->
    <div class="flex-1 overflow-y-auto p-4 transition-all duration-300 min-w-0">
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
            <li><span class="text-base-content/60">{{ editMode ? '编辑人物' : '创建人物' }}</span></li>
          </ul>
        </div>

        <!-- 页面标题 -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-base-content mb-2">{{ editMode ? '编辑AI人物' : '创建AI人物' }}</h1>
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

              <!-- 沉浸式体验设置 -->
              <div class="card bg-base-100 shadow-lg border border-base-300">
                <div class="card-body">
                  <h2 class="card-title text-xl mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945c.367.158.793.293 1.273.293h.636c.48 0 .906-.135 1.273-.293V18a2 2 0 012-2 2 2 0 002-2v-1a2 2 0 012-2h1.945c.158-.367.293-.793.293-1.273v-.636c0-.48-.135-.906-.293-1.273H19a2 2 0 01-2-2 2 2 0 00-2-2H5a2 2 0 00-2 2 2 2 0 01-2 2h-.945c-.158.367-.293.793-.293 1.273v.636c0 .48.135.906.293 1.273z" />
                    </svg>
                    沉浸式体验设置
                  </h2>

                  <div class="space-y-6">
                    <!-- 故事世界/环境设定 -->
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">故事世界/环境设定</span>
                      </label>
                      <textarea
                        v-model="characterData.story_world"
                        class="textarea textarea-bordered focus:textarea-primary h-24"
                        placeholder="描述角色所处的世界环境，如：现代都市、魔幻王国、未来科技、古代宫廷等..."
                      ></textarea>
                      <label class="label">
                        <span class="label-text-alt text-base-content/60">设定角色的活动环境，影响对话的情境和氛围</span>
                      </label>
                    </div>

                    <!-- 角色详细背景 -->
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">角色详细背景</span>
                      </label>
                      <textarea
                        v-model="characterData.character_background"
                        class="textarea textarea-bordered focus:textarea-primary h-32"
                        placeholder="详细描述角色的成长经历、重要事件、人际关系、技能特长等..."
                      ></textarea>
                      <label class="label">
                        <span class="label-text-alt text-base-content/60">丰富的背景故事让角色更加立体和真实</span>
                      </label>
                    </div>

                    <!-- 当前任务/目标 -->
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">当前任务/目标</span>
                      </label>
                      <div class="flex items-center gap-4 mb-3">
                        <label class="label cursor-pointer">
                          <input type="checkbox" v-model="characterData.has_mission" class="checkbox checkbox-primary">
                          <span class="label-text ml-2">角色当前有特定任务或目标</span>
                        </label>
                      </div>
                      <textarea
                        v-if="characterData.has_mission"
                        v-model="characterData.current_mission"
                        class="textarea textarea-bordered focus:textarea-primary h-24"
                        placeholder="描述角色当前的任务、目标或正在处理的事情，如：寻找失踪的朋友、完成重要任务、解决某个问题等..."
                      ></textarea>
                      <label v-if="characterData.has_mission" class="label">
                        <span class="label-text-alt text-base-content/60">任务让对话更有目的性和紧迫感</span>
                      </label>
                    </div>

                    <!-- 情境状态 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">当前情绪状态</span>
                        </label>
                        <select v-model="characterData.current_mood" class="select select-bordered focus:select-primary">
                          <option value="calm">默认情绪</option>
                          <option value="happy">开心愉悦</option>
                          <option value="sad">悲伤沮丧</option>
                          <option value="angry">愤怒生气</option>
                          <option value="excited">兴奋激动</option>
                          <option value="nervous">紧张不安</option>
                          <option value="calm">平静冷静</option>
                          <option value="confused">困惑迷茫</option>
                          <option value="determined">坚定果断</option>
                        </select>
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">时区设定</span>
                        </label>
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <input
                              type="checkbox"
                              v-model="characterData.use_real_time"
                              class="checkbox checkbox-primary checkbox-sm"
                            />
                            <span class="label-text">使用真实时间（根据用户时区动态变化）</span>
                          </div>
                          <select
                            v-if="!characterData.use_real_time"
                            v-model="characterData.time_setting"
                            class="select select-bordered focus:select-primary"
                          >
                            <option value="">不限定</option>
                            <option value="morning">清晨</option>
                            <option value="noon">正午</option>
                            <option value="afternoon">下午</option>
                            <option value="evening">傍晚</option>
                            <option value="night">夜晚</option>
                            <option value="midnight">深夜</option>
                          </select>
                          <div v-if="characterData.use_real_time" class="bg-base-200 p-3 rounded-lg">
                            <div class="text-sm text-base-content/70 mb-2">当前检测到的时区和时间：</div>
                            <div class="font-mono text-sm">
                              {{ currentTimezone }} - {{ currentTimeDisplay }}
                            </div>
                            <div class="text-xs text-base-content/50 mt-1">
                              时间段：{{ getCurrentTimePeriod() }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    <div class="alert alert-info shadow-lg mb-4">
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <div>
                          <h3 class="font-bold">自定义指令使用说明</h3>
                          <div class="text-xs">
                            自定义指令可以精确控制AI的回应方式、语言风格和行为模式。留空将使用默认设置。
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">系统指令</span>
                      </label>
                      <textarea
                        v-model="characterData.custom_instructions"
                        class="textarea textarea-bordered focus:textarea-primary h-32"
                        placeholder="你是一个...，你的说话风格是...，你总是..."
                      ></textarea>
                      <label class="label">
                        <span class="label-text-alt text-base-content/60">例如：你是一个温和的老师，总是用鼓励的语气回答问题，会在回答后提供相关的学习建议</span>
                      </label>
                    </div>

                    <!-- 常用指令示例 -->
                    <div class="mt-4">
                      <label class="label">
                        <span class="label-text font-medium">常用示例（点击快速填入）</span>
                      </label>
                      <div class="flex flex-wrap gap-2">
                        <button
                          type="button"
                          @click="fillInstructionExample('温和耐心')"
                          class="btn btn-outline btn-xs"
                        >
                          温和耐心型
                        </button>
                        <button
                          type="button"
                          @click="fillInstructionExample('专业权威')"
                          class="btn btn-outline btn-xs"
                        >
                          专业权威型
                        </button>
                        <button
                          type="button"
                          @click="fillInstructionExample('幽默风趣')"
                          class="btn btn-outline btn-xs"
                        >
                          幽默风趣型
                        </button>
                        <button
                          type="button"
                          @click="fillInstructionExample('简洁明了')"
                          class="btn btn-outline btn-xs"
                        >
                          简洁明了型
                        </button>
                        <button
                          type="button"
                          @click="fillInstructionExample('详细解释')"
                          class="btn btn-outline btn-xs"
                        >
                          详细解释型
                        </button>
                      </div>
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

              </div>

              <!-- 提交按钮 -->
              <div class="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <button v-if="!editMode" type="submit" class="btn btn-primary btn-lg shadow-lg" :disabled="loading">
                  <span v-if="loading" class="loading loading-spinner loading-sm mr-2"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                  </svg>
                  保存人物并聊天
                </button>
                <button v-if="!editMode" type="button" @click="saveAndReturn" class="btn btn-secondary btn-lg shadow-lg" :disabled="loading">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  保存人物并返回主页
                </button>
                <!-- 编辑模式按钮 -->
                <button v-if="editMode" type="submit" class="btn btn-primary btn-lg shadow-lg" :disabled="loading">
                  <span v-if="loading" class="loading loading-spinner loading-sm mr-2"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  更新人物信息
                </button>
                <button v-if="editMode" type="button" @click="router.push('/')" class="btn btn-secondary btn-lg shadow-lg" :disabled="loading">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  取消编辑
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

              <!-- 版本管理 -->
              <div class="card bg-base-100 shadow-lg border border-base-300 mb-6">
                <div class="card-body">
                  <h3 class="card-title text-lg mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    版本管理
                  </h3>

                  <!-- 保存版本 -->
                  <div class="mb-4">
                    <div class="flex gap-2 mb-2">
                      <input
                        type="text"
                        v-model="versionNote"
                        placeholder="版本备注（可选）"
                        class="input input-bordered flex-1 input-sm focus:input-primary"
                      />
                      <button
                        @click="saveCurrentVersion"
                        class="btn btn-primary btn-sm"
                        :disabled="!characterData.name.trim() || savingVersion"
                      >
                        <span v-if="savingVersion" class="loading loading-spinner loading-xs mr-1"></span>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        保存版本
                      </button>
                    </div>
                    <p class="text-xs text-base-content/60">
                      保存当前配置为一个版本，以便稍后恢复或对比
                    </p>
                  </div>

                  <!-- 版本列表 -->
                  <div v-if="characterVersions.length > 0">
                    <h4 class="font-medium mb-2">已保存的版本</h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                      <div
                        v-for="version in characterVersions"
                        :key="version.id"
                        class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                      >
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <span class="badge badge-primary badge-sm">v{{ version.version }}</span>
                            <span class="text-sm font-medium">{{ version.note }}</span>
                          </div>
                          <p class="text-xs text-base-content/60 mt-1">
                            {{ new Date(version.created_at).toLocaleString('zh-CN') }}
                          </p>
                        </div>
                        <div class="flex gap-1">
                          <button
                            @click="loadVersion(version)"
                            class="btn btn-ghost btn-xs"
                            title="加载此版本"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </button>
                          <button
                            @click="deleteVersion(version)"
                            class="btn btn-ghost btn-xs text-error hover:bg-error/10"
                            title="删除此版本"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-4 text-base-content/60">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-sm">还没有保存的版本</p>
                    <p class="text-xs">创建角色后即可保存版本</p>
                  </div>
                </div>
              </div>

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
                      <span class="label-text-alt text-success">✨ 实时预览</span>
                    </label>
                    <input
                      type="text"
                      v-model="testInput"
                      placeholder="输入一个测试问题..."
                      class="input input-bordered focus:input-primary"
                    />
                  </div>

                  <!-- 预设问题快捷选项 -->
                  <div class="mb-4">
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="question in presetQuestions"
                        :key="question"
                        @click="testInput = question"
                        class="btn btn-xs btn-outline"
                      >
                        {{ question }}
                      </button>
                    </div>
                  </div>

                  <div class="alert alert-info mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="text-sm">预览会实时反映您对角色参数的所有修改，包括性格、背景、情绪等设置的变化。</span>
                  </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCharactersStore } from '@/stores/characters';
import { useChatStore } from '@/stores/chat';
import { useGlobalStore } from '@/stores/global';
import PersonalityRadar from '@/components/PersonalityRadar.vue';
import ChatSidebar from '@/components/ChatSidebar.vue';

const router = useRouter();
const route = useRoute();
const charactersStore = useCharactersStore();
const chatStore = useChatStore();
const globalStore = useGlobalStore();

// 检测是否为编辑模式
const editMode = computed(() => !!route.query.edit);
const editCharacterId = computed(() => editMode.value ? parseInt(route.query.edit as string) : null);

// 响应式数据
const sidebarOpen = ref(true);
const loading = ref(false);
const testLoading = ref(false);
const avatarPreview = ref<string | null>(null);
const testInput = ref('你好！你能介绍一下自己吗？');
const testOutput = ref('');

// 预设测试问题
const presetQuestions = [
  '你好！你能介绍一下自己吗？',
  '你现在心情怎么样？',
  '告诉我你的故事',
  '你有什么特殊能力吗？',
  '你最喜欢做什么？'
];

// 版本管理相关
const versionNote = ref('');
const savingVersion = ref(false);
const characterVersions = ref([]);
const currentVersion = ref(1);

const characterData = reactive({
  name: '',
  description: '',
  personality_preset: '',
  custom_instructions: '',
  story_background: '',
  // 新增沉浸式字段
  story_world: '',
  character_background: '',
  has_mission: false,
  current_mission: '',
  current_mood: 'calm',
  time_setting: '',
  use_real_time: true, // 默认使用真实时间
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

// 时区相关变量
const currentTimezone = ref('');
const currentTimeDisplay = ref('');


// 方法
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

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

// 防抖函数 - 避免过于频繁的API调用
let debounceTimer: NodeJS.Timeout | null = null;

// 使用真实AI API生成测试回复
const generateRealAIResponse = async (input: string): Promise<string> => {
  if (!input.trim()) return '';

  try {
    testLoading.value = true;

    // 构建临时角色数据用于测试
    const tempCharacterData = {
      ...characterData,
      id: 999, // 临时ID，用于测试
      name: characterData.name || '测试角色'
    };

    // 调用真实的AI接口
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        character_id: 999, // 使用临时ID
        message: input,
        // 传递完整角色数据用于AI生成
        character_data: tempCharacterData
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || '暂时无法获取AI回复，请稍后再试。';
    } else {
      throw new Error('AI请求失败');
    }
  } catch (error) {
    console.error('AI回复生成失败:', error);
    return '⚠️ AI服务暂时不可用，这里显示模拟回复：\n\n' + generateMockResponse(input);
  } finally {
    testLoading.value = false;
  }
};

// 防抖更新测试回复
const debouncedUpdateTestOutput = (input: string) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    if (input.trim()) {
      testOutput.value = await generateRealAIResponse(input);
    } else {
      testOutput.value = '';
    }
  }, 800); // 800ms防抖延迟
};

// 监听测试输入变化，实时更新预览（使用防抖）
watch(() => testInput.value, (newInput) => {
  debouncedUpdateTestOutput(newInput);
});

// 监听所有角色参数变化，自动更新预览（使用防抖）
watch(() => [
  characterData.name,
  characterData.description,
  characterData.story_world,
  characterData.character_background,
  characterData.custom_instructions,
  characterData.current_mood,
  characterData.has_mission,
  characterData.current_mission,
  characterData.personality_data.energy,
  characterData.personality_data.friendliness,
  characterData.personality_data.humor,
  characterData.personality_data.professionalism,
  characterData.personality_data.creativity,
  characterData.personality_data.empathy
], () => {
  // 如果有测试输入，自动更新预览
  if (testInput.value.trim()) {
    debouncedUpdateTestOutput(testInput.value);
  }
}, { deep: true });

// 初始化时生成预览
onMounted(async () => {
  // 如果是编辑模式，加载角色数据
  if (editMode.value && editCharacterId.value) {
    try {
      loading.value = true;
      console.log('Edit mode detected, loading character ID:', editCharacterId.value);
      const response = await fetch(`/api/characters/${editCharacterId.value}`);
      console.log('API response:', response);

      if (response.ok) {
        const character = await response.json();
        console.log('Character data received:', character);

        // 填充表单数据
        characterData.name = character.name;
        characterData.description = character.description;
        characterData.personality_preset = character.personality_preset;
        characterData.custom_instructions = character.custom_instructions || '';
        characterData.story_world = character.story_world || '';
        characterData.character_background = character.character_background || '';
        characterData.has_mission = Boolean(character.has_mission);
        characterData.current_mission = character.current_mission || '';
        characterData.current_mood = character.current_mood || 'normal';
        characterData.time_setting = character.time_setting || 'anytime';
        characterData.use_real_time = Boolean(character.use_real_time);
        characterData.is_public = Boolean(character.is_public);

        // 解析JSON数据
        try {
          characterData.personality_data = typeof character.personality_data === 'string'
            ? JSON.parse(character.personality_data)
            : character.personality_data;
          characterData.examples = typeof character.examples === 'string'
            ? JSON.parse(character.examples)
            : character.examples;
        } catch (e) {
          console.warn('Failed to parse character data:', e);
        }

        // 设置头像
        if (character.avatar) {
          avatarPreview.value = character.avatar;
        }
      } else {
        console.error('Failed to fetch character - response not ok:', response.status);
        globalStore.showNotification('加载角色数据失败', 'error');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to load character - exception:', error);
      globalStore.showNotification('加载角色数据失败', 'error');
      router.push('/');
    } finally {
      loading.value = false;
    }
  } else {
    console.log('Edit mode check:', {
      editMode: editMode.value,
      editCharacterId: editCharacterId.value,
      routeQuery: route.query
    });
  }

  // 生成初始预览
  if (testInput.value.trim()) {
    testOutput.value = await generateRealAIResponse(testInput.value);
  }
});

const generateMockResponse = (input: string): string => {
  const personality = characterData.personality_data;
  const name = characterData.name || '测试角色';
  const description = characterData.description;
  const storyWorld = characterData.story_world;
  const characterBackground = characterData.character_background;
  const customInstructions = characterData.custom_instructions;
  const currentMood = characterData.current_mood;
  const hasMission = characterData.has_mission;
  const currentMission = characterData.current_mission;

  // 根据角色名称和描述构建开场白
  let response = `你好！我是${name}`;

  if (description) {
    response += `，${description}`;
  }

  response += '。';

  // 根据友善度调整语调
  if (personality.friendliness > 80) {
    response += '很开心能遇到你！';
  } else if (personality.friendliness > 60) {
    response += '很高兴认识你。';
  } else if (personality.friendliness < 40) {
    response += '...';
  }

  // 根据幽默感添加表情
  if (personality.humor > 70) {
    response += ' 😊';
  } else if (personality.humor > 50) {
    response += ' 🙂';
  }

  // 根据能量水平调整表达方式
  if (personality.energy > 80) {
    response = response.replace('。', '！');
  }

  // 如果有故事世界背景，融入环境描述
  if (storyWorld && storyWorld.trim()) {
    response += `\n\n我来自${storyWorld}`;
    if (characterBackground && characterBackground.trim()) {
      response += `。${characterBackground.substring(0, 50)}${characterBackground.length > 50 ? '...' : ''}`;
    } else {
      response += '。';
    }
  }

  // 根据当前情绪状态调整回复
  if (currentMood) {
    const moodResponses = {
      happy: '我现在心情很好',
      excited: '我现在特别兴奋',
      calm: '我现在很平静',
      sad: '我现在有些忧郁',
      angry: '我现在有些生气',
      confused: '我现在有点困惑',
      tired: '我现在有些疲惫'
    };
    if (moodResponses[currentMood as keyof typeof moodResponses]) {
      response += `\n\n${moodResponses[currentMood as keyof typeof moodResponses]}。`;
    }
  }

  // 如果有任务，提及任务
  if (hasMission && currentMission && currentMission.trim()) {
    response += `\n\n我目前的任务是：${currentMission}`;
  }

  // 根据专业性调整对问题的回应方式
  response += `\n\n`;
  if (personality.professionalism > 80) {
    response += `关于您提出的问题"${input}"，让我为您详细分析一下。`;
  } else if (personality.professionalism > 60) {
    response += `关于"${input}"这个问题，我来回答一下。`;
  } else {
    response += `"${input}"？这个问题很有趣！`;
  }

  // 根据创造力调整回答风格
  if (personality.creativity > 80) {
    response += '\n\n让我从一个全新的角度来思考这个问题...';
  } else if (personality.creativity > 60) {
    response += '\n\n我觉得可以这样理解...';
  }

  // 根据同理心调整情感表达
  if (personality.empathy > 80) {
    response += '\n\n我完全理解你的想法和感受，';
  } else if (personality.empathy > 60) {
    response += '\n\n我理解你的观点，';
  }

  // 如果有自定义指令，体现指令影响
  if (customInstructions && customInstructions.trim()) {
    const instructionHint = customInstructions.substring(0, 30);
    response += `\n\n*根据设定：${instructionHint}${customInstructions.length > 30 ? '...' : ''}*`;
  }

  response += '\n\n---\n💡 这是基于当前所有参数设置的动态预览。调整任何参数都会影响回复内容。';

  return response;
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    globalStore.setLoading(true, editMode.value ? '正在更新角色...' : '正在创建角色...');

    // 验证必填字段
    if (!characterData.name.trim() || !characterData.description.trim()) {
      globalStore.showNotification('请填写所有必填字段', 'error');
      return;
    }

    let resultCharacter;

    if (editMode.value && editCharacterId.value) {
      // 更新现有角色
      console.log('Attempting to update character:', {
        id: editCharacterId.value,
        data: characterData
      });

      resultCharacter = await charactersStore.updateCharacter(editCharacterId.value, characterData);

      console.log('Update successful, result:', resultCharacter);
      globalStore.showNotification('角色更新成功！', 'success');

      // 跳转回首页
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      // 创建新角色
      resultCharacter = await charactersStore.createCharacter(characterData);

      // 设置为当前角色
      globalStore.setCurrentCharacter(resultCharacter);

      // 创建聊天会话
      await chatStore.createSession(resultCharacter.id, resultCharacter.name);

      globalStore.showNotification('角色创建成功！正在跳转到聊天页面...', 'success');

      // 跳转到聊天页面
      setTimeout(() => {
        router.push(`/chat/${resultCharacter.id}`);
      }, 1500);
    }
  } catch (error: any) {
    console.error('Failed to submit character:', {
      error: error.message,
      stack: error.stack,
      editMode: editMode.value,
      characterId: editCharacterId.value
    });

    // 显示具体的错误信息
    const errorMessage = error.message || (editMode.value ? '更新角色失败，请重试' : '创建角色失败，请重试');
    globalStore.showNotification(errorMessage, 'error');
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

// =============== 时区和时间功能 ===============

// 获取当前时间段
const getCurrentTimePeriod = () => {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else if (hour >= 18 && hour < 22) {
    return 'evening';
  } else {
    return 'night';
  }
};

// 更新时区信息
const updateTimezoneInfo = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const timeString = now.toLocaleString('zh-CN', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  currentTimezone.value = timezone;
  currentTimeDisplay.value = timeString;

  // 如果开启了实时时间，更新时间设定
  if (characterData.use_real_time) {
    characterData.time_setting = getCurrentTimePeriod();
  }
};

// 初始化时区信息
updateTimezoneInfo();

// 每秒更新时间显示（实时显示）
setInterval(updateTimezoneInfo, 1000);

// =============== 版本管理功能 ===============

// 保存当前版本
const saveCurrentVersion = async () => {
  if (!characterData.name.trim()) {
    globalStore.showNotification('请先输入角色名称', 'warning');
    return;
  }

  try {
    savingVersion.value = true;

    // 调用API保存版本
    const response = await fetch('/api/characters/versions/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterName: characterData.name,
        characterData: { ...characterData },
        note: versionNote.value || undefined
      })
    });

    if (response.ok) {
      const newVersion = await response.json();

      // 重新加载版本列表
      await loadVersionHistory();

      versionNote.value = '';
      globalStore.showNotification(`版本 v${newVersion.version} 保存成功！`, 'success');
    } else {
      throw new Error('Failed to save version');
    }
  } catch (error) {
    console.error('Save version failed:', error);
    globalStore.showNotification('版本保存失败，请稍后重试', 'error');
  } finally {
    savingVersion.value = false;
  }
};

// 加载指定版本
const loadVersion = async (version: any) => {
  if (confirm(`确定要加载版本 v${version.version} 吗？当前未保存的修改将丢失。`)) {
    try {
      // 调用API获取版本数据
      const response = await fetch(`/api/characters/versions/${encodeURIComponent(version.character_name)}/${version.version}`);

      if (response.ok) {
        const versionData = await response.json();

        // 恢复数据
        Object.assign(characterData, versionData.character_data);

        globalStore.showNotification(`已加载版本 v${version.version}`, 'success');
      } else {
        throw new Error('Failed to load version');
      }
    } catch (error) {
      console.error('Load version failed:', error);
      globalStore.showNotification('加载版本失败，请稍后重试', 'error');
    }
  }
};

// 删除版本
const deleteVersion = async (version: any) => {
  if (confirm(`确定要删除版本 v${version.version} 吗？此操作无法撤销。`)) {
    try {
      // 调用API删除版本
      const response = await fetch(`/api/characters/versions/${encodeURIComponent(version.character_name)}/${version.version}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // 重新加载版本列表
        await loadVersionHistory();

        globalStore.showNotification(`版本 v${version.version} 删除成功`, 'success');
      } else {
        throw new Error('Failed to delete version');
      }
    } catch (error) {
      console.error('Delete version failed:', error);
      globalStore.showNotification('版本删除失败，请稍后重试', 'error');
    }
  }
};

// 加载历史版本
const loadVersionHistory = async () => {
  if (characterData.name.trim()) {
    try {
      // 调用API获取版本列表
      const response = await fetch(`/api/characters/versions/${encodeURIComponent(characterData.name)}`);

      if (response.ok) {
        const versions = await response.json();
        characterVersions.value = versions;

        // 设置当前版本号为最大版本号+1
        if (versions.length > 0) {
          const maxVersion = Math.max(...versions.map((v: any) => v.version));
          currentVersion.value = maxVersion + 1;
        } else {
          currentVersion.value = 1;
        }
      } else {
        throw new Error('Failed to load version history');
      }
    } catch (error) {
      console.error('Load version history failed:', error);
      // 如果API调用失败，将版本列表设置为空
      characterVersions.value = [];
      currentVersion.value = 1;
    }
  } else {
    characterVersions.value = [];
    currentVersion.value = 1;
  }
};

// 格式化日期
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 填入自定义指令示例
const fillInstructionExample = (type: string) => {
  const examples = {
    '温和耐心': '你是一个温和耐心的助手，总是以鼓励和支持的语气回应用户。你会认真倾听用户的问题，用简单易懂的方式解释复杂概念，并在适当的时候给予情感支持和鼓励。',
    '专业权威': '你是一个专业且权威的专家，在回答问题时会提供准确、详细的信息和专业见解。你的语言严谨规范，会引用相关的理论或数据来支持你的观点，让用户感受到你的专业性。',
    '幽默风趣': '你是一个幽默风趣的伙伴，善于用轻松愉快的方式与用户交流。你会在回答中适当加入幽默元素、有趣的比喻或俏皮话，让交流变得轻松有趣，但同时保持信息的准确性。',
    '简洁明了': '你总是用最简洁明了的方式回答问题。避免冗长的解释，直接提供核心信息和要点。你的回答简短有力，让用户能够快速理解并获得所需信息。',
    '详细解释': '你会非常详细地解释每个问题，提供全面的背景信息、多个角度的分析和具体的例子。你认为充分的解释有助于用户更好地理解问题，因此会尽可能地提供完整的信息。'
  };

  characterData.custom_instructions = examples[type] || '';
};

// 监听角色名称变化，加载版本历史
watch(() => characterData.name, (newName) => {
  if (newName) {
    loadVersionHistory();
  } else {
    characterVersions.value = [];
    currentVersion.value = 1;
  }
});
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