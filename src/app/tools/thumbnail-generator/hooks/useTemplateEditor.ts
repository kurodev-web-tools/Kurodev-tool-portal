/**
 * テンプレートエディターのカスタムフック
 * State管理、イベントハンドラー、フィルタリングロジックを提供
 */

import { useState, useMemo, useCallback } from 'react';
import { ThumbnailTemplate } from '@/types/template';
import { Layer } from '../contexts/TemplateContext';
import { TemplatePreviewGenerator } from '../utils/templatePreviewGenerator';
import { logger } from '@/lib/logger';

export interface UseTemplateEditorParams {
  templates: ThumbnailTemplate[];
  onTemplatesChange: (templates: ThumbnailTemplate[]) => void;
  layers: Layer[];
  createTemplateFromCurrentLayers: (templateData: Partial<ThumbnailTemplate>) => ThumbnailTemplate;
}

export interface UseTemplateEditorReturn {
  // State
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (value: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (value: boolean) => void;
  editingTemplate: ThumbnailTemplate | null;
  setEditingTemplate: (template: ThumbnailTemplate | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  
  // Computed
  filteredTemplates: ThumbnailTemplate[];
  
  // Handlers
  handleCreateTemplate: (templateData: Partial<ThumbnailTemplate>) => Promise<void>;
  handleEditTemplate: (template: ThumbnailTemplate) => void;
  handleUpdateTemplate: (updatedTemplate: ThumbnailTemplate) => void;
  handleDeleteTemplate: (templateId: string) => void;
  handleDuplicateTemplate: (template: ThumbnailTemplate) => void;
  handleExportTemplate: (template: ThumbnailTemplate) => void;
  handleImportTemplate: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * テンプレートエディターのカスタムフック
 */
export const useTemplateEditor = ({
  templates,
  onTemplatesChange,
  layers,
  createTemplateFromCurrentLayers,
}: UseTemplateEditorParams): UseTemplateEditorReturn => {
  // State管理
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ThumbnailTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // フィルタリングされたテンプレート
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (template.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.metadata.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [templates, searchQuery, selectedCategory, selectedDifficulty]);

  // テンプレート作成（現在のレイヤーから）
  const handleCreateTemplate = useCallback(async (templateData: Partial<ThumbnailTemplate>) => {
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
  }, [layers, createTemplateFromCurrentLayers, onTemplatesChange, templates]);

  // テンプレート編集
  const handleEditTemplate = useCallback((template: ThumbnailTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  }, []);

  // テンプレート更新
  const handleUpdateTemplate = useCallback((updatedTemplate: ThumbnailTemplate) => {
    const updatedTemplates = templates.map(template =>
      template.id === updatedTemplate.id ? updatedTemplate : template
    );
    onTemplatesChange(updatedTemplates);
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
  }, [templates, onTemplatesChange]);

  // テンプレート削除
  const handleDeleteTemplate = useCallback((templateId: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      const updatedTemplates = templates.filter(template => template.id !== templateId);
      onTemplatesChange(updatedTemplates);
    }
  }, [templates, onTemplatesChange]);

  // テンプレート複製
  const handleDuplicateTemplate = useCallback((template: ThumbnailTemplate) => {
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
  }, [templates, onTemplatesChange]);

  // テンプレートエクスポート
  const handleExportTemplate = useCallback((template: ThumbnailTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${template.name.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, []);

  // テンプレートインポート
  const handleImportTemplate = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [templates, onTemplatesChange]);

  return {
    // State
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingTemplate,
    setEditingTemplate,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    
    // Computed
    filteredTemplates,
    
    // Handlers
    handleCreateTemplate,
    handleEditTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    handleDuplicateTemplate,
    handleExportTemplate,
    handleImportTemplate,
  };
};

