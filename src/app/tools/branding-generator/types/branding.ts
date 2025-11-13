import { z } from 'zod';

/**
 * ブランディング分析結果のZodスキーマ
 * JSON decode時にバリデーションを行う
 */
export const analysisResultsSchema = z.object({
  brandPersonality: z.string().min(1, 'ブランドパーソナリティは必須です'),
  targetAudience: z.string().min(1, 'ターゲットオーディエンスは必須です'),
  keyMessages: z.array(z.string()).min(1, 'キーメッセージは1つ以上必要です'),
  strengths: z.array(z.string()).min(1, '強みは1つ以上必要です'),
});

/**
 * ブランディング分析結果の型定義
 */
export type AnalysisResults = z.infer<typeof analysisResultsSchema>;

/**
 * コンセプトのZodスキーマ
 */
export const conceptSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'コンセプト名は必須です'),
  description: z.string().min(1, '説明は必須です'),
  keywords: z.array(z.string()),
  recommendedActivities: z.array(z.string()),
});

/**
 * コンセプトの型定義
 */
export type Concept = z.infer<typeof conceptSchema>;

/**
 * カラーパレットのZodスキーマ
 */
export const colorPaletteSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'パレット名は必須です'),
  colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'カラーコードは#RRGGBB形式である必要があります')),
  description: z.string().optional(),
});

/**
 * カラーパレットの型定義
 */
export type ColorPalette = z.infer<typeof colorPaletteSchema>;

/**
 * JSONデータをAnalysisResultsに変換し、バリデーションを行う
 * @param data バリデーション対象のデータ
 * @returns バリデーション済みのAnalysisResults
 * @throws ZodError バリデーションエラー時
 */
export function parseAnalysisResults(data: unknown): AnalysisResults {
  return analysisResultsSchema.parse(data);
}

/**
 * JSONデータをConceptに変換し、バリデーションを行う
 * @param data バリデーション対象のデータ
 * @returns バリデーション済みのConcept
 * @throws ZodError バリデーションエラー時
 */
export function parseConcept(data: unknown): Concept {
  return conceptSchema.parse(data);
}

/**
 * JSONデータをConcept配列に変換し、バリデーションを行う
 * @param data バリデーション対象のデータ
 * @returns バリデーション済みのConcept配列
 * @throws ZodError バリデーションエラー時
 */
export function parseConcepts(data: unknown): Concept[] {
  return z.array(conceptSchema).parse(data);
}

/**
 * JSONデータをColorPaletteに変換し、バリデーションを行う
 * @param data バリデーション対象のデータ
 * @returns バリデーション済みのColorPalette
 * @throws ZodError バリデーションエラー時
 */
export function parseColorPalette(data: unknown): ColorPalette {
  return colorPaletteSchema.parse(data);
}

/**
 * JSONデータをColorPalette配列に変換し、バリデーションを行う
 * @param data バリデーション対象のデータ
 * @returns バリデーション済みのColorPalette配列
 * @throws ZodError バリデーションエラー時
 */
export function parseColorPalettes(data: unknown): ColorPalette[] {
  return z.array(colorPaletteSchema).parse(data);
}

