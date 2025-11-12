import { z } from 'zod';

export const titleGenerationRequestSchema = z.object({
  videoTheme: z.string(),
  keywords: z.string().optional(),
  targetAudience: z.string().optional(),
  mood: z.string().optional(),
  baseTitle: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
});

export type TitleGenerationRequest = z.infer<typeof titleGenerationRequestSchema>;

export const titleSuggestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  emphasis: z.enum(['low', 'medium', 'high']).optional(),
});

export type TitleSuggestion = z.infer<typeof titleSuggestionSchema>;

export const titleGenerationResponseSchema = z.object({
  suggestions: z.array(titleSuggestionSchema),
  recommendedHashtags: z.array(z.string()),
  insights: z.array(z.string()).optional(),
});

export type TitleGenerationResponse = z.infer<typeof titleGenerationResponseSchema>;

