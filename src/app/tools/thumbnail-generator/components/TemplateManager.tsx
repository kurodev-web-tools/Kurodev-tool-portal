'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash2, Eye, Download, Upload, Save, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThumbnailTemplate } from '@/types/template';
import { useTemplate } from '../contexts/TemplateContext';
import { TemplatePreviewGenerator } from '../utils/templatePreviewGenerator';
import { logger } from '@/lib/logger';

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
  selectedTemplateId,
}) => {
  const { createTemplateFromCurrentLayers, layers } = useTemplate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ThumbnailTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // フィルタリングされたテンプレート
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (template.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.metadata.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // テンプレート作成（現在のレイヤーから）
  const handleCreateTemplate = async (templateData: Partial<ThumbnailTemplate>) => {
    if (layers.length === 0) {
      alert('テンプレートを作成するには、まずプレビューエリアにオブジェクトを配置してください。');
      return;
    }
    
    const newTemplate = createTemplateFromCurrentLayers(templateData);
    
    // プレビュー画像を生成
    try {
      const preview = await TemplatePreviewGenerator.generatePreview(newTemplate);
      newTemplate.preview = preview;
    } catch (error) {
      logger.warn('プレビュー画像生成失敗', { error }, 'TemplateManager');
    }
    
    onTemplatesChange([...templates, newTemplate]);
    setIsCreateDialogOpen(false);
  };

  // テンプレート編集
  const handleEditTemplate = (template: ThumbnailTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  // テンプレート更新
  const handleUpdateTemplate = (updatedTemplate: ThumbnailTemplate) => {
    const updatedTemplates = templates.map(template =>
      template.id === updatedTemplate.id ? updatedTemplate : template
    );
    onTemplatesChange(updatedTemplates);
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
  };

  // テンプレート削除
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      const updatedTemplates = templates.filter(template => template.id !== templateId);
      onTemplatesChange(updatedTemplates);
    }
  };

  // テンプレート複製
  const handleDuplicateTemplate = (template: ThumbnailTemplate) => {
    const duplicatedTemplate: ThumbnailTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name}のコピー`,
      metadata: {
        ...template.metadata,
        lastModified: new Date().toISOString(),
        usage: {
          views: 0,
          downloads: 0,
          favorites: 0,
        },
      },
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onTemplatesChange([...templates, duplicatedTemplate]);
  };

  // テンプレートエクスポート
  const handleExportTemplate = (template: ThumbnailTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${template.name.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // テンプレートインポート
  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTemplate = JSON.parse(e.target?.result as string) as ThumbnailTemplate;
        importedTemplate.id = `template-${Date.now()}`;
        importedTemplate.isCustom = true;
        importedTemplate.createdAt = new Date().toISOString();
        importedTemplate.metadata.lastModified = new Date().toISOString();
        
        onTemplatesChange([...templates, importedTemplate]);
      } catch (error) {
        alert('テンプレートファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

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
            onChange={handleImportTemplate}
            className="hidden"
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
              <CreateTemplateForm onSubmit={handleCreateTemplate} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="テンプレートを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
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
        {filteredTemplates.map((template) => (
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
                          onClick={() => handleEditTemplate(template)}
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
                          onClick={() => handleDeleteTemplate(template.id)}
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
                      'bg-gray-100 text-gray-800 border-gray-200'
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
                    onClick={() => handleDuplicateTemplate(template)}
                    className="flex-1 text-xs"
                  >
                    複製
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportTemplate(template)}
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>テンプレートを編集</DialogTitle>
            <DialogDescription>
              テンプレートの情報を編集できます
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <EditTemplateForm
              template={editingTemplate}
              onSubmit={handleUpdateTemplate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// テンプレート作成フォーム
interface CreateTemplateFormProps {
  onSubmit: (template: Partial<ThumbnailTemplate>) => void;
}

const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as const,
    style: 'simple' as const,
    difficulty: 'beginner' as const,
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      metadata: {
        version: '1.0.0',
        author: 'User',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        difficulty: formData.difficulty,
        estimatedTime: 5,
        lastModified: new Date().toISOString(),
        usage: {
          views: 0,
          downloads: 0,
          favorites: 0,
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">テンプレート名</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">カテゴリ</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gaming">ゲーミング</SelectItem>
              <SelectItem value="talk">トーク</SelectItem>
              <SelectItem value="singing">音楽</SelectItem>
              <SelectItem value="collaboration">コラボ</SelectItem>
              <SelectItem value="event">イベント</SelectItem>
              <SelectItem value="custom">カスタム</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="style">スタイル</Label>
          <Select
            value={formData.style}
            onValueChange={(value) => setFormData({ ...formData, style: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cute">キュート</SelectItem>
              <SelectItem value="cool">クール</SelectItem>
              <SelectItem value="elegant">エレガント</SelectItem>
              <SelectItem value="funny">ファニー</SelectItem>
              <SelectItem value="simple">シンプル</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="difficulty">難易度</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">初級</SelectItem>
              <SelectItem value="intermediate">中級</SelectItem>
              <SelectItem value="advanced">上級</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="tags">タグ（カンマ区切り）</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="例: ゲーム, アクション, 面白い"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">作成</Button>
      </div>
    </form>
  );
};

// テンプレート編集フォーム
interface EditTemplateFormProps {
  template: ThumbnailTemplate;
  onSubmit: (template: ThumbnailTemplate) => void;
}

const EditTemplateForm: React.FC<EditTemplateFormProps> = ({ template, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: template.name,
    description: template.description,
    category: template.category,
    style: template.style,
    difficulty: template.metadata.difficulty,
    tags: template.metadata.tags.join(', '),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...template,
      ...formData,
      metadata: {
        ...template.metadata,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        difficulty: formData.difficulty,
        lastModified: new Date().toISOString(),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name">テンプレート名</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-category">カテゴリ</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gaming">ゲーミング</SelectItem>
              <SelectItem value="talk">トーク</SelectItem>
              <SelectItem value="singing">音楽</SelectItem>
              <SelectItem value="collaboration">コラボ</SelectItem>
              <SelectItem value="event">イベント</SelectItem>
              <SelectItem value="custom">カスタム</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="edit-description">説明</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-style">スタイル</Label>
          <Select
            value={formData.style}
            onValueChange={(value) => setFormData({ ...formData, style: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cute">キュート</SelectItem>
              <SelectItem value="cool">クール</SelectItem>
              <SelectItem value="elegant">エレガント</SelectItem>
              <SelectItem value="funny">ファニー</SelectItem>
              <SelectItem value="simple">シンプル</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-difficulty">難易度</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">初級</SelectItem>
              <SelectItem value="intermediate">中級</SelectItem>
              <SelectItem value="advanced">上級</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="edit-tags">タグ（カンマ区切り）</Label>
        <Input
          id="edit-tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="例: ゲーム, アクション, 面白い"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">更新</Button>
      </div>
    </form>
  );
};
