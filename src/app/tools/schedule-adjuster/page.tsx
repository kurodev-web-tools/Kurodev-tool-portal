
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
    }, "プロジェクトの作成に失敗しました");
  };

  // サイドバーコンテンツ（PC表示用）
  const sidebarContent = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">プロジェクト管理</h3>
      
      {/* プロジェクト追加フォーム */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">新しいプロジェクト</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">プロジェクト名</Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="プロジェクト名を入力"
            />
          </div>
          <div>
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="プロジェクトの説明を入力"
              className="min-h-[80px]"
            />
          </div>
          <div>
            <Label htmlFor="duration">配信時間</Label>
            <Select value={projectDuration} onValueChange={setProjectDuration}>
              <SelectTrigger>
                <SelectValue placeholder="配信時間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30分</SelectItem>
                <SelectItem value="60">60分</SelectItem>
                <SelectItem value="90">90分</SelectItem>
                <SelectItem value="120">120分</SelectItem>
                <SelectItem value="180">180分</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateProject} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            プロジェクトを作成
          </Button>
        </div>
      </div>
    </div>
  );

  // モバイル表示用のプロジェクト追加フォーム
  const mobileAddForm = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">新しいプロジェクト</h3>
      <div className="space-y-3">
        <div>
          <Label htmlFor="mobile-name">プロジェクト名</Label>
          <Input
            id="mobile-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="プロジェクト名を入力"
          />
        </div>
        <div>
          <Label htmlFor="mobile-description">説明</Label>
          <Textarea
            id="mobile-description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="プロジェクトの説明を入力"
            className="min-h-[80px]"
          />
        </div>
        <div>
          <Label htmlFor="mobile-duration">配信時間</Label>
          <Select value={projectDuration} onValueChange={setProjectDuration}>
            <SelectTrigger>
              <SelectValue placeholder="配信時間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30分</SelectItem>
              <SelectItem value="60">60分</SelectItem>
              <SelectItem value="90">90分</SelectItem>
              <SelectItem value="120">120分</SelectItem>
              <SelectItem value="180">180分</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreateProject} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          プロジェクトを作成
        </Button>
      </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // プロジェクト詳細ページに遷移
                    router.push(`/tools/schedule-adjuster/${project.id}`);
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status === 'active' ? '進行中' : '完了'}
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {project.duration}分
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {project.participants}人
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {project.createdAt}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            className="lg:w-96"
          >
            {sidebarContent}
          </Sidebar>
        )}
      </div>
    </div>
  );
};

export default ScheduleAdjusterPage;
