/**
 * 画像ユーティリティ関数
 * プレビュー画像の生成やリサイズを行う
 */

import { logger } from '@/lib/logger';

/**
 * 画像をリサイズしてDataURLを生成
 * @param imageSrc 元画像のDataURLまたはURL
 * @param maxWidth 最大幅
 * @param maxHeight 最大高さ
 * @param quality 品質 (0-1)
 * @returns リサイズされた画像のDataURL
 */
export const resizeImageToDataURL = (
  imageSrc: string,
  maxWidth: number = 320,
  maxHeight: number = 180,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // アスペクト比を保持してリサイズ
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 画像を描画
      ctx.drawImage(img, 0, 0, width, height);
      
      // DataURLに変換
      const dataURL = canvas.toDataURL('image/jpeg', quality);
      resolve(dataURL);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageSrc;
  });
};

/**
 * テンプレート画像からプレビュー画像を生成
 * @param templateImageSrc テンプレート画像のDataURL
 * @returns プレビュー画像のDataURL
 */
export const generatePreviewFromTemplate = async (
  templateImageSrc: string
): Promise<string> => {
  try {
    return await resizeImageToDataURL(templateImageSrc, 320, 180, 0.7);
  } catch (error) {
    logger.error('プレビュー生成失敗', error, 'imageUtils');
    // フォールバック: 元画像をそのまま返す
    return templateImageSrc;
  }
};

/**
 * 画像ファイルをDataURLに変換
 * @param file 画像ファイル
 * @returns DataURL
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * 画像のサイズを取得
 * @param imageSrc 画像のDataURLまたはURL
 * @returns 画像のサイズ {width, height}
 */
export const getImageDimensions = (imageSrc: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = imageSrc;
  });
};
