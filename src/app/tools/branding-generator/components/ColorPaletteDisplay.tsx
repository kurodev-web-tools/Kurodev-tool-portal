import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Edit, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ColorPalette, Concept } from '../types/branding';

interface ColorPaletteDisplayProps {
  colorPalettes: ColorPalette[];
  selectedPaletteId: string | null;
  selectedConcept: Concept | null;
  onSelectPalette: (paletteId: string) => void;
  onEditPalette: (paletteId: string) => void;
  onBack: () => void;
  onSave: () => void;
}

/**
 * カラーパレット表示コンポーネント
 */
export function ColorPaletteDisplay({
  colorPalettes,
  selectedPaletteId,
  selectedConcept,
  onSelectPalette,
  onEditPalette,
  onBack,
  onSave,
}: ColorPaletteDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#E0E0E0]">カラーパレット提案</h2>
          <p className="text-sm text-[#A0A0A0] mt-1">
            {selectedConcept?.name && `${selectedConcept.name}に基づく提案`}
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {colorPalettes.map((palette) => (
          <Card
            key={palette.id}
            className={cn(
              'cursor-pointer transition-all duration-200 border-[#4A4A4A] bg-[#2D2D2D]',
              selectedPaletteId === palette.id
                ? 'border-[#0070F3] ring-2 ring-[#0070F3]/50 bg-[#0070F3]/10'
                : 'hover:border-[#6A6A6A] hover:bg-[#1A1A1A]',
            )}
            onClick={() => onSelectPalette(palette.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-[#E0E0E0]">{palette.name}</CardTitle>
                <div className="flex gap-2">
                  {selectedPaletteId === palette.id && (
                    <Badge className="bg-[#0070F3] text-white text-xs">選択中</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#4A4A4A]"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPalette(palette.id);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-[#A0A0A0]">{palette.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {palette.colors.map((color, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div
                      className="w-20 h-20 md:w-16 md:h-16 rounded-lg border-2 border-[#4A4A4A] shadow-md"
                      style={{ backgroundColor: color }}
                      aria-label={`カラー ${index + 1}: ${color}`}
                    />
                    <span className="text-xs text-[#A0A0A0] font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPaletteId && (
        <div className="flex justify-end mt-4">
          <Button onClick={onSave} className="bg-[#0070F3] hover:bg-[#0051CC] text-white">
            <Save className="mr-2 h-4 w-4" />
            提案を保存する
          </Button>
        </div>
      )}
    </div>
  );
}

