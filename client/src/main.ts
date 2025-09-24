import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';

// 导入页面组件
import Home from './views/Home.vue';
import CreateCharacter from './views/CreateCharacter.vue';
import Chat from './views/Chat.vue';
import Settings from './views/Settings.vue';

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/create',
      name: 'CreateCharacter',
      component: CreateCharacter,
    },
    {
      path: '/chat/:characterId?',
      name: 'Chat',
      component: Chat,
      props: true,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },
  ],
});

// 创建应用实例
const app = createApp(App);

// 使用插件
app.use(createPinia());
app.use(router);

// 挂载应用
app.mount('#app');