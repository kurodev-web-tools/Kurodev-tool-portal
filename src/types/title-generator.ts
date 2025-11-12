import { z } from 'zod';

import { titleGenerationRequestSchema, titleSuggestionSchema } from '@/types/ai';

export interface SavedPrompt {
  id: string;
  prompt: string;
  negativePrompt?: string;
  createdAt: number;
}

export const titleGenerationInputSchema = z
  .object({
    videoTheme: z.string(),
    keywords: z.string(),
    targetAudience: z.string(),
    videoMood: z.string(),
  })
  .superRefine((data, ctx) => {
    const trimmedTheme = data.videoTheme.trim();
    if (!trimmedTheme) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['videoTheme'],
        message: '動画のテーマ・内容は必須です|動画の内容や台本の要約を10文字以上入力してください',
      });
    } else if (trimmedTheme.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['videoTheme'],
        message: '10文字以上入力してください|具体的な内容を記入すると、より良いタイトルが生成されます',
      });
    } else if (trimmedTheme.length > 500) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['videoTheme'],
        message: '500文字以内で入力してください|重要なポイントをまとめて入力してください',
      });
    }

    if (data.keywords.trim().length > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['keywords'],
        message: '主要キーワードは100文字以内で入力してください|カンマ区切りで主要なキーワードのみを入力してください',
      });
    }

    if (data.targetAudience.trim().length > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['targetAudience'],
        message: 'ターゲット層は100文字以内で入力してください|簡潔にターゲット層を入力してください（例: 10代男性、VTuberファン）',
      });
    }

    if (data.videoMood.trim().length > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['videoMood'],
        message: '動画の雰囲気は100文字以内で入力してください|簡潔に雰囲気を入力してください（例: 面白い、感動、解説）',
      });
    }
  });

export type TitleGenerationFormValues = z.infer<typeof titleGenerationInputSchema>;

export const titleOptionSchema = titleSuggestionSchema.extend({
  isFavorite: z.boolean(),
});

export type TitleOption = z.infer<typeof titleOptionSchema>;

export const generationHistoryEntrySchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  titles: z.array(titleOptionSchema),
  description: z.string(),
  inputData: titleGenerationInputSchema,
});

export type GenerationHistoryEntry = z.infer<typeof generationHistoryEntrySchema>;
