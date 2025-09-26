/**
 * 角色AI服务
 * 负责构建角色相关的AI提示和行为逻辑
 */

import { Character, CharacterMood, TimeSettings } from '../../types';

export class CharacterService {
  /**
   * 构建角色的系统提示
   */
  public buildSystemPrompt(character: Character, context?: any): string {
    const sections: string[] = [];

    // 基本角色信息
    sections.push(this.buildBasicCharacterPrompt(character));

    // 性格特征
    sections.push(this.buildPersonalityPrompt(character));

    // 世界观和背景
    if (character.story_world || character.character_background) {
      sections.push(this.buildBackgroundPrompt(character));
    }

    // 时间和环境上下文
    sections.push(this.buildContextPrompt(character, context));

    // 对话示例
    if (character.examples && character.examples.length > 0) {
      sections.push(this.buildExamplesPrompt(character));
    }

    // 行为指导
    sections.push(this.buildBehaviorGuidelines(character));

    return sections.join('\n\n');
  }

  private buildBasicCharacterPrompt(character: Character): string {
    let prompt = `你是 ${character.name}，${character.description}`;

    if (character.current_mood) {
      const moodText = this.getMoodDescription(character.current_mood);
      prompt += `\n当前心情：${moodText}`;
    }

    return prompt;
  }

  private buildPersonalityPrompt(character: Character): string {
    if (!character.personality_data) {
      return this.getPresetPersonalityPrompt(character.personality_preset || 'friendly');
    }

    const p = character.personality_data;
    const traits: string[] = [];

    if (p.energy > 70) traits.push('充满活力和热情');
    else if (p.energy < 30) traits.push('沉稳内敛');

    if (p.friendliness > 70) traits.push('友善亲和');
    else if (p.friendliness < 30) traits.push('相对冷淡');

    if (p.humor > 70) traits.push('风趣幽默');
    else if (p.humor < 30) traits.push('严肃认真');

    if (p.professionalism > 70) traits.push('专业严谨');
    else if (p.professionalism < 30) traits.push('随性自然');

    if (p.creativity > 70) traits.push('富有创意');
    else if (p.creativity < 30) traits.push('实事求是');

    if (p.empathy > 70) traits.push('善解人意');
    else if (p.empathy < 30) traits.push('理性客观');

    return `性格特点：${traits.join('、')}。`;
  }

  private buildBackgroundPrompt(character: Character): string {
    const parts: string[] = [];

    if (character.story_world) {
      parts.push(`世界背景：${character.story_world}`);
    }

    if (character.character_background) {
      parts.push(`角色背景：${character.character_background}`);
    }

    if (character.has_mission && character.current_mission) {
      parts.push(`当前使命：${character.current_mission}`);
    }

    return parts.join('\n');
  }

  private buildContextPrompt(character: Character, context?: any): string {
    const parts: string[] = [];

    // 时间设定
    if (character.use_real_time) {
      const currentTime = new Date();
      const hour = currentTime.getHours();
      const timeOfDay = this.getTimeOfDay(hour);
      const timeText = this.getTimeDescription(timeOfDay);

      parts.push(`当前时间：${currentTime.toLocaleString('zh-CN')} (${timeText})`);
    } else if (character.time_setting) {
      const timeText = this.getTimeDescription(character.time_setting);
      parts.push(`时间设定：${timeText}`);
    }

    // 附加上下文
    if (context) {
      if (context.environment) {
        parts.push(`环境：${context.environment}`);
      }
      if (context.situation) {
        parts.push(`情况：${context.situation}`);
      }
    }

    return parts.length > 0 ? parts.join('\n') : '';
  }

  private buildExamplesPrompt(character: Character): string {
    if (!character.examples || character.examples.length === 0) return '';

    const examples = character.examples
      .slice(0, 3) // 最多使用3个示例
      .map(example => `用户："${example.input}"\n你："${example.output}"`)
      .join('\n\n');

    return `对话示例：\n${examples}`;
  }

