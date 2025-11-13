import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { validatePrompt } from '@/lib/validation';
import { logger } from '@/lib/logger';

// 生成ステップの型定義
export interface GenerationStep {
  id: string;
  label: string;
  estimatedSeconds?: number;
}

// 生成ステップ定義
export const bgGenerationSteps: GenerationStep[] = [
  { id: 'analyze', label: 'プロンプトを分析中...', estimatedSeconds: 3 },
  { id: 'prepare', label: '生成パラメータを設定中...', estimatedSeconds: 2 },
  { id: 'generate', label: '画像を生成中...', estimatedSeconds: 10 },
  { id: 'process', label: '画像を処理中...', estimatedSeconds: 3 },
  { id: 'complete', label: '完成！', estimatedSeconds: 0 },
];

// 生成画像の型定義
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  category?: string;
  style?: string;
  resolution?: string;
  color?: string;
  createdAt: number;
  downloadCount?: number;
}

interface BackgroundGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  category?: string;
  style?: string;
  resolution?: string;
  color?: string;
  imageCount: string;
  onImagesGenerated: (images: GeneratedImage[]) => void;
  onHistoryAdd?: (imageData: {
    url: string;
    prompt: string;
    negativePrompt?: string;
    category?: string;
    style?: string;
    resolution?: string;
    color?: string;
  }) => void;
  onAutoTag?: (imageId: string, image: GeneratedImage) => void;
  onExpandPreview?: () => void;
  onError?: (error: Error) => void;
}

interface BackgroundGenerationReturn {
  isGenerating: boolean;
  generationStep: string | null;
  estimatedTimeRemaining: number;
  generate: (options: BackgroundGenerationOptions) => Promise<void>;
  cancel: () => void;
}

/**
 * バーチャル背景生成プロセスを管理するフック
 * AbortControllerとprogressロジックを管理
 */
export function useBackgroundGeneration(): BackgroundGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // AbortSignal対応のsetTimeoutラッパー
  const sleep = useCallback((ms: number, signal: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error('Aborted'));
        return;
      }
      const timeoutId = setTimeout(() => {
        if (signal.aborted) {
          reject(new Error('Aborted'));
        } else {
          resolve();
        }
      }, ms);
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Aborted'));
      });
    });
  }, []);

  // 生成処理
  const generate = useCallback(
    async (options: BackgroundGenerationOptions) => {
      const {
        prompt,
        negativePrompt,
        category,
        style,
        resolution,
        color,
        imageCount,
        onImagesGenerated,
        onHistoryAdd,
        onAutoTag,
        onExpandPreview,
        onError,
      } = options;

      // バリデーション
      const promptError = validatePrompt(prompt);
      if (promptError) {
        logger.error('バリデーションエラー', { error: promptError }, 'useBackgroundGeneration');
        toast.error('プロンプトの検証エラー', {
          description: promptError,
        });
        if (onError) {
          onError(new Error(promptError));
        }
        return;
      }

      setIsGenerating(true);
      onExpandPreview?.();

      // 新しいAbortControllerを作成
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const signal = abortController.signal;

      setGenerationStep(null);
      setEstimatedTimeRemaining(0);

      try {
        // 各ステップを順次実行
        for (let i = 0; i < bgGenerationSteps.length; i++) {
          if (signal.aborted) {
            return; // キャンセルされた場合は処理を中断
          }

          const step = bgGenerationSteps[i];
          setGenerationStep(step.id);

          // 残り推定時間を計算
          const remainingSteps = bgGenerationSteps.slice(i);
          const totalRemaining = remainingSteps.reduce((sum, s) => sum + (s.estimatedSeconds || 0), 0);
          setEstimatedTimeRemaining(totalRemaining);

          // ステップごとの処理時間をシミュレート
          const stepDuration = (step.estimatedSeconds || 1) * 1000;
          const startTime = Date.now();

          // 残り時間のカウントダウン
          const countdownInterval = setInterval(() => {
            if (signal.aborted) {
              clearInterval(countdownInterval);
              return;
            }
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(
              0,
              (step.estimatedSeconds || 1) -
                elapsed +
                remainingSteps.slice(1).reduce((sum, s) => sum + (s.estimatedSeconds || 0), 0),
            );
            setEstimatedTimeRemaining(remaining);
          }, 100);

          try {
            await sleep(stepDuration, signal);
          } catch (err) {
            clearInterval(countdownInterval);
            if (err instanceof Error && err.message === 'Aborted') {
              return; // キャンセルされた
            }
            throw err;
          }
          clearInterval(countdownInterval);

          if (signal.aborted) {
            return;
          }
        }

        if (signal.aborted) {
          return;
        }

        // プレースホルダー画像を生成
        const newImages: GeneratedImage[] = Array.from({ length: parseInt(imageCount) }, (_, i) => ({
          id: `img-${Date.now()}-${i}`,
          url: `https://picsum.photos/800/600?random=${Date.now() + i}`,
          prompt: prompt || '',
          negativePrompt: negativePrompt || undefined,
          category: category || undefined,
          style: style || undefined,
          resolution: resolution || undefined,
          color: color || undefined,
          createdAt: Date.now(),
          downloadCount: 0,
        }));

        onImagesGenerated(newImages);

        // 履歴に追加（自動保存）
        if (onHistoryAdd) {
          newImages.forEach((img) => {
            onHistoryAdd({
              url: img.url,
              prompt: img.prompt,
              negativePrompt: img.negativePrompt,
              category: img.category,
              style: img.style,
              resolution: img.resolution,
              color: img.color,
            });
          });
        }

        // 自動タグ付け
        if (onAutoTag) {
          newImages.forEach((img) => {
            onAutoTag(img.id, img);
          });
        }

        // 生成完了通知
        toast.success(`${imageCount}枚の背景を生成しました`, {
          description: '生成が完了しました',
        });

        // ステップをリセット
        setGenerationStep(null);
        setEstimatedTimeRemaining(0);
      } catch (err) {
        if (err instanceof Error && err.message === 'Aborted') {
          return; // キャンセルされた場合はエラーを無視
        }
        logger.error('背景生成中にエラーが発生しました', err, 'useBackgroundGeneration');
        if (onError) {
          onError(err instanceof Error ? err : new Error('Unknown error'));
        }
        throw err;
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    },
    [sleep],
  );

  // キャンセル処理
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setGenerationStep(null);
    setEstimatedTimeRemaining(0);
    toast.info('生成をキャンセルしました');
  }, []);

  return {
    isGenerating,
    generationStep,
    estimatedTimeRemaining,
    generate,
    cancel,
  };
}

