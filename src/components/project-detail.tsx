'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Settings, Edit } from 'lucide-react';

interface Schedule {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  participants: string[];
}

interface ProjectSettings {
  timezone: string;
  bufferTime: number;
  autoAdjust: boolean;
  notifications: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  duration: number;
  participants: number;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  schedules: Schedule[];
  settings: ProjectSettings;
}

interface ProjectDetailProps {
  project: Project;
  onEdit?: () => void;
  onScheduleEdit?: () => void;
  onParticipantManage?: () => void;
  onSettingsChange?: () => void;
}

export function ProjectDetail({
  project,
  onEdit,
  onScheduleEdit,
  onParticipantManage,
  onSettingsChange
}: ProjectDetailProps) {
  return (
    <div className="space-y-6">
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
            {project.schedules.map((schedule) => (
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
                    {schedule.participants.map((participant, index) => (
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
          <Button className="w-full" onClick={onScheduleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            スケジュール編集
          </Button>
          <Button variant="outline" className="w-full" onClick={onParticipantManage}>
            参加者管理
          </Button>
          <Button variant="outline" className="w-full" onClick={onSettingsChange}>
            設定変更
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
