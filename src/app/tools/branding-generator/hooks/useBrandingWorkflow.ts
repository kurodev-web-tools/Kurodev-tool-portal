import { useState, useCallback } from 'react';

export type WorkflowStep =
  | 'input'
  | 'analyzing'
  | 'analysis-results'
  | 'concept-proposal'
  | 'color-palette'
  | 'save';

const WORKFLOW_STEPS: WorkflowStep[] = [
  'input',
  'analyzing',
  'analysis-results',
  'concept-proposal',
  'color-palette',
  'save',
];

/**
 * ブランディングワークフロー管理フック
 */
export function useBrandingWorkflow() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('input');
  const [activeTab, setActiveTab] = useState<'settings' | 'results'>('settings');

  /**
   * ステップを変更
   */
  const goToStep = useCallback(
    (targetStep: WorkflowStep, isDesktop: boolean) => {
      const currentIndex = WORKFLOW_STEPS.findIndex((s) => s === currentStep);
      const targetIndex = WORKFLOW_STEPS.findIndex((s) => s === targetStep);

      // 現在のステップより前のステップにのみ戻れる（analyzingは除く）
      if (targetIndex < currentIndex && targetStep !== 'analyzing') {
        setCurrentStep(targetStep);
        if (!isDesktop) {
          if (targetStep === 'input') {
            setActiveTab('settings');
          } else {
            setActiveTab('results');
          }
        }
      }
    },
    [currentStep],
  );

  /**
   * ステップを進める
   */
  const nextStep = useCallback((step: WorkflowStep, isDesktop: boolean) => {
    setCurrentStep(step);
    if (!isDesktop) {
      if (step === 'input') {
        setActiveTab('settings');
      } else {
        setActiveTab('results');
      }
    }
  }, []);

  /**
   * ワークフローをリセット
   */
  const resetWorkflow = useCallback((isDesktop: boolean) => {
    setCurrentStep('input');
    if (!isDesktop) {
      setActiveTab('settings');
    }
  }, []);

  /**
   * 現在のステップインデックスを取得
   */
  const getCurrentStepIndex = useCallback(() => {
    return WORKFLOW_STEPS.findIndex((s) => s === currentStep);
  }, [currentStep]);

  /**
   * ステップが完了しているかチェック
   */
  const isStepCompleted = useCallback(
    (step: WorkflowStep) => {
      const currentIndex = getCurrentStepIndex();
      const stepIndex = WORKFLOW_STEPS.findIndex((s) => s === step);
      return stepIndex < currentIndex;
    },
    [getCurrentStepIndex],
  );

  return {
    currentStep,
    activeTab,
    setActiveTab,
    goToStep,
    nextStep,
    resetWorkflow,
    getCurrentStepIndex,
    isStepCompleted,
    steps: WORKFLOW_STEPS,
  };
}

