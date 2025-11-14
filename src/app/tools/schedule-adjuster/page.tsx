'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSidebar } from '@/hooks/use-sidebar';
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { Calendar, Plus, AlertCircle } from 'lucide-react';
import { useProjectManagement } from './hooks/useProjectManagement';
import { ProjectCreateForm } from './components/ProjectCreateForm';
import { ProjectList } from './components/ProjectList';
import type { ProjectFormValues } from './types/project';

const ScheduleAdjusterPage: React.FC = () => {
  // UI状態管理
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });

  // モバイル表示用のタブ状態管理
  const [mobileTab, setMobileTab] = useState<'projects' | 'add'>('projects');

  // プロジェクト管理フック
  const {
    projects,
    isCreatingProject,
    isLoadingProjects,
    error,
    createProject,
  } = useProjectManagement();

  // フォーム状態管理
  const [formValues, setFormValues] = useState<ProjectFormValues>({
    name: '',
    description: '',
    duration: '60',
  });

  const handleFormChange = (values: Partial<ProjectFormValues>) => {
    setFormValues((prev) => ({ ...prev, ...values }));
  };

  const handleCreateProject = async () => {
    const result = await createProject(formValues, isDesktop);
    if (result?.success) {
      // フォームをリセット
      setFormValues({
        name: '',
        description: '',
        duration: '60',
      });
      
      // モバイルの場合はプロジェクト一覧タブに戻る
      if (result.shouldSwitchTab) {
        setMobileTab('projects');
      }
    }
  };

  // サイドバーコンテンツ（PC表示用）
  const sidebarContent = (
    <div className="flex-1 md:overflow-y-auto p-4 space-y-6">
      {/* ヘッダーセクション */}
      <div className="pb-4 border-b border-[#4A4A4A]">
        <h3 className="text-lg font-semibold text-[#E0E0E0] mb-1">プロジェクト管理</h3>
        <p className="text-sm text-[#A0A0A0]">コラボ配信のスケジュール調整を開始します</p>
      </div>
      
      {/* プロジェクト追加フォームセクション */}
      <ProjectCreateForm
        formValues={formValues}
        onFormChange={handleFormChange}
        onSubmit={handleCreateProject}
        isSubmitting={isCreatingProject}
        error={error}
        variant="sidebar"
      />
    </div>
  );

  return (
    <div className="relative flex flex-col md:h-screen">
      {/* モバイル用オーバーレイ（サイドバーが開いている時のみ表示） */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col md:flex-row flex-grow md:h-full md:overflow-y-auto">
        {/* モバイル表示用のタブ */}
        {!isDesktop && (
          <div className="bg-[#1A1A1A] sticky top-0 z-20">
            <div className="px-2 pt-2 pb-0">
              <Tabs 
                value={mobileTab} 
                onValueChange={(value) => setMobileTab(value as 'projects' | 'add')} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 border-b border-[#4A4A4A] rounded-none bg-transparent p-0 h-auto">
                  <TabsTrigger 
                    value="projects"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#0070F3] data-[state=active]:text-[#0070F3] data-[state=inactive]:text-[#A0A0A0] px-2 py-2 relative transition-all duration-200"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">プロジェクト一覧</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="add"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#0070F3] data-[state=active]:text-[#0070F3] data-[state=inactive]:text-[#A0A0A0] px-2 py-2 relative transition-all duration-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">プロジェクト追加</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        )}

        <main className="flex-1 md:overflow-y-auto p-3 sm:p-4 lg:p-6">
          {/* PC表示またはモバイルのプロジェクト一覧タブ */}
          {(isDesktop || mobileTab === 'projects') && (
            <ProjectList
              projects={projects}
              isLoading={isLoadingProjects}
              isDesktop={isDesktop}
              onCreateClick={() => {
                if (isDesktop) {
                  setIsSidebarOpen(true);
                } else {
                  setMobileTab('add');
                }
              }}
            />
          )}

          {/* モバイル表示のプロジェクト追加タブ */}
          {!isDesktop && mobileTab === 'add' && (
            <div className="max-w-2xl mx-auto w-full px-4 sm:px-6">
              {/* エラー表示 */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">エラーが発生しました</p>
                    <p className="text-xs text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              )}
              <ProjectCreateForm
                formValues={formValues}
                onFormChange={handleFormChange}
                onSubmit={handleCreateProject}
                isSubmitting={isCreatingProject}
                error={error}
                variant="mobile"
              />
            </div>
          )}
        </main>

        {/* サイドバーが閉じている場合の開くボタン（PC表示のみ） */}
        {!isSidebarOpen && isDesktop && (
          <SidebarToggle
            onOpen={() => setIsSidebarOpen(true)}
            isDesktop={isDesktop}
          />
        )}

        {/* サイドバー（PC表示のみ） */}
        {isDesktop && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            title=""
            isDesktop={isDesktop}
            className="lg:w-80 xl:w-96"
          >
            <div className="h-full flex flex-col">
              {sidebarContent}
            </div>
          </Sidebar>
        )}
      </div>
    </div>
  );
};

export default ScheduleAdjusterPage;
