'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Calendar, Clock, Users, Plus, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { Project } from '../types/project';

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  isDesktop: boolean;
  onCreateClick: () => void;
}

export function ProjectList({ projects, isLoading, isDesktop, onCreateClick }: ProjectListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="pt-2 border-t border-[#4A4A4A]">
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="w-full bg-[#2D2D2D] rounded-lg flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[500px] border border-dashed border-[#4A4A4A]">
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-[#4A4A4A] flex items-center justify-center mb-4 mx-auto">
            <Calendar className="w-10 h-10 text-[#0070F3]" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">プロジェクトがありません</h3>
          <p className="text-sm sm:text-base text-[#A0A0A0] mb-1 px-4 max-w-md mx-auto">
            新しいプロジェクトを作成して、コラボ配信のスケジュール調整を始めましょう
          </p>
          <p className="text-xs text-[#808080] px-4 max-w-md mx-auto">
            複数人の日程を調整し、最適な配信時間を見つけることができます
          </p>
        </div>
        <Button
          variant="default"
          onClick={onCreateClick}
          size="lg"
          className="bg-[#0070F3] hover:bg-[#0051CC] text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          プロジェクトを作成
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="group hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-200 cursor-pointer border-[#4A4A4A] bg-[#2D2D2D] relative"
          onClick={() => {
            router.push(`/tools/schedule-adjuster/${project.id}`);
          }}
        >
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <CardTitle className="text-base sm:text-lg text-[#E0E0E0] line-clamp-2 flex-1 pr-2">
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge
                  className={
                    project.status === 'active'
                      ? 'bg-[#0070F3] text-white self-start sm:self-auto text-xs font-medium'
                      : 'bg-[#4A4A4A] text-[#E0E0E0] self-start sm:self-auto text-xs font-medium'
                  }
                >
                  {project.status === 'active' ? '進行中' : '完了'}
                </Badge>
                {/* 操作メニュー（モバイルでは常に表示、デスクトップではホバー時表示） */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto transition-opacity text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#4A4A4A]"
                      aria-label="プロジェクト操作"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#2D2D2D] border-[#4A4A4A] min-w-[160px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('この機能は今後実装予定です', {
                          description: 'プロジェクトの編集機能は開発中です',
                        });
                      }}
                      className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('この機能は今後実装予定です', {
                          description: 'プロジェクトの複製機能は開発中です',
                        });
                      }}
                      className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      複製
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#4A4A4A]" />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('この機能は今後実装予定です', {
                          description: 'プロジェクトの削除機能は開発中です',
                        });
                      }}
                      className="text-[#E0E0E0] hover:bg-[#4A4A4A] hover:text-red-400 cursor-pointer text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {project.description && (
              <CardDescription className="text-sm sm:text-base text-[#A0A0A0] line-clamp-2 min-h-[2.75rem] sm:min-h-[3rem]">
                {project.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
            {/* 主要情報 */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-3 sm:gap-4 text-[#A0A0A0]">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{project.duration}分</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{project.participants}人</span>
                </div>
              </div>
            </div>

            {/* 日付情報（モバイルでは非表示） */}
            <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-1 text-xs text-[#808080] pt-2 border-t border-[#4A4A4A]">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>作成: {project.createdAt}</span>
              </div>
              {project.updatedAt !== project.createdAt && (
                <span className="text-[#707070]">更新: {project.updatedAt}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

