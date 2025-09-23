// 画像処理用のWebWorker
// このコードはワーカースレッドで実行される

import { FILE_CONSTANTS } from '../types';

// 画像の圧縮と最適化を行う関数
async function optimizeImage(imageData: ImageData, maxDimension: number = 1280): Promise<ImageData> {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context could not be created');
  }

  // 元の画像を描画
  ctx.putImageData(imageData, 0, 0);

  // アスペクト比を維持しながらリサイズ
  let newWidth = imageData.width;
  let newHeight = imageData.height;

  if (newWidth > maxDimension || newHeight > maxDimension) {
    if (newWidth > newHeight) {
      newHeight = (newHeight / newWidth) * maxDimension;
      newWidth = maxDimension;
    } else {
      newWidth = (newWidth / newHeight) * maxDimension;
      newHeight = maxDimension;
    }
  }

  // 新しいキャンバスを作成
  const resizedCanvas = new OffscreenCanvas(newWidth, newHeight);
  const resizedCtx = resizedCanvas.getContext('2d');

  if (!resizedCtx) {
    throw new Error('Resized canvas context could not be created');
  }

  // 高品質な補間方法を設定
  resizedCtx.imageSmoothingEnabled = true;
  resizedCtx.imageSmoothingQuality = 'high';

  // リサイズした画像を描画
  resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

  // 新しい ImageData を返す
  return resizedCtx.getImageData(0, 0, newWidth, newHeight);
}

// メインスレッドからのメッセージを処理
self.onmessage = async (e: MessageEvent) => {
  try {
    const { imageData, maxDimension } = e.data;
    const optimizedImageData = await optimizeImage(imageData, maxDimension);
    self.postMessage({ type: 'success', data: optimizedImageData });
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
};