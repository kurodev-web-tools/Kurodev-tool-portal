
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProjectDetailPage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  // 仮のプロジェクトデータ
  const project = {
    id: projectId,
    name: `プロジェクト ${projectId}`,
    description: `これはプロジェクト ${projectId} の詳細です。`,
    participants: [
      { id: '1', name: 'VTuber A', avatar: 'https://github.com/shadcn.png', status: '連携済み' },
      { id: '2', name: 'VTuber B', avatar: undefined, status: '未連携' },
      { id: '3', name: 'VTuber C', avatar: 'https://github.com/shadcn.png', status: '連携済み' },
    ],
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">プロジェクト詳細: {project.name}</h1>
      <p className="text-lg mb-8">{project.description}</p>

      <div className="flex flex-grow">
        {/* 左側のタイムグリッドカレンダーエリア (7割) */}
        <div className="w-7/10 p-4 overflow-y-auto border-r">
          <div className="border p-4 rounded-lg shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">空き時間</h2>
              <Button>空き時間を探す</Button>
            </div>
            <div className="flex-grow flex items-center justify-center text-gray-400">
              タイムグリッドカレンダー (プレースホルダー)
            </div>
          </div>
        </div>

        {/* 右側のサイドパネル (3割) */}
        <div className="w-3/10 p-4 overflow-y-auto">
          {/* 参加者エリア */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">参加者</h2>
            <div className="flex flex-wrap gap-4">
              {project.participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-gray-500">{participant.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4">招待リンクをコピー</Button>
          </div>

          {/* カレンダー連携/入力エリア */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">カレンダー連携・空き時間入力</h2>
            <div className="flex gap-4">
              <Button>Googleカレンダーを連携</Button>
              <Button variant="outline">空き時間を手入力する</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
