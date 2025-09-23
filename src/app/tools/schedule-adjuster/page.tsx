
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectDuration, setProjectDuration] = useState('60'); // デフォルト60分

  const handleCreateProject = () => {
    console.log({
      projectName,
      projectDescription,
      projectDuration,
    });
    // ここでプロジェクト作成のロジックを実装
    setProjectName('');
    setProjectDescription('');
    setProjectDuration('60');
  };

  return (
    <div className="flex h-screen">
      {/* 左側のプロジェクト一覧エリア (7割) */}
      <div className="w-7/10 p-4 overflow-y-auto border-r">
        <h1 className="text-4xl font-bold mb-8">配信スケジュール自動調整ツール</h1>

        {/* プロジェクト一覧のプレースホルダー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border p-4 rounded-lg shadow-sm h-32 flex items-center justify-center text-gray-400">
            プロジェクトカード1 (プレースホルダー)
          </div>
          <div className="border p-4 rounded-lg shadow-sm h-32 flex items-center justify-center text-gray-400">
            プロジェクトカード2 (プレースホルダー)
          </div>
          <div className="border p-4 rounded-lg shadow-sm h-32 flex items-center justify-center text-gray-400">
            プロジェクトカード3 (プレースホルダー)
          </div>
          <div className="border p-4 rounded-lg shadow-sm h-32 flex items-center justify-center text-gray-400">
            プロジェクトカード4 (プレースホルダー)
          </div>
        </div>
      </div>

      {/* 右側の新規プロジェクト作成サイドパネル (3割) */}
      <div className="w-3/10 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8">新規プロジェクト作成</h2>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="projectName">プロジェクト名</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="projectDescription">概要</Label>
            <Textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="projectDuration">所要時間</Label>
            <Select value={projectDuration} onValueChange={setProjectDuration}>
              <SelectTrigger>
                <SelectValue placeholder="所要時間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30分</SelectItem>
                <SelectItem value="60">1時間</SelectItem>
                <SelectItem value="90">1時間30分</SelectItem>
                <SelectItem value="120">2時間</SelectItem>
                <SelectItem value="180">3時間</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" onClick={handleCreateProject} className="w-full mt-4">作成</Button>
      </div>
    </div>
  );
};

export default ScheduleAdjusterPage;
