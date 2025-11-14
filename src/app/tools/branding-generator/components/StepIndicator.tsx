import { Loader2, Palette, Target, Users, Check, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowStep } from '../hooks/useBrandingWorkflow';

interface StepIndicatorProps {
  currentStep: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
}

const STEPS = [
  { id: 'input' as const, label: '入力', icon: Users },
  { id: 'analyzing' as const, label: '分析中', icon: Loader2 },
  { id: 'analysis-results' as const, label: '分析結果', icon: Target },
  { id: 'concept-proposal' as const, label: 'コンセプト', icon: Palette },
  { id: 'color-palette' as const, label: 'カラーパレット', icon: Palette },
  { id: 'save' as const, label: '保存', icon: Save },
];

/**
 * ステップインジケーターコンポーネント
 */
export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  // ステップをクリックしたときの処理
  const handleStepClick = (stepId: WorkflowStep, index: number) => {
    // 完了したステップ（現在のステップより前）のみクリック可能
    // analyzingステップはクリック不可
    if (index < currentIndex && stepId !== 'analyzing') {
      onStepClick(stepId);
    }
  };

  return (
    <div className="w-full mb-6">
      {/* デスクトップ: 1行表示 */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* 接続線 */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#4A4A4A] -z-10" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-[#0070F3] transition-all duration-500 ease-out -z-10"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {/* ステップアイコン */}
        {STEPS.map((stepItem, index) => {
          const isActive = currentIndex >= index;
          const isCurrent = currentIndex === index;
          const isClickable = index < currentIndex && stepItem.id !== 'analyzing';
          const Icon = stepItem.icon;

          return (
            <div key={stepItem.id} className="flex flex-col items-center relative z-10 flex-1">
              <div
                onClick={() => handleStepClick(stepItem.id, index)}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isClickable && 'cursor-pointer hover:scale-110',
                  isCurrent
                    ? 'bg-[#0070F3] border-[#0070F3] scale-110 shadow-lg shadow-[#0070F3]/50'
                    : isActive
                      ? 'bg-[#0070F3]/20 border-[#0070F3]'
                      : 'bg-[#1A1A1A] border-[#4A4A4A]',
                )}
                title={isClickable ? `${stepItem.label}に戻る` : undefined}
              >
                {isCurrent && stepItem.id === 'analyzing' ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : isActive ? (
                  <Check className="w-5 h-5 text-[#0070F3]" />
                ) : (
                  <Icon className="w-5 h-5 text-[#808080]" />
                )}
              </div>
              <p
                className={cn(
                  'text-xs mt-2 text-center max-w-20',
                  isClickable && 'cursor-pointer',
                  isCurrent
                    ? 'text-[#0070F3] font-semibold'
                    : isActive
                      ? 'text-[#A0A0A0]'
                      : 'text-[#808080]',
                )}
                onClick={() => handleStepClick(stepItem.id, index)}
                title={isClickable ? `${stepItem.label}に戻る` : undefined}
              >
                {stepItem.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* モバイル: 縦型タイムライン */}
      <div className="md:hidden flex flex-col gap-4">
        {STEPS.map((stepItem, index) => {
          const isActive = currentIndex >= index;
          const isCurrent = currentIndex === index;
          const isClickable = index < currentIndex && stepItem.id !== 'analyzing';
          const Icon = stepItem.icon;
          const showConnector = index < STEPS.length - 1;
          const connectorActive = currentIndex > index;

          return (
            <div key={stepItem.id} className="relative pl-12">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(stepItem.id, index)}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default',
                    isCurrent
                      ? 'bg-[#0070F3] border-[#0070F3] scale-110 shadow-lg shadow-[#0070F3]/50'
                      : isActive
                        ? 'bg-[#0070F3]/20 border-[#0070F3]'
                        : 'bg-[#1A1A1A] border-[#4A4A4A]',
                  )}
                  title={isClickable ? `${stepItem.label}に戻る` : undefined}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={stepItem.label}
                >
                  {isCurrent && stepItem.id === 'analyzing' ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : isActive ? (
                    <Check className="w-5 h-5 text-[#0070F3]" />
                  ) : (
                    <Icon className="w-5 h-5 text-[#808080]" />
                  )}
                </button>
                {showConnector && (
                  <div
                    className={cn(
                      'w-px mt-2',
                      connectorActive ? 'bg-[#0070F3]' : 'bg-[#4A4A4A]',
                    )}
                    style={{ height: 28 }}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleStepClick(stepItem.id, index)}
                className={cn(
                  'text-left text-sm leading-5 transition-colors duration-200',
                  isClickable ? 'text-[#A0A0A0] hover:text-white' : '',
                  isCurrent ? 'text-[#0070F3] font-semibold' : '',
                  !isActive && !isClickable ? 'text-[#808080]' : '',
                )}
                title={isClickable ? `${stepItem.label}に戻る` : undefined}
                disabled={!isClickable}
              >
                {stepItem.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

