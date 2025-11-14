import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { ActivityStatus, BrandingFormValues } from '../hooks/useBrandingForm';

interface InputFormProps {
  activityStatus: ActivityStatus;
  formValues: BrandingFormValues;
  onFormChange: (field: keyof BrandingFormValues, value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  currentStep: string;
}

/**
 * 入力フォームコンポーネント
 */
export function InputForm({
  activityStatus,
  formValues,
  onFormChange,
  onAnalyze,
  isAnalyzing,
  currentStep,
}: InputFormProps) {
  return (
    <div className="flex flex-col h-full p-4 sm:p-6 space-y-4 relative">
      <Separator />
      <div className="flex-grow space-y-4 md:overflow-auto">
        {activityStatus === 'active' && (
          <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader>
              <CardTitle className="text-[#E0E0E0]">既に活動している / 準備中</CardTitle>
              <CardDescription className="text-[#A0A0A0]">
                アカウントを連携するか、手動で情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full bg-[#0070F3] hover:bg-[#0051CC] text-white"
                onClick={() =>
                  toast.info('この機能は今後実装予定です', {
                    description: 'YouTubeアカウント連携機能は開発中です',
                  })
                }
              >
                YouTubeアカウントを連携
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
                onClick={() =>
                  toast.info('この機能は今後実装予定です', {
                    description: 'Xアカウント連携機能は開発中です',
                  })
                }
              >
                Xアカウントを連携
              </Button>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  自己紹介・活動内容 <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formValues.description}
                  onChange={(e) => onFormChange('description', e.target.value)}
                  placeholder="キャラクター設定、活動内容、目標などを入力..."
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A] min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        )}
        {activityStatus === 'pre-activity' && (
          <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader>
              <CardTitle className="text-[#E0E0E0]">これから活動を始める（準備前）</CardTitle>
              <CardDescription className="text-[#A0A0A0]">
                目指すVTuber像や活動内容を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="persona" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  目指すVTuber像（性格・イメージ） <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="persona"
                  value={formValues.persona}
                  onChange={(e) => onFormChange('persona', e.target.value)}
                  placeholder="例: 明るく元気、クールでミステリアス..."
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A] min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="genre" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  活動ジャンル（予定） <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="genre"
                  value={formValues.genre}
                  onChange={(e) => onFormChange('genre', e.target.value)}
                  placeholder="例: ゲーム実況、歌、雑談"
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
                />
              </div>
              <div>
                <Label htmlFor="avatar" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  立ち絵のイメージ（任意）
                </Label>
                <Textarea
                  id="avatar"
                  value={formValues.avatar}
                  onChange={(e) => onFormChange('avatar', e.target.value)}
                  placeholder="例: 銀髪、青い目、近未来的な衣装..."
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A] min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        )}
        {currentStep === 'input' && (
          <Button
            size="lg"
            className="w-full bg-[#0070F3] hover:bg-[#0051CC] text-white"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                分析を開始する
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

