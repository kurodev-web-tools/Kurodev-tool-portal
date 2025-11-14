import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Concept } from '../types/branding';

interface ConceptProposalDisplayProps {
  concepts: Concept[];
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
  onBack: () => void;
  isAnalyzing: boolean;
}

/**
 * コンセプト提案表示コンポーネント
 */
export function ConceptProposalDisplay({
  concepts,
  selectedConceptId,
  onSelectConcept,
  onBack,
  isAnalyzing,
}: ConceptProposalDisplayProps) {
  const handleSelect = (conceptId: string) => {
    if (!isAnalyzing) {
      onSelectConcept(conceptId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#E0E0E0]">コンセプト提案</h2>
          <p className="text-sm text-[#A0A0A0] mt-1">好きなコンセプトを選択してください</p>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
          className="border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A] shrink-0 w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {concepts.map((concept) => (
          <Card
            key={concept.id}
            className={cn(
              'cursor-pointer transition-all duration-200 border-[#4A4A4A] bg-[#2D2D2D]',
              selectedConceptId === concept.id
                ? 'border-[#0070F3] ring-2 ring-[#0070F3]/50 bg-[#0070F3]/10'
                : 'hover:border-[#6A6A6A] hover:bg-[#1A1A1A]',
            )}
            onClick={() => handleSelect(concept.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-[#E0E0E0] flex-1">{concept.name}</CardTitle>
                {selectedConceptId === concept.id && (
                  <Badge className="bg-[#0070F3] text-white">選択中</Badge>
                )}
              </div>
              <CardDescription className="text-[#A0A0A0]">{concept.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* モバイル: 主要情報のみ表示 */}
              <div className="md:hidden">
                <div>
                  <p className="text-xs font-medium text-[#A0A0A0] mb-1">キーワード</p>
                  <div className="flex flex-wrap gap-1">
                    {concept.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]"
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {concept.keywords.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-[#1A1A1A] border-[#4A4A4A] text-[#A0A0A0]"
                      >
                        +{concept.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {/* デスクトップ: すべての情報を表示 */}
              <div className="hidden md:block space-y-3">
                <div>
                  <p className="text-xs font-medium text-[#A0A0A0] mb-1">キーワード</p>
                  <div className="flex flex-wrap gap-1">
                    {concept.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#A0A0A0] mb-1">推奨活動</p>
                  <ul className="text-xs text-[#A0A0A0] space-y-1">
                    {concept.recommendedActivities.map((activity, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="text-[#0070F3]">•</span>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedConceptId && !isAnalyzing && (
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => handleSelect(selectedConceptId)}
            className="bg-[#0070F3] hover:bg-[#0051CC] text-white"
          >
            カラーパレットを生成する
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

