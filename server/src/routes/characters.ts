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

    // 更新角色逻辑
    // TODO: 实现更新角色功能

    res.json({ message: 'Character updated successfully' });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// 删除角色
charactersRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // TODO: 实现删除角色功能

    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});