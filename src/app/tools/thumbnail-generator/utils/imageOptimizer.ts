import { FILE_CONSTANTS, ValidationResult } from '../types';

// 画像の最適化を管理するクラス
export class ImageOptimizer {
  private worker: Worker | null = null;

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(
        new URL('../workers/imageOptimizer.worker.ts', import.meta.url)
      );
    }
  }

  // 画像の検証
  async validateImage(file: File): Promise<ValidationResult<File>> {
    if (!file) {
      return { isValid: false, error: 'ファイルが選択されていません。' };
    }

    if (file.size > FILE_CONSTANTS.MAX_FILE_SIZE) {
      return { isValid: false, error: 'ファイルサイズが大きすぎます（上限: 10MB）。' };
    }

    if (!FILE_CONSTANTS.ACCEPTED_IMAGE_TYPES.includes(file.type as typeof FILE_CONSTANTS.ACCEPTED_IMAGE_TYPES[number])) {
      return { isValid: false, error: '対応していないファイル形式です。' };
    }

    return { isValid: true, data: file };
  }

  // 画像の最適化
  async optimizeImage(file: File, maxDimension: number = 1280): Promise<Blob> {
    // Workerがサポートされていないブラウザでのフォールバック
    if (!this.worker) {
      return this.optimizeImageInMainThread(file, maxDimension);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const img = new Image();
          img.src = reader.result as string;

          await new Promise((resolve) => {
            img.onload = resolve;
          });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Canvas context could not be created');
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);

          // Workerにメッセージを送信
          if (!this.worker) {
            throw new Error('Worker is not initialized');
          }
          
          this.worker.postMessage({ imageData, maxDimension });

          // Workerからの応答を処理
          this.worker.onmessage = (e) => {
            if (e.data.type === 'error') {
              reject(new Error(e.data.error));
              return;
            }

            const optimizedImageData = e.data.data;
            canvas.width = optimizedImageData.width;
            canvas.height = optimizedImageData.height;
            ctx.putImageData(optimizedImageData, 0, 0);

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to create blob from canvas'));
                  return;
                }
                resolve(blob);
              },
              'image/png',
              0.85
            );
          };
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  // メインスレッドでの画像最適化（フォールバック）
  private async optimizeImageInMainThread(file: File, maxDimension: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context could not be created'));
            return;
          }

          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }
              resolve(blob);
            },
            'image/png',
            0.85
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  // クリーンアップ
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}