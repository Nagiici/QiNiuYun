import axios from 'axios';

// 创建axios实例
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);

    // 处理常见错误
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error('请求参数错误:', data.error);
          break;
        case 401:
          console.error('未授权访问');
          break;
        case 403:
          console.error('权限不足');
          break;
        case 404:
          console.error('资源未找到:', data.error);
          break;
        case 500:
          console.error('服务器内部错误:', data.error);
          break;
        default:
          console.error('未知错误:', data.error || error.message);
      }
    } else if (error.request) {
      console.error('网络连接错误，请检查网络设置');
    } else {
      console.error('请求配置错误:', error.message);
    }

    return Promise.reject(error);
  }
);

// API方法封装
export const apiService = {
  // 角色相关
  characters: {
    getAll: () => api.get('/characters'),
    getById: (id: number) => api.get(`/characters/${id}`),
    create: (data: any) => api.post('/characters', data),
    update: (id: number, data: any) => api.put(`/characters/${id}`, data),
    delete: (id: number) => api.delete(`/characters/${id}`),
  },

  // 聊天相关
  chat: {
    getSessions: () => api.get('/chats/sessions'),
    createSession: (data: any) => api.post('/chats/sessions', data),
    getMessages: (sessionId: string) => api.get(`/chats/sessions/${sessionId}/messages`),
    sendMessage: (sessionId: string, data: any) => api.post(`/chats/sessions/${sessionId}/messages`, data),
  },

  // AI相关
  ai: {
    chat: (data: any) => api.post('/ai/chat', data),
    analyzeEmotion: (message: string) => api.post('/ai/emotion', { message }),
  },

  // 文件上传
  upload: {
    avatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },
};