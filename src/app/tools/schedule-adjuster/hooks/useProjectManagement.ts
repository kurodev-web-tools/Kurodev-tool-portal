'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from '@/hooks/use-error-handler';
import type { Project, ProjectFormValues, CreateProjectResult } from '../types/project';

const DEFAULT_SETTINGS = {
  timezone: 'Asia/Tokyo',
  bufferTime: 15,
  autoAdjust: true,
  notifications: true,
} as const;

export function useProjectManagement() {
  const { handleAsyncError } = useErrorHandler();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'サンプルプロジェクト1',
      description: 'コラボ配信のスケジュール調整',
      duration: 120,
      participants: 3,
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      schedules: [
        {
          id: 's1',
          title: '配信準備',
          startTime: '19:00',
          endTime: '19:30',
          description: '機材セットアップとテスト',
          participants: ['配信者A', '配信者B'],
        },
        {
          id: 's2',
          title: 'メイン配信',
          startTime: '19:30',
          endTime: '21:30',
          description: 'コラボゲーム配信',
          participants: ['配信者A', '配信者B', '配信者C'],
        },
      ],
      settings: {
        timezone: 'Asia/Tokyo',
        bufferTime: 15,
        autoAdjust: true,
        notifications: true,
      },
    },
    {
      id: '2',
      name: 'サンプルプロジェクト2',
      description: 'イベント配信の準備',
      duration: 90,
      participants: 2,
      status: 'completed',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
      schedules: [
        {
          id: 's3',
          title: 'イベント配信',
          startTime: '20:00',
          endTime: '21:30',
          description: '特別イベント配信',
          participants: ['配信者A', '配信者B'],
        },
      ],
      settings: {
        timezone: 'Asia/Tokyo',
        bufferTime: 10,
        autoAdjust: false,
        notifications: true,
      },
    },
  ]);

  const createProject = useCallback(
    async (formValues: ProjectFormValues, isDesktop: boolean): Promise<CreateProjectResult> => {
      setError(null);
      setIsCreatingProject(true);

      try {
        const result = await handleAsyncError(
          async (): Promise<CreateProjectResult> => {
            if (!formValues.name.trim()) {
              const errorMsg = 'プロジェクト名を入力してください';
              setError(errorMsg);
              toast.error(errorMsg);
              setIsCreatingProject(false);
              throw new Error(errorMsg);
            }

            // ローディング状態をシミュレート（実際のAPI呼び出し時はここを置き換え）
            await new Promise((resolve) => setTimeout(resolve, 800));

            const newProject: Project = {
              id: Date.now().toString(),
              name: formValues.name,
              description: formValues.description,
              duration: parseInt(formValues.duration),
              participants: 1,
              status: 'active',
              createdAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0],
              schedules: [],
              settings: { ...DEFAULT_SETTINGS },
            };

            setProjects((prev) => [newProject, ...prev]);

            // 作成完了通知
            toast.success('プロジェクトを作成しました', {
              description: `${newProject.name}のスケジュール調整を開始できます`,
            });

            setIsCreatingProject(false);
            return { success: true, shouldSwitchTab: !isDesktop };
          },
          'プロジェクトの作成に失敗しました'
        );

        if (result) {
          return result;
        }

        // handleAsyncErrorがnullを返した場合（エラー発生時）
        setIsCreatingProject(false);
        setError('プロジェクトの作成に失敗しました');
        return { success: false, shouldSwitchTab: false };
      } catch (err) {
        setIsCreatingProject(false);
        setError(err instanceof Error ? err.message : 'プロジェクトの作成に失敗しました');
        return { success: false, shouldSwitchTab: false };
      }
    },
    [handleAsyncError]
  );

  const resetForm = useCallback(() => {
    setError(null);
  }, []);

  return {
    projects,
    isCreatingProject,
    isLoadingProjects,
    error,
    setError,
    createProject,
    resetForm,
  };
}

