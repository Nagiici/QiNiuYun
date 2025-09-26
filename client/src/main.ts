import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';

// 懒加载页面组件（代码分割）
const Home = () => import('./views/Home.vue');
const CreateCharacter = () => import('./views/CreateCharacter.vue');
const Chat = () => import('./views/Chat.vue');
const Settings = () => import('./views/Settings.vue');

// 加载组件
const LoadingSpinner = () => import('./components/LoadingSpinner.vue');

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