'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trash2, 
  Copy, 
  Edit2, 
  Check, 
  X, 
  FolderOpen,
  Calendar,
  Clock,
  Save,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ThumbnailProject } from '../types/project';
import {
  getProjectList,
  deleteProject,
  duplicateProject,
  updateProjectName,
  loadProject,
} from '../utils/projectUtils';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ProjectManagerProps {
  onLoadProject: (project: ThumbnailProject) => void;
  currentProjectName?: string;
  onProjectSaved?: (project: ThumbnailProject) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  onLoadProject,
  currentProjectName,
  onProjectSaved,
}) => {
  const [projects, setProjects] = useState<ThumbnailProject[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'manual' | 'autosave'>('all');
  const isTablet = useMediaQuery('(min-width: 768px)');
  const isMobile = !isTablet;

  // プロジェクトリストを読み込み
  const loadProjects = () => {
    const projectList = getProjectList();
    setProjects(projectList.projects);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // フィルタリング
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // タイプフィルター
    if (filter === 'manual') {
      filtered = filtered.filter(p => !p.isAutoSave);
    } else if (filter === 'autosave') {
      filtered = filtered.filter(p => p.isAutoSave);
    }

    // 検索フィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [projects, filter, searchQuery]);

  // 編集開始
  const startEdit = (project: ThumbnailProject) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  // 編集確定
  const confirmEdit = (projectId: string) => {
    if (!editName.trim()) {
      toast.error('プロジェクト名を入力してください');
      return;
    }

    updateProjectName(projectId, editName.trim());
    setEditingId(null);
    setEditName('');
    loadProjects();
    toast.success('プロジェクト名を更新しました');
  };

  // 削除
  const handleDelete = (projectId: string, projectName: string) => {
    if (!confirm(`プロジェクト「${projectName}」を削除しますか？`)) {
      return;
    }

    deleteProject(projectId);
    loadProjects();
    toast.success('プロジェクトを削除しました');
  };

  // 複製
  const handleDuplicate = (projectId: string) => {
    const duplicated = duplicateProject(projectId);
    if (duplicated) {
      loadProjects();
      toast.success(`プロジェクト「${duplicated.name}」を作成しました`);
    }
  };

  // 読み込み
  const handleLoad = (projectId: string) => {
    const project = loadProject(projectId);
    if (project) {
      onLoadProject(project);
      toast.success(`プロジェクト「${project.name}」を読み込みました`);
    } else {
      toast.error('プロジェクトの読み込みに失敗しました');
    }
  };

  // 日時フォーマット
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 相対時間フォーマット
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return formatDate(timestamp);
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">プロジェクト管理</h3>
      </div>

      {/* 検索・フィルター */}
      <div className="space-y-2">
        <Input
          placeholder="プロジェクトを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="flex-1"
          >
            すべて
          </Button>
          <Button
            variant={filter === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('manual')}
            className="flex-1"
          >
            手動保存
          </Button>
          <Button
            variant={filter === 'autosave' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('autosave')}
            className="flex-1"
          >
            自動保存
          </Button>
        </div>
      </div>

      {/* プロジェクト一覧 */}
      {filteredProjects.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          {searchQuery.trim()
            ? '検索結果が見つかりませんでした'
            : filter === 'autosave'
            ? '自動保存されたプロジェクトはありません'
            : '保存されたプロジェクトはありません'}
        </div>
      ) : (
        <>
          {isMobile ? (
            <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 px-2 scrollbar-thin">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className={cn(
                    "cursor-pointer hover:border-[#20B2AA] transition-all duration-200 group shrink-0 snap-center",
                    currentProjectName === project.name && "border-2 border-[#20B2AA]"
                  )}
                  style={{ width: 'min(85vw, 340px)' }}
                  onClick={() => handleLoad(project.id)}
                >
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {project.thumbnail ? (
                          <img
                            src={project.thumbnail}
                            alt={project.name}
                            className="w-20 h-12 object-cover rounded bg-[#2D2D2D]"
                          />
                        ) : (
                          <div className="w-20 h-12 bg-[#2D2D2D] rounded flex items-center justify-center">
                            <FolderOpen className="h-4 w-4 text-[#A0A0A0]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingId === project.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  confirmEdit(project.id);
                                } else if (e.key === 'Escape') {
                                  cancelEdit();
                                }
                              }}
                              className="h-9 text-sm flex-1"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmEdit(project.id);
                              }}
                              className="h-9 w-9 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEdit();
                              }}
                              className="h-9 w-9 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm truncate flex-1">
                                {project.name}
                                {project.isAutoSave && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (自動保存)
                                  </span>
                                )}
                              </h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(project);
                                  }}
                                  className="h-8 w-8 p-0 text-muted-foreground"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicate(project.id);
                                  }}
                                  className="h-8 w-8 p-0 text-muted-foreground"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(project.id, project.name);
                                  }}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(project.updatedAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatRelativeTime(project.updatedAt)}</span>
                              </div>
                              <span>{project.layers.length}レイヤー</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className={cn(
                      "cursor-pointer hover:border-[#20B2AA] transition-all duration-200 group",
                      currentProjectName === project.name && "border-2 border-[#20B2AA]"
                    )}
                    onClick={() => handleLoad(project.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {project.thumbnail ? (
                            <img
                              src={project.thumbnail}
                              alt={project.name}
                              className="w-16 h-9 object-cover rounded bg-[#2D2D2D]"
                            />
                          ) : (
                            <div className="w-16 h-9 bg-[#2D2D2D] rounded flex items-center justify-center">
                              <FolderOpen className="h-4 w-4 text-[#A0A0A0]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingId === project.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    confirmEdit(project.id);
                                  } else if (e.key === 'Escape') {
                                    cancelEdit();
                                  }
                                }}
                                className="h-8 text-sm flex-1"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmEdit(project.id);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEdit();
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm truncate flex-1">
                                  {project.name}
                                  {project.isAutoSave && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      (自動保存)
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEdit(project);
                                    }}
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDuplicate(project.id);
                                    }}
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(project.id, project.name);
                                    }}
                                    className="h-7 w-7 p-0 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(project.updatedAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatRelativeTime(project.updatedAt)}</span>
                                </div>
                                <span>{project.layers.length}レイヤー</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      )}
    </div>
  );
};

