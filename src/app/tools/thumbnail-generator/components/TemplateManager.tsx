'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, Download, Upload } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbnailTemplate } from '@/types/template';
import { useTemplate } from '../contexts/TemplateContext';
import { useTemplateEditor } from '../hooks/useTemplateEditor';
import { CreateTemplateForm, EditTemplateForm } from './TemplateEditForm';

interface TemplateManagerProps {
  templates: ThumbnailTemplate[];
  onTemplatesChange: (templates: ThumbnailTemplate[]) => void;
  onSelectTemplate: (template: ThumbnailTemplate) => void;
  selectedTemplateId: string | null;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onTemplatesChange,
  onSelectTemplate,
}) => {
  const { createTemplateFromCurrentLayers, layers } = useTemplate();
  
  // テンプレートエディターフック
  const editor = useTemplateEditor({
    templates,
    onTemplatesChange,
    layers,
    createTemplateFromCurrentLayers,
  });

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold whitespace-nowrap">テンプレート管理</h2>
          <p className="text-muted-foreground whitespace-nowrap">
            カスタムテンプレートの作成、編集、管理を行います
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-template')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            インポート
          </Button>
          <input
            id="import-template"
            type="file"
            accept=".json"
            onChange={editor.handleImportTemplate}
            className="hidden"
          />
          <Dialog open={editor.isCreateDialogOpen} onOpenChange={editor.setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新しいテンプレートを作成</DialogTitle>
                <DialogDescription>
                  プレビューエリアのオブジェクトからテンプレートを作成します（{layers.length}個のオブジェクトが配置されています）
                </DialogDescription>
              </DialogHeader>
              <CreateTemplateForm onSubmit={editor.handleCreateTemplate} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="テンプレートを検索..."
            value={editor.searchQuery}
            onChange={(e) => editor.setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={editor.selectedCategory} onValueChange={editor.setSelectedCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="gaming">ゲーミング</SelectItem>
            <SelectItem value="talk">トーク</SelectItem>
            <SelectItem value="singing">音楽</SelectItem>
            <SelectItem value="collaboration">コラボ</SelectItem>
            <SelectItem value="event">イベント</SelectItem>
            <SelectItem value="custom">カスタム</SelectItem>
          </SelectContent>
        </Select>
        <Select value={editor.selectedDifficulty} onValueChange={editor.setSelectedDifficulty}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="難易度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="beginner">初級</SelectItem>
            <SelectItem value="intermediate">中級</SelectItem>
            <SelectItem value="advanced">上級</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* テンプレート一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editor.filteredTemplates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectTemplate(template)}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>プレビュー</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editor.handleEditTemplate(template)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>編集</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editor.handleDeleteTemplate(template.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>削除</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {template.description}
                </CardDescription>
                {template.preview && (
                  <div className="mt-2">
                    <img 
                      src={template.preview} 
                      alt={`${template.name}のプレビュー`}
                      className="w-full h-16 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`${
                      template.category === 'gaming' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      template.category === 'talk' ? 'bg-green-100 text-green-800 border-green-200' :
                      template.category === 'singing' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      template.category === 'collaboration' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      template.category === 'event' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                      'bg-[#2D2D2D] text-[#E0E0E0] border-[#4A4A4A]'
                    }`}
                  >
                    {template.category}
                  </Badge>
                  <Badge variant="outline">{template.style}</Badge>
                  <Badge variant="outline">{template.metadata.difficulty}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{template.metadata.estimatedTime}分</span>
                  <span>{template.layout.objects.length}オブジェクト</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.handleDuplicateTemplate(template)}
                    className="flex-1 text-xs"
                  >
                    複製
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.handleExportTemplate(template)}
                    className="flex-1 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    出力
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 編集ダイアログ */}
      <Dialog open={editor.isEditDialogOpen} onOpenChange={editor.setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>テンプレートを編集</DialogTitle>
            <DialogDescription>
              テンプレートの情報を編集できます
            </DialogDescription>
          </DialogHeader>
          {editor.editingTemplate && (
            <EditTemplateForm
              template={editor.editingTemplate}
              onSubmit={editor.handleUpdateTemplate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
