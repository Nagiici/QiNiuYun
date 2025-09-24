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
      const response = await api.put(`/characters/${id}`, characterData);
      const index = characters.value.findIndex(char => char.id === id);
      if (index !== -1) {
        characters.value[index] = { ...characters.value[index], ...characterData };
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update character:', error);
      throw error;
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