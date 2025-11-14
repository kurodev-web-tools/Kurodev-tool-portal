import { Button } from '@/components/ui/button';
import type { ActivityStatus } from '../hooks/useBrandingForm';

interface ActivityStatusSelectorProps {
  onSelect: (status: ActivityStatus) => void;
}

/**
 * 活動状況選択コンポーネント
 */
export function ActivityStatusSelector({ onSelect }: ActivityStatusSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-[#E0E0E0] mb-4">あなたの現在の活動状況は？</h1>
        <p className="text-[#A0A0A0] mb-8">
          AIがあなたに最適なブランディングコンセプトを提案するために、活動状況を教えてください
        </p>
      </div>
      <div className="flex flex-col space-y-4 w-full max-w-md">
        <Button
          size="lg"
          onClick={() => onSelect('active')}
          variant="outline"
          className="h-14 md:h-16 text-base md:text-lg font-semibold border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A] px-4"
        >
          既に活動している / 準備中
        </Button>
        <Button
          size="lg"
          onClick={() => onSelect('pre-activity')}
          variant="outline"
          className="h-14 md:h-16 text-base md:text-lg font-semibold border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A] px-4"
        >
          これから活動を始める（準備前）
        </Button>
      </div>
    </div>
  );
}

