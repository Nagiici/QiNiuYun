/**
 * 情感分析服务
 * 负责分析文本中的情感信息
 */

import { EmotionAnalysisResponse } from '../../types';

export class EmotionService {
  private emotionKeywords: Record<string, string[]> = {
    happy: ['开心', '高兴', '快乐', '愉快', '兴奋', '欢喜', '喜悦', '满足', '乐观', '积极', '笑', '哈哈', '😊', '😄', '🤗'],
    sad: ['伤心', '难过', '悲伤', '沮丧', '失望', '沉重', '痛苦', '忧伤', '落寞', '孤独', '哭', '眼泪', '😢', '😭', '💔'],
    excited: ['兴奋', '激动', '热情', '狂欢', '振奋', '亢奋', '冲动', '充满活力', '精力充沛', '🎉', '🔥', '💪'],
    calm: ['平静', '冷静', '安静', '宁静', '祥和', '淡然', '从容', '稳定', '放松', '安详', '😌', '🧘'],
    angry: ['愤怒', '生气', '恼火', '暴躁', '恼怒', '火大', '怒火', '气愤', '不满', '讨厌', '😠', '😡', '🤬'],
    surprised: ['惊讶', '震惊', '意外', '吃惊', '惊奇', '不敢相信', '没想到', '哇', '天哪', '😲', '😮', '🤯'],
    confused: ['困惑', '迷惑', '不解', '疑惑', '搞不懂', '不明白', '糊涂', '茫然', '？', '什么', '😕', '🤔'],
    thinking: ['思考', '想想', '考虑', '琢磨', '思索', '沉思', '深思', '想', '念', '回忆', '🤔', '💭'],
    love: ['爱', '喜欢', '爱慕', '钟情', '心动', '倾心', '迷恋', '深爱', '💖', '💕', '😍', '🥰'],
    fear: ['害怕', '恐惧', '担心', '紧张', '忐忑', '不安', '焦虑', '恐慌', '怕', '吓', '😨', '😰', '😱']
  };

  private sentimentKeywords = {
    positive: ['好', '棒', '赞', '优秀', '完美', '满意', '成功', '胜利', '美好', '温暖', '希望', '光明'],
    negative: ['坏', '差', '糟', '失败', '痛苦', '困难', '问题', '错误', '黑暗', '绝望', '危险', '麻烦']
  };

  /**
   * 分析文本情感
   */
  public async analyzeEmotion(text: string): Promise<EmotionAnalysisResponse> {
    const startTime = Date.now();

    // 清理文本
    const cleanText = this.cleanText(text);

    // 分析各种情感的得分
    const emotionScores = this.calculateEmotionScores(cleanText);

    // 确定主要情感
    const primaryEmotion = this.getPrimaryEmotion(emotionScores);

    // 计算情感置信度
    const confidence = this.calculateConfidence(emotionScores, primaryEmotion);

    // 分析情感极性和主观性
    const sentiment = this.analyzeSentiment(cleanText);

    const processingTime = Date.now() - startTime;

    return {
      primary_emotion: primaryEmotion,
      confidence,
      emotions: emotionScores,
      sentiment,
      metadata: {
        model_used: 'rule-based-emotion-analyzer',
        processing_time: processingTime,
        language_detected: this.detectLanguage(cleanText)
      }
    };
  }

  private cleanText(text: string): string {
    // 转换为小写并移除多余空格
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private calculateEmotionScores(text: string): Record<string, number> {
    const scores: Record<string, number> = {};
    const textLength = text.length;

    if (textLength === 0) {
      return { neutral: 1.0 };
    }

    // 计算每种情感的得分
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0;

      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        if (matches) {
          // 根据关键词长度和出现次数计算得分
          score += matches.length * (keyword.length / 10 + 0.1);
        }
      });

