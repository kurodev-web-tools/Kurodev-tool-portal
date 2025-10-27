'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Users, Settings, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectDetailClientProps {
  project: any;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-sm ${
            project.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-[#2D2D2D] text-[#E0E0E0]'
          }`}>
            {project.status === 'active' ? '進行中' : '完了'}
          </span>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* プロジェクト情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                プロジェクト情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">配信時間</label>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {project.duration}分
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">参加者数</label>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {project.participants}人
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">作成日</label>
                  <p>{project.createdAt}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">更新日</label>
                  <p>{project.updatedAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* スケジュール */}
          <Card>
            <CardHeader>
              <CardTitle>スケジュール</CardTitle>
              <CardDescription>配信の詳細スケジュール</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.schedules.map((schedule: any) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{schedule.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{schedule.description}</p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="flex gap-2">
                        {schedule.participants.map((participant: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {participant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">タイムゾーン</label>
                <p className="text-sm">{project.settings.timezone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">バッファ時間</label>
                <p className="text-sm">{project.settings.bufferTime}分</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">自動調整</label>
                <p className="text-sm">{project.settings.autoAdjust ? '有効' : '無効'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">通知</label>
                <p className="text-sm">{project.settings.notifications ? '有効' : '無効'}</p>
              </div>
            </CardContent>
          </Card>

          {/* アクション */}
          <Card>
            <CardHeader>
              <CardTitle>アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                スケジュール編集
              </Button>
              <Button variant="outline" className="w-full">
                参加者管理
              </Button>
              <Button variant="outline" className="w-full">
                設定変更
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
