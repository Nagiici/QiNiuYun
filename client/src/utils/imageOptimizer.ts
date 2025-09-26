/**
 * 图片优化工具类
 * 提供图片压缩、格式转换、尺寸调整等功能
 */

interface ImageOptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

interface OptimizedImage {
  blob: Blob;
  dataUrl: string;
  size: number;
  width: number;
  height: number;
  compressionRatio: number;
}

export class ImageOptimizer {
  /**
   * 压缩图片
   */
  static async optimizeImage(
    file: File,
    options: ImageOptimizeOptions = {}
  ): Promise<OptimizedImage> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg',
      maintainAspectRatio = true
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法获取Canvas上下文'));
        return;
      }

      img.onload = () => {
        try {
          // 计算新的尺寸
          const dimensions = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight,
            maintainAspectRatio
          );

          canvas.width = dimensions.width;
          canvas.height = dimensions.height;

          // 绘制图片到canvas
          ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

          // 转换为指定格式
          const mimeType = `image/${format}`;
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('图片压缩失败'));
                return;
              }

              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const compressionRatio = file.size > 0 ? blob.size / file.size : 1;

                resolve({
                  blob,
                  dataUrl,
                  size: blob.size,
                  width: dimensions.width,
                  height: dimensions.height,
                  compressionRatio
                });
              };
              reader.readAsDataURL(blob);
            },
            mimeType,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      // 创建图片URL
      const url = URL.createObjectURL(file);
      img.src = url;

      // 清理URL
      img.onload = () => {
        URL.revokeObjectURL(url);
        img.onload();
      };
    });
  }

  /**
   * 计算优化后的尺寸
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (maintainAspectRatio) {
      // 保持宽高比
      const aspectRatio = originalWidth / originalHeight;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
    } else {
      // 不保持宽高比
      width = Math.min(width, maxWidth);
      height = Math.min(height, maxHeight);
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * 创建图片缩略图
   */
  static async createThumbnail(
    file: File,
    size: number = 150
  ): Promise<OptimizedImage> {
    return this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpeg'
    });
  }

  /**
   * 验证图片文件
   */
  static validateImageFile(file: File): {
    valid: boolean;
    error?: string;
  } {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '不支持的图片格式，请使用 JPEG、PNG、GIF 或 WebP 格式'
      };
    }

    // 检查文件大小（10MB限制）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: '文件大小超过限制（最大10MB）'
      };
    }

    // 检查文件名
    if (file.name.length > 100) {
      return {
        valid: false,
        error: '文件名过长'
      };
    }

    return { valid: true };
  }

  /**
   * 获取图片信息
   */
  static getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
    name: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          name: file.name
        });
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('无法读取图片信息'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 批量优化图片
   */
  static async optimizeImages(
    files: File[],
    options: ImageOptimizeOptions = {}
  ): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];

    for (const file of files) {
      try {
        const optimized = await this.optimizeImage(file, options);
        results.push(optimized);
      } catch (error) {
        console.error('图片优化失败:', file.name, error);
        // 继续处理其他图片，不中断整个过程
      }
    }

    return results;
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 检测浏览器对WebP的支持
   */
  static async supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;

      canvas.toBlob(
        (blob) => {
          resolve(blob !== null);
        },
        'image/webp'
      );
    });
  }

  /**
   * 自动选择最佳格式
   */
  static async getOptimalFormat(file: File): Promise<'jpeg' | 'png' | 'webp'> {
    const supportsWebP = await this.supportsWebP();

    if (supportsWebP) {
      return 'webp'; // WebP提供最佳压缩率
    }

    // 根据原始格式选择
    if (file.type === 'image/png') {
      return 'png'; // 保持PNG格式（支持透明度）
    }

    return 'jpeg'; // 默认使用JPEG
  }
}