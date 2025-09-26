<template>
  <div class="image-upload-container">
    <!-- 上传区域 -->
    <div
      class="upload-area"
      :class="{
        'drag-over': isDragOver,
        'has-image': previewUrl
      }"
      @click="triggerFileInput"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
    >
      <!-- 预览图片 -->
      <div v-if="previewUrl" class="image-preview">
        <img
          :src="previewUrl"
          :alt="fileName"
          class="preview-image"
        />
        <div class="image-overlay">
          <button
            class="btn btn-sm btn-circle btn-ghost"
            @click.stop="removeImage"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- 上传提示 -->
      <div v-else class="upload-prompt">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        <p class="upload-text">点击或拖拽图片到此处</p>
        <p class="upload-hint">支持 JPG、PNG、GIF、WebP 格式，最大 10MB</p>
      </div>
    </div>

    <!-- 文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- 优化选项 -->
    <div v-if="previewUrl" class="optimization-options">
      <div class="options-header">
        <h4 class="text-sm font-medium">优化设置</h4>
      </div>

      <div class="options-grid">
        <!-- 质量设置 -->
        <div class="option-group">
          <label class="label">
            <span class="label-text text-xs">压缩质量</span>
            <span class="label-text-alt text-xs">{{ Math.round(quality * 100) }}%</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            v-model.number="quality"
            class="range range-xs range-primary"
          />
        </div>

        <!-- 最大宽度 -->
        <div class="option-group">
          <label class="label">
            <span class="label-text text-xs">最大宽度</span>
          </label>
          <select v-model.number="maxWidth" class="select select-xs select-bordered">
            <option :value="0">原始尺寸</option>
            <option :value="800">800px</option>
            <option :value="1200">1200px</option>
            <option :value="1920">1920px</option>
          </select>
        </div>

        <!-- 输出格式 -->
        <div class="option-group">
          <label class="label">
            <span class="label-text text-xs">输出格式</span>
          </label>
          <select v-model="outputFormat" class="select select-xs select-bordered">
            <option value="auto">自动选择</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp" v-if="supportsWebP">WebP</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 文件信息 -->
    <div v-if="fileInfo" class="file-info">
      <div class="info-row">
        <span class="info-label">文件名：</span>
        <span class="info-value">{{ fileInfo.name }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">尺寸：</span>
        <span class="info-value">{{ fileInfo.width }} × {{ fileInfo.height }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">大小：</span>
        <span class="info-value">{{ formatFileSize(fileInfo.size) }}</span>
      </div>
      <div v-if="optimizedInfo" class="info-row">
        <span class="info-label">优化后：</span>
        <span class="info-value text-success">
          {{ formatFileSize(optimizedInfo.size) }}
          ({{ Math.round((1 - optimizedInfo.compressionRatio) * 100) }}% 压缩)
        </span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="previewUrl" class="actions">
      <button
        class="btn btn-primary btn-sm"
        :class="{ 'loading': optimizing }"
        :disabled="optimizing"
        @click="optimizeAndUpload"
      >
        {{ optimizing ? '优化中...' : '上传图片' }}
      </button>
      <button class="btn btn-ghost btn-sm" @click="reset">重新选择</button>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="alert alert-error alert-sm mt-2">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      <span class="text-xs">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ImageOptimizer } from '@/utils/imageOptimizer';

interface Props {
  modelValue?: string;
  maxSize?: number;
  accept?: string;
}

interface Emits {
  'update:modelValue': [value: string];
  'upload': [file: Blob, info: any];
  'error': [error: string];
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 10 * 1024 * 1024, // 10MB
  accept: 'image/*'
});

const emit = defineEmits<Emits>();

// 响应式数据
const fileInputRef = ref<HTMLInputElement>();
const isDragOver = ref(false);
const previewUrl = ref('');
const fileName = ref('');
const optimizing = ref(false);
const error = ref('');
const supportsWebP = ref(false);

// 优化选项
const quality = ref(0.8);
const maxWidth = ref(1920);
const outputFormat = ref<'auto' | 'jpeg' | 'png' | 'webp'>('auto');

// 文件信息
const fileInfo = ref<{
  name: string;
  width: number;
  height: number;
  size: number;
  type: string;
} | null>(null);

const optimizedInfo = ref<{
  size: number;
  compressionRatio: number;
} | null>(null);

const selectedFile = ref<File | null>(null);

// 计算属性
const hasImage = computed(() => !!previewUrl.value);

// 方法
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const processFile = async (file: File) => {
  error.value = '';

  // 验证文件
  const validation = ImageOptimizer.validateImageFile(file);
  if (!validation.valid) {
    error.value = validation.error || '文件验证失败';
    return;
  }

  try {
    // 获取图片信息
    const info = await ImageOptimizer.getImageInfo(file);
    fileInfo.value = info;
    selectedFile.value = file;

    // 创建预览
    previewUrl.value = URL.createObjectURL(file);
    fileName.value = file.name;

    // 清除之前的优化信息
    optimizedInfo.value = null;

    emit('update:modelValue', previewUrl.value);
  } catch (err) {
    error.value = '图片处理失败';
    console.error(err);
  }
};

const optimizeAndUpload = async () => {
  if (!selectedFile.value) return;

  optimizing.value = true;
  error.value = '';

  try {
    // 确定输出格式
    let format = outputFormat.value;
    if (format === 'auto') {
      format = await ImageOptimizer.getOptimalFormat(selectedFile.value);
    }

    // 优化图片
    const optimized = await ImageOptimizer.optimizeImage(selectedFile.value, {
      quality: quality.value,
      maxWidth: maxWidth.value || undefined,
      maxHeight: maxWidth.value || undefined,
      format: format as 'jpeg' | 'png' | 'webp'
    });

    optimizedInfo.value = {
      size: optimized.size,
      compressionRatio: optimized.compressionRatio
    };

    // 发送上传事件
    emit('upload', optimized.blob, {
      original: fileInfo.value,
      optimized: {
        width: optimized.width,
        height: optimized.height,
        size: optimized.size,
        compressionRatio: optimized.compressionRatio
      }
    });

    emit('update:modelValue', optimized.dataUrl);
  } catch (err) {
    error.value = '图片优化失败';
    console.error(err);
    emit('error', '图片优化失败');
  } finally {
    optimizing.value = false;
  }
};

const removeImage = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  reset();
};

const reset = () => {
  previewUrl.value = '';
  fileName.value = '';
  selectedFile.value = null;
  fileInfo.value = null;
  optimizedInfo.value = null;
  error.value = '';

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }

  emit('update:modelValue', '');
};

const formatFileSize = ImageOptimizer.formatFileSize;

// 生命周期
onMounted(async () => {
  supportsWebP.value = await ImageOptimizer.supportsWebP();

  // 如果有初始值，设置预览
  if (props.modelValue) {
    previewUrl.value = props.modelValue;
  }
});
</script>

<style scoped>
.image-upload-container {
  width: 100%;
  max-width: 400px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.upload-area.has-image {
  padding: 0;
  border: none;
}

.image-preview {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  stroke-width: 1;
}

.upload-text {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  opacity: 0.7;
  margin: 0;
}

.optimization-options {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.options-header {
  margin-bottom: 0.75rem;
}

.options-grid {
  display: grid;
  gap: 0.75rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  color: #111827;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.hidden {
  display: none;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .upload-area:hover,
  .upload-area.drag-over {
    background-color: #1f2937;
  }

  .optimization-options {
    background-color: #1f2937;
    border-color: #374151;
  }

  .file-info {
    background-color: #1f2937;
  }

  .info-value {
    color: #f9fafb;
  }
}
</style>