      // 标准化得分
      scores[emotion] = Math.min(1.0, score / Math.sqrt(textLength / 10 + 1));
    });

    // 如果没有检测到明显情感，设置为中性
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (totalScore < 0.1) {
      scores.neutral = 0.8;
    }

    return this.normalizeScores(scores);
  }

  private normalizeScores(scores: Record<string, number>): Record<string, number> {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

    if (total === 0) {
      return scores;
    }

    const normalized: Record<string, number> = {};
    Object.entries(scores).forEach(([emotion, score]) => {
      normalized[emotion] = Number((score / total).toFixed(3));
    });

    return normalized;
  }

  private getPrimaryEmotion(scores: Record<string, number>): string {
    let maxEmotion = 'neutral';
    let maxScore = 0;

    Object.entries(scores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion;
      }
    });

    return maxEmotion;
  }

  private calculateConfidence(scores: Record<string, number>, primaryEmotion: string): number {
    const primaryScore = scores[primaryEmotion] || 0;
    const otherScores = Object.values(scores).filter((score, index) =>
      Object.keys(scores)[index] !== primaryEmotion
    );

    const maxOtherScore = Math.max(...otherScores, 0);
    const difference = primaryScore - maxOtherScore;

    // 置信度基于主要情感得分和其与第二高得分的差值
    return Math.min(1.0, Math.max(0.1, primaryScore + difference * 0.5));
  }

  private analyzeSentiment(text: string): {
    polarity: number;
    subjectivity: number;
  } {
    let positiveScore = 0;
    let negativeScore = 0;
    let subjectiveScore = 0;

    // 计算积极情感得分
    this.sentimentKeywords.positive.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      if (matches) {
        positiveScore += matches.length;
      }
    });

    // 计算消极情感得分
    this.sentimentKeywords.negative.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      if (matches) {
        negativeScore += matches.length;
      }
    });

    // 计算主观性（基于情感关键词总数）
    const totalEmotionalWords = Object.values(this.emotionKeywords).flat();
    totalEmotionalWords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      if (matches) {
        subjectiveScore += matches.length;
      }
    });

    // 标准化极性得分 (-1 到 1)
    const totalSentiment = positiveScore + negativeScore;
    const polarity = totalSentiment === 0 ? 0 : (positiveScore - negativeScore) / totalSentiment;

    // 标准化主观性得分 (0 到 1)
    const textWords = text.split(/\s+/).length;
    const subjectivity = Math.min(1.0, subjectiveScore / textWords);

    return {
      polarity: Number(polarity.toFixed(3)),
      subjectivity: Number(subjectivity.toFixed(3))
    };
  }

  private detectLanguage(text: string): string {
    // 简单的中英文检测
    const chineseChars = text.match(/[\u4e00-\u9fff]/g);
    const englishChars = text.match(/[a-zA-Z]/g);

    const chineseCount = chineseChars ? chineseChars.length : 0;
    const englishCount = englishChars ? englishChars.length : 0;

    if (chineseCount > englishCount) {
      return 'zh-CN';
    } else if (englishCount > chineseCount) {
      return 'en-US';
    } else {
      return 'mixed';
    }
  }

  /**
   * 批量分析情感
   */
  public async analyzeEmotionsBatch(texts: string[]): Promise<EmotionAnalysisResponse[]> {
    return Promise.all(texts.map(text => this.analyzeEmotion(text)));
  }

  /**
   * 获取情感建议
   */
  public getEmotionSuggestions(emotion: string): string[] {
    const suggestions: Record<string, string[]> = {
      happy: ['保持这种积极的心态！', '快乐是会传染的~', '继续享受这美好的时光'],
      sad: ['一切都会好起来的', '我在这里陪伴你', '允许自己感受这些情感是正常的'],
      excited: ['你的热情很感染人！', '保持这份激情', '记得适度休息哦'],
      calm: ['这种平静很珍贵', '保持内心的宁静', '静下心来思考也很好'],
      angry: ['深呼吸，让情绪慢慢平复', '愤怒是正常情感，但要合理表达', '找个安全的方式发泄情绪'],
      confused: ['困惑说明你在思考，这很好', '一步步来，总会找到答案', '不妨换个角度思考'],
      fear: ['恐惧是人之常情', '勇敢面对，你比想象中坚强', '寻求支持和帮助很重要']
    };

    return suggestions[emotion] || ['情感是人生的一部分，学会与之相处'];
  }

  /**
   * 情感趋势分析
   */
  public analyzeEmotionTrend(emotionHistory: Array<{
    emotion: string;
    timestamp: string;
  }>): {
    trend: 'improving' | 'declining' | 'stable';
    dominant_emotions: string[];
    recommendations: string[];
  } {
    if (emotionHistory.length < 3) {
      return {
        trend: 'stable',
        dominant_emotions: [],
        recommendations: ['需要更多数据来分析情感趋势']
      };
    }

    // 计算情感分布
    const emotionCounts: Record<string, number> = {};
    emotionHistory.forEach(({ emotion }) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    // 找出主要情感
    const dominant_emotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // 简单的趋势分析（基于最近的情感变化）
    const recent = emotionHistory.slice(-5);
    const positiveEmotions = ['happy', 'excited', 'calm', 'love'];
    const negativeEmotions = ['sad', 'angry', 'fear'];

    let positiveCount = 0;
    let negativeCount = 0;

    recent.forEach(({ emotion }) => {
      if (positiveEmotions.includes(emotion)) positiveCount++;
      if (negativeEmotions.includes(emotion)) negativeCount++;
    });

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (positiveCount > negativeCount + 1) trend = 'improving';
    else if (negativeCount > positiveCount + 1) trend = 'declining';

    // 生成建议
    const recommendations = this.generateTrendRecommendations(trend, dominant_emotions);

    return {
      trend,
      dominant_emotions,
      recommendations
    };
  }

  private generateTrendRecommendations(
    trend: 'improving' | 'declining' | 'stable',
    dominantEmotions: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (trend === 'improving') {
      recommendations.push('情感状态呈积极趋势，继续保持！');
    } else if (trend === 'declining') {
      recommendations.push('注意情感健康，考虑寻求支持或专业帮助');
    } else {
      recommendations.push('情感状态相对稳定');
    }

    dominantEmotions.forEach(emotion => {
      const emotionAdvice = this.getEmotionSuggestions(emotion);
      recommendations.push(`关于${emotion}：${emotionAdvice[0]}`);
    });

    return recommendations.slice(0, 4); // 限制建议数量
  }
}