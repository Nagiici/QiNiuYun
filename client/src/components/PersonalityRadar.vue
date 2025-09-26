<template>
  <div class="card bg-base-100 shadow-lg border border-base-300">
    <div class="card-body">
      <h3 class="card-title text-lg mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        性格特征雷达图
      </h3>

      <!-- 雷达图容器 -->
      <div class="radar-chart-container mb-6">
        <canvas ref="radarCanvas" width="280" height="280" class="mx-auto"></canvas>
      </div>

      <!-- 性格滑块 -->
      <div class="space-y-4">
        <div
          v-for="(trait, index) in traits"
          :key="trait.key"
          class="form-control"
        >
          <label class="label">
            <span class="label-text">{{ trait.name }}</span>
            <span class="label-text-alt font-medium">{{ modelValue[trait.key] }}</span>
          </label>
          <input
            type="range"
            :value="modelValue[trait.key]"
            @input="updateTrait(trait.key, $event)"
            min="0"
            max="100"
            class="range range-sm"
            :class="trait.colorClass"
          />
          <div class="w-full flex justify-between text-xs px-2 text-base-content/60">
            <span>{{ trait.lowLabel }}</span>
            <span>{{ trait.highLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 预设按钮 -->
      <div class="divider text-sm">快速预设</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in presets"
          :key="preset.name"
          @click="applyPreset(preset)"
          class="btn btn-outline btn-xs"
        >
          {{ preset.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

// Props 和 Emits
const props = defineProps<{
  modelValue: {
    energy: number;
    friendliness: number;
    humor: number;
    professionalism: number;
    creativity: number;
    empathy: number;
  };
}>();

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue];
}>();

// 响应式引用
const radarCanvas = ref<HTMLCanvasElement | null>(null);

// 性格特征定义
const traits = [
  {
    key: 'energy',
    name: '活泼度',
    lowLabel: '沉稳',
    highLabel: '活泼',
    colorClass: 'range-primary'
  },
  {
    key: 'friendliness',
    name: '友善度',
    lowLabel: '冷淡',
    highLabel: '热情',
    colorClass: 'range-secondary'
  },
  {
    key: 'humor',
    name: '幽默感',
    lowLabel: '严肃',
    highLabel: '幽默',
    colorClass: 'range-accent'
  },
  {
    key: 'professionalism',
    name: '专业性',
    lowLabel: '随性',
    highLabel: '专业',
    colorClass: 'range-info'
  },
  {
    key: 'creativity',
    name: '创造力',
    lowLabel: '保守',
    highLabel: '创新',
    colorClass: 'range-warning'
  },
  {
    key: 'empathy',
    name: '同理心',
    lowLabel: '理性',
    highLabel: '感性',
    colorClass: 'range-error'
  }
];

// 预设性格
const presets = [
  {
    name: '友善',
    values: { energy: 70, friendliness: 90, humor: 60, professionalism: 50, creativity: 60, empathy: 80 }
  },
  {
    name: '专业',
    values: { energy: 40, friendliness: 60, humor: 30, professionalism: 90, creativity: 50, empathy: 60 }
  },
  {
    name: '幽默',
    values: { energy: 80, friendliness: 70, humor: 95, professionalism: 40, creativity: 85, empathy: 65 }
  },
  {
    name: '智慧',
    values: { energy: 30, friendliness: 70, humor: 40, professionalism: 80, creativity: 70, empathy: 90 }
  },
  {
    name: '活泼',
    values: { energy: 95, friendliness: 80, humor: 75, professionalism: 50, creativity: 80, empathy: 70 }
  },
  {
    name: '神秘',
    values: { energy: 40, friendliness: 30, humor: 20, professionalism: 70, creativity: 90, empathy: 50 }
  }
];

// 雷达图类
class RadarChart {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private centerX: number;
  private centerY: number;
  private radius: number;
  private labels: string[];

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.radius = Math.min(width, height) / 2 - 40;
    this.labels = ['活泼度', '友善度', '幽默感', '专业性', '创造力', '同理心'];
  }

  draw(values: number[]) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
    this.drawLabels();
    this.drawData(values);
  }

  private drawGrid() {
    const ctx = this.ctx;
    const levels = 5;

    // 动态获取网格颜色 - 根据主题调整
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.strokeStyle = isDarkTheme ? 'rgba(107, 114, 128, 0.6)' : 'rgba(226, 232, 240, 1)';
    ctx.lineWidth = 1;

    // 绘制同心多边形
    for (let level = 1; level <= levels; level++) {
      const radius = (this.radius / levels) * level;
      ctx.beginPath();

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
        const x = this.centerX + Math.cos(angle) * radius;
        const y = this.centerY + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.stroke();
    }

    // 绘制从中心到顶点的线
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
      const x = this.centerX + Math.cos(angle) * this.radius;
      const y = this.centerY + Math.sin(angle) * this.radius;

      ctx.beginPath();
      ctx.moveTo(this.centerX, this.centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  private drawLabels() {
    const ctx = this.ctx;
    // 动态获取标签文字颜色 - 根据主题调整
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDarkTheme ? 'rgba(243, 244, 246, 0.9)' : 'rgba(30, 41, 59, 1)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
      const x = this.centerX + Math.cos(angle) * (this.radius + 25);
      const y = this.centerY + Math.sin(angle) * (this.radius + 25);

      ctx.fillText(this.labels[i], x, y);
    }
  }

  private drawData(values: number[]) {
    const ctx = this.ctx;

    // 绘制填充区域
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 1)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
      const value = values[i] / 100;
      const radius = this.radius * value;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 绘制数据点
    ctx.fillStyle = 'rgba(99, 102, 241, 1)';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
      const value = values[i] / 100;
      const radius = this.radius * value;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// 方法
let radarChart: RadarChart | null = null;

const updateRadarChart = () => {
  if (!radarChart || !radarCanvas.value) return;

  const values = [
    props.modelValue.energy,
    props.modelValue.friendliness,
    props.modelValue.humor,
    props.modelValue.professionalism,
    props.modelValue.creativity,
    props.modelValue.empathy
  ];

  radarChart.draw(values);
};

const updateTrait = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = parseInt(target.value);

  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  });
};

const applyPreset = (preset: typeof presets[0]) => {
  emit('update:modelValue', { ...preset.values });
};

// 生命周期
onMounted(async () => {
  await nextTick();

  if (radarCanvas.value) {
    const ctx = radarCanvas.value.getContext('2d');
    if (ctx) {
      radarChart = new RadarChart(ctx, 280, 280);
      updateRadarChart();
    }
  }

  // 监听主题变化，当主题切换时重绘雷达图
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        // 主题变化时重绘雷达图
        nextTick(() => {
          updateRadarChart();
        });
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // 组件卸载时清理观察器
  const cleanup = () => {
    observer.disconnect();
  };

  // 在组件卸载时清理
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup);
  }
});

// 监听数据变化
watch(
  () => props.modelValue,
  () => {
    nextTick(() => {
      updateRadarChart();
    });
  },
  { deep: true }
);
</script>

<style scoped>
.radar-chart-container {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto;
}

.range::-webkit-slider-thumb {
  transition: all 0.2s ease-in-out;
}

.range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .radar-chart-container {
    width: 240px;
    height: 240px;
  }

  canvas {
    width: 240px !important;
    height: 240px !important;
  }
}
</style>