import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/utils/api';

export const useCharactersStore = defineStore('characters', () => {
  const characters = ref<any[]>([]);
  const loading = ref(false);

  // 获取所有角色
  const fetchCharacters = async () => {
    loading.value = true;
    try {
      const response = await api.get('/characters');
      characters.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch characters:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取单个角色
  const fetchCharacterById = async (id: number) => {
    try {
      const response = await api.get(`/characters/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch character:', error);
      throw error;
    }
  };

  // 创建新角色
  const createCharacter = async (characterData: any) => {
    try {
      const response = await api.post('/characters', characterData);
      characters.value.unshift(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create character:', error);
      throw error;
    }
  };

  // 更新角色
  const updateCharacter = async (id: number, characterData: any) => {
    try {
      console.log('Updating character:', { id, characterData });

      const response = await api.put(`/characters/${id}`, characterData);

      console.log('Update response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      // 检查响应是否成功
      if (response.status >= 200 && response.status < 300) {
        // 更新本地状态
        const index = characters.value.findIndex(char => char.id === id);
        if (index !== -1) {
          characters.value[index] = { ...characters.value[index], ...response.data };
        }

        console.log('Character updated successfully:', response.data);
        return response.data;
      } else {
        throw new Error(`Update failed with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to update character:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      // 提供更详细的错误信息
      if (error.response?.status === 400) {
        throw new Error('请求数据格式错误，请检查输入内容');
      } else if (error.response?.status === 404) {
        throw new Error('角色不存在，请刷新页面重试');
      } else if (error.response?.status >= 500) {
        throw new Error('服务器错误，请稍后重试');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('网络连接失败，请检查网络连接');
      } else {
        throw new Error('更新失败，请重试');
      }
    }
  };

  // 删除角色
  const deleteCharacter = async (id: number) => {
    try {
      await api.delete(`/characters/${id}`);
      characters.value = characters.value.filter(char => char.id !== id);
    } catch (error) {
      console.error('Failed to delete character:', error);
      throw error;
    }
  };

  // 搜索角色
  const searchCharacters = (query: string) => {
    if (!query.trim()) return characters.value;

    const lowerQuery = query.toLowerCase();
    return characters.value.filter(character =>
      character.name.toLowerCase().includes(lowerQuery) ||
      character.description.toLowerCase().includes(lowerQuery)
    );
  };

  // 根据类型筛选角色
  const filterCharactersByType = (type: string) => {
    if (!type || type === 'all') return characters.value;

    return characters.value.filter(character =>
      character.personality_preset === type
    );
  };

  return {
    characters,
    loading,
    fetchCharacters,
    fetchCharacterById,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    searchCharacters,
    filterCharactersByType,
  };
});