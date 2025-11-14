import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Target, Users } from 'lucide-react';
import type { AnalysisResults } from '../types/branding';

interface AnalysisResultsDisplayProps {
  analysisResults: AnalysisResults;
  onBack: () => void;
  onGenerateConcepts: () => void;
  isGenerating?: boolean;
}

/**
 * 分析結果表示コンポーネント
 */
export function AnalysisResultsDisplay({
  analysisResults,
  onBack,
  onGenerateConcepts,
  isGenerating = false,
}: AnalysisResultsDisplayProps) {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pr-2 sm:pr-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#E0E0E0]">分析結果</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A] shrink-0 w-full sm:w-auto"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <Button
            onClick={onGenerateConcepts}
            disabled={isGenerating}
            className="bg-[#0070F3] hover:bg-[#0051CC] text-white shrink-0 w-full sm:w-auto focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 focus:ring-offset-[#1A1A1A]"
          >
            コンセプトを提案する
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#E0E0E0]">
            <Target className="h-5 w-5" />
            ブランドパーソナリティ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-[#E0E0E0]">{analysisResults.brandPersonality}</p>
        </CardContent>
      </Card>

      <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#E0E0E0]">
            <Users className="h-5 w-5" />
            ターゲットオーディエンス
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-[#E0E0E0]">{analysisResults.targetAudience}</p>
        </CardContent>
      </Card>

      <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
        <CardHeader>
          <CardTitle className="text-[#E0E0E0]">強み・特徴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysisResults.strengths?.map((strength: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]"
              >
                {strength}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
        <CardHeader>
          <CardTitle className="text-[#E0E0E0]">キーメッセージ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysisResults.keyMessages?.map((message: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-[#0070F3]/10 border-[#0070F3]/50 text-[#0070F3]"
              >
                {message}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

