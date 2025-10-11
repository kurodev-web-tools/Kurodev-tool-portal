/**
 * テンプレート編集フォームコンポーネント
 * テンプレートの作成・編集フォームを提供
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbnailTemplate } from '@/types/template';

// テンプレート作成フォームのProps
export interface CreateTemplateFormProps {
  onSubmit: (template: Partial<ThumbnailTemplate>) => void;
}

/**
 * テンプレート作成フォーム
 */
export const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({ onSubmit }) => {
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
            onValueChange={(value) => setFormData({ ...formData, category: value as never })}
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
            onValueChange={(value) => setFormData({ ...formData, style: value as never })}
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
            onValueChange={(value) => setFormData({ ...formData, difficulty: value as never })}
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

// テンプレート編集フォームのProps
export interface EditTemplateFormProps {
  template: ThumbnailTemplate;
  onSubmit: (template: ThumbnailTemplate) => void;
}

/**
 * テンプレート編集フォーム
 */
export const EditTemplateForm: React.FC<EditTemplateFormProps> = ({ template, onSubmit }) => {
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
            onValueChange={(value) => setFormData({ ...formData, category: value as never })}
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
            onValueChange={(value) => setFormData({ ...formData, style: value as never })}
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
            onValueChange={(value) => setFormData({ ...formData, difficulty: value as never })}
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

