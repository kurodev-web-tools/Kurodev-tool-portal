
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Plus, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const ScheduleAdjusterPage: React.FC = () => {
  // UI状態管理
  const router = useRouter();
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });
  const { handleAsyncError } = useErrorHandler();

  // モバイル表示用のタブ状態管理
  const [mobileTab, setMobileTab] = useState<'projects' | 'add'>('projects');

  // プロジェクト状態管理
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectDuration, setProjectDuration] = useState('60'); // デフォルト60分
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'サンプルプロジェクト1',
      description: 'コラボ配信のスケジュール調整',
      duration: 120,
      participants: 3,
      status: 'active' as const,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      schedules: [
        {
          id: 's1',
          title: '配信準備',
          startTime: '19:00',
          endTime: '19:30',
          description: '機材セットアップとテスト',
          participants: ['配信者A', '配信者B']
        },
        {
          id: 's2',
          title: 'メイン配信',
          startTime: '19:30',
          endTime: '21:30',
          description: 'コラボゲーム配信',
          participants: ['配信者A', '配信者B', '配信者C']
        }
      ],
      settings: {
        timezone: 'Asia/Tokyo',
        bufferTime: 15,
        autoAdjust: true,
        notifications: true
      }
    },
    {
      id: '2',
      name: 'サンプルプロジェクト2',
      description: 'イベント配信の準備',
      duration: 90,
      participants: 2,
      status: 'completed' as const,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
      schedules: [
        {
          id: 's3',
          title: 'イベント配信',
          startTime: '20:00',
          endTime: '21:30',
          description: '特別イベント配信',
          participants: ['配信者A', '配信者B']
        }
      ],
      settings: {
        timezone: 'Asia/Tokyo',
        bufferTime: 10,
        autoAdjust: false,
        notifications: true
      }
    }
  ]);

  const handleCreateProject = async () => {
    await handleAsyncError(async () => {
      if (!projectName.trim()) {
        toast.error('プロジェクト名を入力してください');
        throw new Error('プロジェクト名を入力してください');
      }
      
      const newProject = {
        id: Date.now().toString(),
        name: projectName,
        description: projectDescription,
        duration: parseInt(projectDuration),
        participants: 1,
        status: 'active' as const,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        schedules: [],
        settings: {
          timezone: 'Asia/Tokyo',
          bufferTime: 15,
          autoAdjust: true,
          notifications: true
        }
      };
      
      setProjects(prev => [newProject, ...prev]);
      
      // フォームをリセット
      setProjectName('');
      setProjectDescription('');
      setProjectDuration('60');
      
      // 作成完了通知
      toast.success('プロジェクトを作成しました', {
        description: `${newProject.name}のスケジュール調整を開始できます`,
      });
      
      // モバイルの場合はプロジェクト一覧タブに戻る
      if (!isDesktop) {
        setMobileTab('projects');
      }
    }, "プロジェクトの作成に失敗しました");
  };

  // サイドバーコンテンツ（PC表示用）
  const sidebarContent = (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* ヘッダーセクション */}
      <div className="pb-4 border-b border-[#4A4A4A]">
        <h3 className="text-lg font-semibold text-[#E0E0E0] mb-1">プロジェクト管理</h3>
        <p className="text-sm text-[#A0A0A0]">コラボ配信のスケジュール調整を開始します</p>
      </div>
      
      {/* プロジェクト追加フォームセクション */}
      <div className="space-y-4">
        <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#E0E0E0] flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新しいプロジェクト
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            基本情報を入力してプロジェクトを作成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基本情報セクション */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                プロジェクト名 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="例: 3人コラボ配信"
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                説明
              </Label>
              <Textarea
                id="description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="プロジェクトの詳細を入力（任意）"
                className="min-h-[80px] resize-none bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                配信時間
              </Label>
              <Select value={projectDuration} onValueChange={setProjectDuration}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] focus:border-[#6A6A6A]">
                  <SelectValue placeholder="配信時間を選択" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                  <SelectItem value="30" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">30分</SelectItem>
                  <SelectItem value="60" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">60分</SelectItem>
                  <SelectItem value="90" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">90分</SelectItem>
                  <SelectItem value="120" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">120分</SelectItem>
                  <SelectItem value="180" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">180分</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-2 border-t border-[#4A4A4A]">
            <Button 
              onClick={handleCreateProject} 
              className="w-full bg-[#0070F3] hover:bg-[#0051CC] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              プロジェクトを作成
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* 将来の拡張用スペース（プロジェクト一覧など） */}
      {/* 
      <div className="pt-4 border-t border-[#4A4A4A]">
        <h4 className="text-sm font-medium text-[#E0E0E0] mb-3">最近のプロジェクト</h4>
        // プロジェクト一覧などをここに追加
      </div>
      */}
      </div>
    </div>
  );

  // モバイル表示用のプロジェクト追加フォーム
  const mobileAddForm = (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">新しいプロジェクト</h3>
        <p className="text-sm text-[#A0A0A0]">コラボ配信のスケジュール調整を開始します</p>
      </div>
      
      <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#E0E0E0] flex items-center gap-2">
            <Plus className="h-4 w-4" />
            基本情報
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            プロジェクトの基本情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="mobile-name" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                プロジェクト名 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="mobile-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="例: 3人コラボ配信"
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
              />
            </div>
            <div>
              <Label htmlFor="mobile-description" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                説明
              </Label>
              <Textarea
                id="mobile-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="プロジェクトの詳細を入力（任意）"
                className="min-h-[100px] resize-none bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
              />
            </div>
            <div>
              <Label htmlFor="mobile-duration" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                配信時間
              </Label>
              <Select value={projectDuration} onValueChange={setProjectDuration}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] focus:border-[#6A6A6A]">
                  <SelectValue placeholder="配信時間を選択" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                  <SelectItem value="30" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">30分</SelectItem>
                  <SelectItem value="60" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">60分</SelectItem>
                  <SelectItem value="90" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">90分</SelectItem>
                  <SelectItem value="120" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">120分</SelectItem>
                  <SelectItem value="180" className="text-[#E0E0E0] focus:bg-[#3A3A3A]">180分</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-[#4A4A4A]">
            <Button 
              onClick={handleCreateProject} 
              className="w-full bg-[#0070F3] hover:bg-[#0051CC] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              プロジェクトを作成
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="relative flex flex-col lg:h-screen">
      {/* モバイル用オーバーレイ（サイドバーが開いている時のみ表示） */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full lg:overflow-y-auto">
        {/* モバイル表示用のタブ */}
        {!isDesktop && (
          <div className="border-b bg-background p-4">
            <Tabs value={mobileTab} onValueChange={(value) => setMobileTab(value as 'projects' | 'add')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="projects">
                  <Calendar className="mr-2 h-4 w-4" />
                  プロジェクト一覧
                </TabsTrigger>
                <TabsTrigger value="add">
                  <Plus className="mr-2 h-4 w-4" />
                  プロジェクト追加
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-2 lg:p-4">
          {/* PC表示またはモバイルのプロジェクト一覧タブ */}
          {(isDesktop || mobileTab === 'projects') && (
            <>
              {/* プロジェクト一覧が空の場合 */}
              {projects.length === 0 ? (
                <div className="w-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[400px] border border-[#4A4A4A]">
                  <Calendar className="w-12 h-12 text-[#A0A0A0] mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-[#E0E0E0] mb-2">プロジェクトがありません</h3>
                  <p className="text-[#A0A0A0] mb-4">
                    新しいプロジェクトを作成して、コラボ配信のスケジュール調整を始めましょう。
                  </p>
                  {isDesktop ? (
                    <Button
                      variant="default"
                      onClick={() => setIsSidebarOpen(true)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      プロジェクトを作成
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => setMobileTab('add')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      プロジェクトを作成
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <Card 
                      key={project.id} 
                      className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border-[#4A4A4A] bg-[#2D2D2D]"
                      onClick={() => {
                        // プロジェクト詳細ページに遷移
                        router.push(`/tools/schedule-adjuster/${project.id}`);
                      }}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg text-[#E0E0E0] line-clamp-2 flex-1 pr-2">
                            {project.name}
                          </CardTitle>
                          <Badge 
                            variant={project.status === 'active' ? 'default' : 'secondary'}
                            className="flex-shrink-0"
                          >
                            {project.status === 'active' ? '進行中' : '完了'}
                          </Badge>
                        </div>
                        {project.description && (
                          <CardDescription className="text-[#A0A0A0] line-clamp-2">
                            {project.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* 主要情報 */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-[#A0A0A0]">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{project.duration}分</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{project.participants}人</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 日付情報 */}
                        <div className="flex items-center justify-between text-xs text-[#808080] pt-2 border-t border-[#4A4A4A]">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>作成: {project.createdAt}</span>
                          </div>
                          {project.updatedAt !== project.createdAt && (
                            <span>更新: {project.updatedAt}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* モバイル表示のプロジェクト追加タブ */}
          {!isDesktop && mobileTab === 'add' && (
            <div className="max-w-md mx-auto">
              {mobileAddForm}
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
