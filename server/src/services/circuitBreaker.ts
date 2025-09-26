import CircuitBreaker from 'opossum';
import axios from 'axios';

// 断路器配置选项
const circuitBreakerOptions = {
  timeout: 30000, // 30秒超时
  errorThresholdPercentage: 50, // 50%错误率时开启断路器
  resetTimeout: 60000, // 60秒后尝试重置
  rollingCountTimeout: 10000, // 10秒滚动窗口
  rollingCountBuckets: 10, // 滚动窗口分为10个桶
  volumeThreshold: 10, // 至少10个请求后才考虑开启断路器
  capacity: 2 // 半开状态下最多允许2个请求
};

// AI提供商的断路器映射
const circuitBreakers: Map<string, CircuitBreaker> = new Map();

// 创建AI服务调用函数
const createAIServiceCall = (provider: string) => {
  return async (requestData: any) => {
    console.log(`Making AI request to ${provider}...`);

    switch (provider) {
      case 'groq':
        return await makeGroqRequest(requestData);
      case 'openai':
        return await makeOpenAIRequest(requestData);
      case 'cohere':
        return await makeCohereRequest(requestData);
      case 'anthropic':
        return await makeAnthropicRequest(requestData);
      case 'ollama':
        return await makeOllamaRequest(requestData);
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  };
};

// AI提供商具体实现函数
async function makeGroqRequest(data: any) {
  const { prompt, apiKey } = data;
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );
  return response.data.choices[0].message.content;
}

async function makeOpenAIRequest(data: any) {
  const { prompt, apiKey } = data;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );
  return response.data.choices[0].message.content;
}

async function makeCohereRequest(data: any) {
  const { prompt, apiKey } = data;
  const response = await axios.post(
    'https://api.cohere.ai/v1/generate',
    {
      model: 'command-r-plus',
      prompt: prompt,
      max_tokens: 1500,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );
  return response.data.generations[0].text;
}

async function makeAnthropicRequest(data: any) {
  const { prompt, apiKey } = data;
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );
  return response.data.content[0].text;
}

async function makeOllamaRequest(data: any) {
  const { prompt, baseURL } = data;
  const response = await axios.post(
    `${baseURL}/api/generate`,
    {
      model: 'llama3.1:8b',
      prompt: prompt,
      stream: false
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    }
  );
  return response.data.response;
}

// 获取或创建断路器
function getCircuitBreaker(provider: string): CircuitBreaker {
  if (!circuitBreakers.has(provider)) {
    const aiServiceCall = createAIServiceCall(provider);
    const breaker = new CircuitBreaker(aiServiceCall, circuitBreakerOptions);

    // 事件监听
    breaker.on('open', () => {
      console.log(`⚠️ Circuit breaker for ${provider} is OPEN - failing fast`);
    });

    breaker.on('halfOpen', () => {
      console.log(`🔄 Circuit breaker for ${provider} is HALF-OPEN - testing service`);
    });

    breaker.on('close', () => {
      console.log(`✅ Circuit breaker for ${provider} is CLOSED - service recovered`);
    });

    breaker.on('fallback', (result) => {
      console.log(`🔄 Circuit breaker for ${provider} triggered fallback:`, result);
    });

    // 设置降级策略
    breaker.fallback((error) => {
      console.log(`Fallback triggered for ${provider}:`, error.message);
      return {
        response: "抱歉，AI服务暂时不可用，请稍后再试。",
        fallback: true,
        provider: provider,
        error: error.message
      };
    });

    circuitBreakers.set(provider, breaker);
  }

  return circuitBreakers.get(provider)!;
}

// AI服务管理器
export class AIServiceManager {
  // 调用AI服务（带断路器保护）
  static async callAIService(provider: string, requestData: any) {
    const breaker = getCircuitBreaker(provider);

    try {
      const result = await breaker.fire(requestData);
      return {
        response: result,
        provider: provider,
        success: true
      };
    } catch (error) {
      console.error(`AI service call failed for ${provider}:`, error);

      // 如果是断路器降级响应，直接返回
      if (error && typeof error === 'object' && 'fallback' in error) {
        return error;
      }

      // 其他错误抛出
      throw error;
    }
  }

  // 获取所有断路器状态
  static getCircuitBreakerStats() {
    const stats: any = {};

    circuitBreakers.forEach((breaker, provider) => {
      stats[provider] = {
        state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF-OPEN' : 'CLOSED',
        stats: breaker.stats,
        options: {
          timeout: breaker.options.timeout,
          errorThresholdPercentage: breaker.options.errorThresholdPercentage,
          resetTimeout: breaker.options.resetTimeout
        }
      };
    });

    return stats;
  }

  // 手动重置断路器
  static resetCircuitBreaker(provider: string) {
    const breaker = circuitBreakers.get(provider);
    if (breaker) {
      breaker.close();
      console.log(`Circuit breaker for ${provider} manually reset`);
    }
  }

  // 重置所有断路器
  static resetAllCircuitBreakers() {
    circuitBreakers.forEach((breaker, provider) => {
      breaker.close();
      console.log(`Circuit breaker for ${provider} reset`);
    });
  }
}