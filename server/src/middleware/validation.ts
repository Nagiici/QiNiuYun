import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// 角色创建验证模式
export const characterSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': '角色名称不能为空',
    'string.max': '角色名称不能超过100个字符',
    'any.required': '角色名称是必填项'
  }),
  description: Joi.string().min(1).max(500).required().messages({
    'string.empty': '角色描述不能为空',
    'string.max': '角色描述不能超过500个字符',
    'any.required': '角色描述是必填项'
  }),
  avatar: Joi.string().allow(null, '').optional(),
  personality_preset: Joi.string().valid('friendly', 'professional', 'humorous', 'wise', 'energetic', 'mysterious').default('friendly'),
  custom_instructions: Joi.string().max(1000).allow('').optional(),
  story_background: Joi.string().max(1000).allow('').optional(),
  story_world: Joi.string().max(500).allow('').optional(),
  character_background: Joi.string().max(1000).allow('').optional(),
  has_mission: Joi.boolean().default(false),
  current_mission: Joi.string().max(500).allow('').optional(),
  current_mood: Joi.string().valid('happy', 'sad', 'excited', 'calm', 'angry', 'mysterious', 'playful').default('calm'),
  time_setting: Joi.string().valid('morning', 'noon', 'afternoon', 'evening', 'night', 'midnight').default('morning'),
  use_real_time: Joi.boolean().default(false),
  is_public: Joi.boolean().default(false),
  personality_data: Joi.object({
    energy: Joi.number().min(0).max(100).default(50),
    friendliness: Joi.number().min(0).max(100).default(50),
    humor: Joi.number().min(0).max(100).default(50),
    professionalism: Joi.number().min(0).max(100).default(50),
    creativity: Joi.number().min(0).max(100).default(50),
    empathy: Joi.number().min(0).max(100).default(50)
  }).default(),
  examples: Joi.array().items(
    Joi.object({
      input: Joi.string().min(1).max(200).required(),
      output: Joi.string().min(1).max(500).required()
    })
  ).default([])
});

// 聊天消息验证模式
export const chatMessageSchema = Joi.object({
  character_id: Joi.number().integer().positive().required().messages({
    'number.base': '角色ID必须是数字',
    'number.positive': '角色ID必须是正数',
    'any.required': '角色ID是必填项'
  }),
  message: Joi.string().min(1).max(2000).required().messages({
    'string.empty': '消息内容不能为空',
    'string.max': '消息内容不能超过2000个字符',
    'any.required': '消息内容是必填项'
  }),
  session_id: Joi.string().uuid().optional(),
  character_data: Joi.object().optional()
});

// 会话创建验证模式
export const sessionSchema = Joi.object({
  character_id: Joi.number().integer().positive().required(),
  character_name: Joi.string().min(1).max(100).required()
});

// AI配置验证模式
export const aiConfigSchema = Joi.object({
  currentProvider: Joi.string().valid('groq', 'openai', 'cohere', 'anthropic', 'ollama').required(),
  temperature: Joi.number().min(0).max(2).default(0.7),
  providers: Joi.object({
    groq: Joi.object({
      apiKey: Joi.string().min(10).optional(),
      model: Joi.string().optional()
    }).optional(),
    openai: Joi.object({
      apiKey: Joi.string().min(10).optional(),
      model: Joi.string().optional()
    }).optional(),
    cohere: Joi.object({
      apiKey: Joi.string().min(10).optional(),
      model: Joi.string().optional()
    }).optional(),
    anthropic: Joi.object({
      apiKey: Joi.string().min(10).optional(),
      model: Joi.string().optional()
    }).optional(),
    ollama: Joi.object({
      baseURL: Joi.string().uri().optional(),
      model: Joi.string().optional()
    }).optional()
  }).required()
});

// 通用验证中间件
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: '输入验证失败',
        details: errors
      });
    }

    // 将验证后的数据替换原始请求体
    req.body = value;
    next();
  };
};

// 参数验证中间件
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: '参数验证失败',
        details: errors
      });
    }

    req.params = value;
    next();
  };
};

// ID参数验证模式
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID必须是数字',
    'number.positive': 'ID必须是正数',
    'any.required': 'ID是必填项'
  })
});