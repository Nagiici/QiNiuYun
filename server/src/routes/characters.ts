import express from 'express';
import { DatabaseService } from '../database';

export const charactersRouter = express.Router();

// 获取所有角色
charactersRouter.get('/', async (req, res) => {
  try {
    const characters = await DatabaseService.getAllCharacters();
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// 获取单个角色
charactersRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const character = await DatabaseService.getCharacterById(id);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// 创建新角色
charactersRouter.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      avatar,
      personality_preset,
      custom_instructions,
      story_background,
      story_world,
      character_background,
      has_mission,
      current_mission,
      current_mood,
      time_setting,
      use_real_time,
      is_public,
      personality_data,
      examples
    } = req.body;

    // 验证必填字段
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const characterData = {
      name,
      description,
      avatar: avatar || null,
      personality_preset: personality_preset || 'friendly',
      custom_instructions: custom_instructions || '',
      story_background: story_background || '',
      story_world: story_world || '',
      character_background: character_background || '',
      has_mission: Boolean(has_mission),
      current_mission: current_mission || '',
      current_mood: current_mood || 'calm',
      time_setting: time_setting || 'morning',
      use_real_time: Boolean(use_real_time),
      is_public: Boolean(is_public),
      personality_data: personality_data || {
        energy: 50,
        friendliness: 50,
        humor: 50,
        professionalism: 50,
        creativity: 50,
        empathy: 50
      },
      examples: examples || []
    };

    const newCharacter = await DatabaseService.createCharacter(characterData);
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    console.error('Request body:', req.body);
    res.status(500).json({ error: 'Failed to create character', details: error.message });
  }
});

// 更新角色
charactersRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const character = await DatabaseService.getCharacterById(id);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const {
      name,
      description,
      avatar,
      personality_preset,
      custom_instructions,
      story_background,
      story_world,
      character_background,
      has_mission,
      current_mission,
      current_mood,
      time_setting,
      use_real_time,
      is_public,
      personality_data,
      examples
    } = req.body;

    // 验证必填字段
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const characterData = {
      name,
      description,
      avatar: avatar || character.avatar,
      personality_preset: personality_preset || character.personality_preset,
      custom_instructions: custom_instructions || character.custom_instructions,
      story_background: story_background || character.story_background,
      story_world: story_world || character.story_world,
      character_background: character_background || character.character_background,
      has_mission: Boolean(has_mission),
      current_mission: current_mission || character.current_mission,
      current_mood: current_mood || character.current_mood,
      time_setting: time_setting || character.time_setting,
      use_real_time: Boolean(use_real_time),
      is_public: Boolean(is_public),
      personality_data: personality_data || JSON.parse(character.personality_data || '{}'),
      examples: examples || JSON.parse(character.examples || '[]')
    };

    const updatedCharacter = await DatabaseService.updateCharacter(id, characterData);
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    console.error('Request body:', req.body);
    res.status(500).json({ error: 'Failed to update character', details: error.message });
  }
});

// 删除角色
charactersRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // 检查角色是否存在
    const character = await DatabaseService.getCharacterById(id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // 保护预设角色不被删除（ID 1, 2, 3 是预设角色）
    const presetCharacterIds = [1, 2, 3];
    if (presetCharacterIds.includes(id)) {
      return res.status(403).json({ error: 'Cannot delete preset character' });
    }

    // 删除角色的所有版本记录
    await DatabaseService.deleteAllCharacterVersions(character.name);

    // 删除角色（这将级联删除相关的聊天记录）
    await DatabaseService.deleteCharacter(id);

    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

// 版本管理API

// 保存角色版本
charactersRouter.post('/versions/save', async (req, res) => {
  try {
    const { characterName, characterData, note } = req.body;

    if (!characterName || !characterData) {
      return res.status(400).json({ error: 'Character name and data are required' });
    }

    const version = await DatabaseService.saveCharacterVersion(characterName, characterData, note);
    res.status(201).json(version);
  } catch (error) {
    console.error('Error saving character version:', error);
    res.status(500).json({ error: 'Failed to save character version' });
  }
});

// 获取角色的所有版本
charactersRouter.get('/versions/:characterName', async (req, res) => {
  try {
    const characterName = decodeURIComponent(req.params.characterName);
    const versions = await DatabaseService.getCharacterVersions(characterName);
    res.json(versions);
  } catch (error) {
    console.error('Error fetching character versions:', error);
    res.status(500).json({ error: 'Failed to fetch character versions' });
  }
});

// 获取特定版本的角色数据
charactersRouter.get('/versions/:characterName/:version', async (req, res) => {
  try {
    const characterName = decodeURIComponent(req.params.characterName);
    const version = parseInt(req.params.version);

    const versionData = await DatabaseService.getCharacterVersion(characterName, version);

    if (!versionData) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json(versionData);
  } catch (error) {
    console.error('Error fetching character version:', error);
    res.status(500).json({ error: 'Failed to fetch character version' });
  }
});

// 删除角色版本
charactersRouter.delete('/versions/:characterName/:version', async (req, res) => {
  try {
    const characterName = decodeURIComponent(req.params.characterName);
    const version = parseInt(req.params.version);

    const result = await DatabaseService.deleteCharacterVersion(characterName, version);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({ message: 'Version deleted successfully' });
  } catch (error) {
    console.error('Error deleting character version:', error);
    res.status(500).json({ error: 'Failed to delete character version' });
  }
});