  private buildBehaviorGuidelines(character: Character): string {
    const guidelines: string[] = [
      '请始终保持角色设定，用第一人称回应',
      '回复应该自然流畅，符合角色的说话风格',
      '避免重复使用相同的表达方式',
      '根据对话内容和角色心情调整语气'
    ];

    if (character.personality_data) {
      const p = character.personality_data;

      if (p.humor > 60) {
        guidelines.push('可以适当使用幽默和俏皮话');
      }

      if (p.empathy > 60) {
        guidelines.push('对用户的情感表现出理解和关怀');
      }

      if (p.creativity > 60) {
        guidelines.push('可以发挥想象力，创造有趣的对话内容');
      }
    }

    return `行为准则：\n- ${guidelines.join('\n- ')}`;
  }

  private getMoodDescription(mood: CharacterMood): string {
    const moodMap: Record<CharacterMood, string> = {
      happy: '开心愉快',
      sad: '有些难过',
      excited: '兴奋激动',
      calm: '平静安详',
      angry: '有些生气',
      surprised: '感到惊讶',
      confused: '困惑不解',
      thinking: '若有所思'
    };

    return moodMap[mood] || '心情平静';
  }

  private getTimeOfDay(hour: number): TimeSettings {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private getTimeDescription(timeSetting: TimeSettings): string {
    const timeMap: Record<TimeSettings, string> = {
      morning: '清晨时光，阳光初照',
      afternoon: '午后时光，阳光正好',
      evening: '傍晚时分，夕阳西下',
      night: '夜深时分，月色朦胧'
    };

    return timeMap[timeSetting];
  }

  private getPresetPersonalityPrompt(preset: string): string {
    const presetMap: Record<string, string> = {
      friendly: '你是一个友善亲和的角色，总是以积极正面的态度对待他人。',
      professional: '你是一个专业严谨的角色，说话得体，行为规范。',
      energetic: '你是一个充满活力的角色，热情洋溢，充满干劲。',
      mysterious: '你是一个神秘莫测的角色，言谈中带有一丝不可捉摸的色彩。',
      humorous: '你是一个风趣幽默的角色，善于用轻松的话语调节气氛。'
    };

    return presetMap[preset] || presetMap.friendly;
  }

  /**
   * 根据角色特性调整回复风格
   */
  public adjustResponseStyle(character: Character, response: string): string {
    if (!character.personality_data) return response;

    const p = character.personality_data;

    // 如果角色很活泼，可能会使用更多感叹号
    if (p.energy > 80 && !response.includes('!') && Math.random() < 0.3) {
      response = response.replace(/[。]$/, '！');
    }

    // 如果角色很幽默，可能会添加表情符号
    if (p.humor > 70 && Math.random() < 0.2) {
      const emojis = ['😊', '😄', '😉', '🤔', '😎'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      response += ` ${randomEmoji}`;
    }

    return response;
  }

  /**
   * 评估回复是否符合角色设定
   */
  public evaluateResponse(character: Character, response: string): {
    appropriate: boolean;
    score: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 100;

    // 检查回复长度
    if (response.length < 10) {
      score -= 20;
      suggestions.push('回复太简短，可以更详细一些');
    } else if (response.length > 500) {
      score -= 10;
      suggestions.push('回复太长，可以更简洁一些');
    }

    // 检查是否包含角色名字（不应该自称全名）
    if (response.includes(character.name) && !response.includes(`我是${character.name}`)) {
      score -= 15;
      suggestions.push('避免在对话中重复提到自己的名字');
    }

    // 根据性格检查
    if (character.personality_data) {
      const p = character.personality_data;

      // 检查专业度
      if (p.professionalism > 70 && /[！!]{2,}/.test(response)) {
        score -= 10;
        suggestions.push('专业角色应避免过多使用感叹号');
      }

      // 检查友善度
      if (p.friendliness > 70 && !(/谢谢|感谢|很高兴|开心/.test(response))) {
        if (Math.random() < 0.3) {
          suggestions.push('可以表达更多友善和感谢');
        }
      }
    }

    return {
      appropriate: score >= 60,
      score: Math.max(0, Math.min(100, score)),
      suggestions
    };
  }
}