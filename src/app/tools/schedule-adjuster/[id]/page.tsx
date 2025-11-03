import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Settings, Edit } from 'lucide-react';
import { ProjectDetailClient } from './project-detail-client';

// ダミーデータ（実際のアプリではAPIから取得）
const projectData = {
  '1': {
    id: '1',
    name: 'サンプルプロジェクト1',
    description: 'コラボ配信のスケジュール調整',
    duration: 120,
    participants: 3,
    status: 'active' as const,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    participantList: [
      {
        id: 'p1',
        name: '配信者A',
        email: 'streamer-a@example.com',
        status: 'linked' as const, // 'linked' | 'not_linked' | 'manual'
        avatar: null
      },
      {
        id: 'p2',
        name: '配信者B',
        email: 'streamer-b@example.com',
        status: 'linked' as const,
        avatar: null
      },
      {
        id: 'p3',
        name: '配信者C',
        email: 'streamer-c@example.com',
        status: 'manual' as const,
        avatar: null
      }
    ],
    inviteLink: 'https://example.com/invite/project-1-abc123',
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
  '2': {
    id: '2',
    name: 'サンプルプロジェクト2',
    description: 'イベント配信の準備',
    duration: 90,
    participants: 2,
    status: 'completed' as const,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
    participantList: [
      {
        id: 'p4',
        name: '配信者A',
        email: 'streamer-a@example.com',
        status: 'linked' as const,
        avatar: null
      },
      {
        id: 'p5',
        name: '配信者B',
        email: 'streamer-b@example.com',
        status: 'not_linked' as const,
        avatar: null
      }
    ],
    inviteLink: 'https://example.com/invite/project-2-xyz789',
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
};

// 静的エクスポート用のパラメータ生成
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' }
  ];
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projectData[id as keyof typeof projectData];

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">プロジェクトが見つかりません</h1>
          <p className="text-muted-foreground">指定されたプロジェクトは存在しません。</p>
        </div>
      </div>
    );
  }

  return <ProjectDetailClient project={project} />;
}
