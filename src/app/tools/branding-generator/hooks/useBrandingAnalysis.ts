import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { useErrorHandler } from '@/hooks/use-error-handler';
import type { ActivityStatus, BrandingFormValues } from './useBrandingForm';
import type { AnalysisResults, Concept, ColorPalette } from '../types/branding';
import { parseAnalysisResults, parseConcepts, parseColorPalettes } from '../types/branding';

/**
 * ブランディング分析ロジックフック
 */
export function useBrandingAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [colorPalettes, setColorPalettes] = useState<ColorPalette[]>([]);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const { handleAsyncError } = useErrorHandler();

  /**
   * 分析を開始
   */
  const startAnalysis = useCallback(
    async (
      activityStatus: ActivityStatus,
      formValues: BrandingFormValues,
      onSuccess: (results: AnalysisResults, concepts: Concept[]) => void,
    ) => {
      setIsAnalyzing(true);

      await handleAsyncError(
        async () => {
          // モック処理: 分析中
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // モックの分析結果（zodスキーマでバリデーション）
          const mockAnalysisData = {
            brandPersonality: '親しみやすく、エネルギッシュ',
            targetAudience: '10-20代のゲーム好きな若者',
            keyMessages: ['楽しい', '親しみやすい', '信頼できる', '面白い'],
            strengths: ['トーク力', '企画力', 'リアクション'],
          };
          const validatedAnalysisResults = parseAnalysisResults(mockAnalysisData);

          // モックのコンセプト提案（zodスキーマでバリデーション）
          const mockConceptsData = [
            {
              id: 'concept-1',
              name: '癒し系ゲーマー',
              description:
                '穏やかな声と丁寧なプレイスタイルで、視聴者に癒やしを提供するコンセプトです。',
              keywords: ['丁寧', '落ち着き', 'ゲーム', '癒し'],
              recommendedActivities: ['ゲーム実況', 'カジュアルゲーム', '雑談配信'],
            },
            {
              id: 'concept-2',
              name: '知的な解説系',
              description: '物事を深く分析し、視聴者に新しい発見を提供するコンセプトです。',
              keywords: ['解説', '分析', '専門知識', '学習'],
              recommendedActivities: ['攻略解説', '技術解説', 'ニュース解説'],
            },
            {
              id: 'concept-3',
              name: '元気いっぱいエンターテイナー',
              description: '明るくエネルギッシュな配信で、視聴者を楽しませるコンセプトです。',
              keywords: ['明るい', 'エネルギッシュ', 'エンタメ', '楽しさ'],
              recommendedActivities: ['ゲーム実況', '歌枠', '企画配信'],
            },
          ];
          const validatedConcepts = parseConcepts(mockConceptsData);

          setAnalysisResults(validatedAnalysisResults);
          setConcepts(validatedConcepts);

          onSuccess(validatedAnalysisResults, validatedConcepts);
        },
        '分析中にエラーが発生しました',
      );

      setIsAnalyzing(false);
    },
    [handleAsyncError],
  );

  /**
   * コンセプトを選択してカラーパレットを生成
   */
  const selectConceptAndGeneratePalettes = useCallback(
    async (conceptId: string, onSuccess: (palettes: ColorPalette[]) => void) => {
      setSelectedConceptId(conceptId);
      setIsAnalyzing(true);

      await handleAsyncError(
        async () => {
          // モック処理: カラーパレット生成
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const selectedConcept = concepts.find((c) => c.id === conceptId);
          // 選択したコンセプトに基づいてカラーパレットを生成（zodスキーマでバリデーション）
          const palettesData = [
            {
              id: 'palette-1',
              name: 'メインパレット',
              colors:
                conceptId === 'concept-1'
                  ? ['#9CAF88', '#B8E6B8', '#D4EDDA', '#C4E1A4', '#A8D8A8']
                  : conceptId === 'concept-2'
                    ? ['#4A90E2', '#6B9BD2', '#8FB4D3', '#A8C8E0', '#C4D9ED']
                    : ['#FF6B6B', '#FF8E8E', '#FFB3B3', '#FFD4D4', '#FFE6E6'],
              description: selectedConcept
                ? `${selectedConcept.name}に合ったカラーパレットです`
                : '推奨カラーパレット',
            },
            {
              id: 'palette-2',
              name: 'アクセントパレット',
              colors:
                conceptId === 'concept-1'
                  ? ['#C8A882', '#E6D4B8', '#F0E6D2', '#F5EBD8', '#FAF5ED']
                  : conceptId === 'concept-2'
                    ? ['#2C5F8D', '#4A7BA7', '#6B96C1', '#8FB4D3', '#B4D2E6']
                    : ['#FFD93D', '#FFE55C', '#FFF27A', '#FFF899', '#FFFFB8'],
              description: 'アクセントカラーとして使用できるパレットです',
            },
            {
              id: 'palette-3',
              name: 'モノトーンパレット',
              colors: ['#1A1A1A', '#4A4A4A', '#808080', '#B0B0B0', '#E0E0E0'],
              description: 'シンプルで洗練されたモノトーンパレットです',
            },
          ];

          const validatedPalettes = parseColorPalettes(palettesData);
          setColorPalettes(validatedPalettes);

          onSuccess(validatedPalettes);
        },
        'カラーパレットの生成に失敗しました',
      );

      setIsAnalyzing(false);
    },
    [concepts, handleAsyncError],
  );

  /**
   * カラーパレットを選択
   */
  const selectPalette = useCallback((paletteId: string) => {
    setSelectedPaletteId(paletteId);
  }, []);

  /**
   * すべての分析データをリセット
   */
  const resetAnalysis = useCallback(() => {
    setAnalysisResults(null);
    setConcepts([]);
    setSelectedConceptId(null);
    setColorPalettes([]);
    setSelectedPaletteId(null);
    setIsAnalyzing(false);
  }, []);

  return {
    isAnalyzing,
    analysisResults,
    concepts,
    selectedConceptId,
    colorPalettes,
    selectedPaletteId,
    startAnalysis,
    selectConceptAndGeneratePalettes,
    selectPalette,
    resetAnalysis,
  };
}

