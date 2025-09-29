import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Star, Upload, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generatePreviewFromTemplate, fileToDataURL } from '@/utils/imageUtils';

// テンプレートの型定義を拡張
export interface ThumbnailTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'gaming' | 'talk' | 'singing' | 'collaboration' | 'event' | 'custom';
  style: 'cute' | 'cool' | 'elegant' | 'funny' | 'simple';
  rating: number;
  preview: string; // プレビュー画像のURL
  templateImage?: string; // テンプレート画像のURL（カスタムテンプレート用）
  initialText: string;
  initialTextColor: string;
  initialFontSize: string;
  initialImageSrc?: string;
  initialBackgroundImagePosition?: { x: number; y: number; width: number; height: number };
  initialCharacterImagePosition?: { x: number; y: number; width: number; height: number };
  initialTextPosition?: { x: number; y: number; width: number; height: number };
  isCustom?: boolean;
  createdAt?: string;
}

// テンプレートの定義
export const templates: ThumbnailTemplate[] = [
  {
    id: 'template-1',
    name: 'シンプル',
    description: 'シンプルで使いやすいデザイン',
    category: 'talk',
    style: 'simple',
    rating: 4.5,
    preview: '/templates/thumbnail-generator/previews/talk_simple_template-1_preview.jpg',
    initialText: 'VTuber配信タイトル',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialCharacterImagePosition: { x: 650, y: 100, width: 500, height: 500 },
    initialTextPosition: { x: 50, y: 280, width: 600, height: 150 },
  },
  {
    id: 'template-2',
    name: 'スタイリッシュ',
    description: 'モダンでスタイリッシュなデザイン',
    category: 'gaming',
    style: 'cool',
    rating: 4.8,
    preview: '/templates/thumbnail-generator/previews/gaming_cool_template-2_preview.jpg',
    initialText: '今日の配信！',
    initialTextColor: '#FFFFFF',
    initialFontSize: '5rem',
    initialCharacterImagePosition: { x: 100, y: 150, width: 450, height: 450 },
    initialTextPosition: { x: 600, y: 250, width: 550, height: 200 },
  },
  {
    id: 'template-3',
    name: 'かわいい',
    description: '可愛らしいデザイン',
    category: 'singing',
    style: 'cute',
    rating: 4.7,
    preview: '/templates/thumbnail-generator/previews/singing_cute_template-3_preview.jpg',
    initialText: 'みてね！',
    initialTextColor: '#FF69B4',
    initialFontSize: '4.5rem',
    initialCharacterImagePosition: { x: 350, y: 100, width: 400, height: 400 },
    initialTextPosition: { x: 50, y: 450, width: 400, height: 150 },
  },
  {
    id: 'template-4',
    name: 'クール',
    description: 'クールで格好いいデザイン',
    category: 'event',
    style: 'cool',
    rating: 4.6,
    preview: '/templates/thumbnail-generator/previews/event_cool_template-4_preview.jpg',
    initialText: '緊急告知',
    initialTextColor: '#E0E0E0',
    initialFontSize: '6rem',
    initialCharacterImagePosition: { x: 100, y: 100, width: 500, height: 500 },
    initialTextPosition: { x: 650, y: 280, width: 500, height: 150 },
  },
  {
    id: 'template-5',
    name: 'まっさら',
    description: '白紙から始められるテンプレート',
    category: 'custom',
    style: 'simple',
    rating: 4.0,
    preview: '/templates/thumbnail-generator/previews/custom_simple_template-5_preview.jpg',
    initialText: 'テキストを入力',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialTextPosition: { x: 340, y: 285, width: 600, height: 150 },
  },
];

interface TemplateSelectorProps {
  onSelectTemplate: (template: ThumbnailTemplate) => void;
  selectedTemplateId: string | null;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, selectedTemplateId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<ThumbnailTemplate[]>([]);
  const [allTemplates, setAllTemplates] = useState<ThumbnailTemplate[]>(templates);

  // カスタムテンプレートの読み込み
  useEffect(() => {
    const savedTemplates = localStorage.getItem('customThumbnailTemplates');
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      setCustomTemplates(parsed);
      setAllTemplates([...templates, ...parsed]);
    }
  }, []);

  // フィルタリング
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStyle = styleFilter === 'all' || template.style === styleFilter;
    
    return matchesSearch && matchesCategory && matchesStyle;
  });

  // カスタムテンプレート作成
  const handleCreateCustomTemplate = (templateData: Partial<ThumbnailTemplate>) => {
    const newTemplate: ThumbnailTemplate = {
      id: `custom-${Date.now()}`,
      name: templateData.name || 'カスタムテンプレート',
      description: templateData.description || '',
      category: templateData.category || 'custom',
      style: templateData.style || 'simple',
      rating: 0,
      preview: templateData.preview || '',
      templateImage: templateData.templateImage || '', // カスタムテンプレートの画像を追加
      initialText: '新しいテキスト',
      initialTextColor: '#000000',
      initialFontSize: '4rem',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updatedCustomTemplates = [...customTemplates, newTemplate];
    setCustomTemplates(updatedCustomTemplates);
    setAllTemplates([...templates, ...updatedCustomTemplates]);
    
    localStorage.setItem('customThumbnailTemplates', JSON.stringify(updatedCustomTemplates));
    toast.success('カスタムテンプレートを作成しました！');
    setShowCustomCreator(false);
  };

  // カスタムテンプレート削除
  const handleDeleteCustomTemplate = (templateId: string) => {
    if (confirm('このカスタムテンプレートを削除しますか？')) {
      const updatedCustomTemplates = customTemplates.filter(template => template.id !== templateId);
      setCustomTemplates(updatedCustomTemplates);
      setAllTemplates([...templates, ...updatedCustomTemplates]);
      
      localStorage.setItem('customThumbnailTemplates', JSON.stringify(updatedCustomTemplates));
      toast.success('カスタムテンプレートを削除しました！');
    }
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">テンプレート選択</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowCustomCreator(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          カスタム作成
        </Button>
      </div>

      {/* 検索・フィルター */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="テンプレートを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="gaming">ゲーム</SelectItem>
              <SelectItem value="talk">雑談</SelectItem>
              <SelectItem value="singing">歌枠</SelectItem>
              <SelectItem value="collaboration">コラボ</SelectItem>
              <SelectItem value="event">イベント</SelectItem>
              <SelectItem value="custom">カスタム</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="スタイル" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="cute">可愛い</SelectItem>
              <SelectItem value="cool">クール</SelectItem>
              <SelectItem value="elegant">エレガント</SelectItem>
              <SelectItem value="funny">面白い</SelectItem>
              <SelectItem value="simple">シンプル</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* テンプレートグリッド */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={cn(
              "relative group cursor-pointer transition-all hover:scale-105",
              selectedTemplateId === template.id && "ring-2 ring-blue-500"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                {/* プレビュー画像またはフォールバック */}
                {template.preview ? (
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={cn("w-full h-full flex items-center justify-center", {
                    'simple-enhanced': template.id === 'template-1',
                    'stylish-enhanced': template.id === 'template-2',
                    'cute-enhanced': template.id === 'template-3',
                    'cool-enhanced': template.id === 'template-4',
                    'bg-gray-200': template.id === 'template-5',
                  })}>
                    <p className="text-sm font-bold" style={{ color: template.initialTextColor }}>
                      {template.initialText}
                    </p>
                  </div>
                )}
                
                {/* ホバー時のプレビューボタン */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary">
                    <Eye className="h-4 w-4 mr-1" />
                    プレビュー
                  </Button>
                  {template.isCustom && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomTemplate(template.id);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      削除
                    </Button>
                  )}
                </div>
              </div>
              
              <CardContent className="p-3">
                <h4 className="font-medium text-sm truncate">{template.name}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.category === 'gaming' ? 'ゲーム' :
                     template.category === 'talk' ? '雑談' :
                     template.category === 'singing' ? '歌枠' :
                     template.category === 'collaboration' ? 'コラボ' :
                     template.category === 'event' ? 'イベント' : 'カスタム'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs">{template.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* カスタムテンプレート作成モーダル */}
      {showCustomCreator && (
        <CustomTemplateCreator
          onCreateTemplate={handleCreateCustomTemplate}
          onClose={() => setShowCustomCreator(false)}
        />
      )}
    </div>
  );
};

// カスタムテンプレート作成コンポーネント
interface CustomTemplateCreatorProps {
  onCreateTemplate: (templateData: Partial<ThumbnailTemplate>) => void;
  onClose: () => void;
}

const CustomTemplateCreator: React.FC<CustomTemplateCreatorProps> = ({ onCreateTemplate, onClose }) => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('custom');
  const [templateStyle, setTemplateStyle] = useState<string>('simple');
  const [templateImage, setTemplateImage] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // ファイルをDataURLに変換
      const templateDataURL = await fileToDataURL(file);
      setTemplateImage(templateDataURL);
      
      // プレビュー画像を自動生成
      setIsGeneratingPreview(true);
      const previewDataURL = await generatePreviewFromTemplate(templateDataURL);
      setPreviewImage(previewDataURL);
      
      toast.success('画像をアップロードし、プレビューを生成しました！');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
      setIsGeneratingPreview(false);
    }
  };

  const handleCreate = () => {
    if (!templateName.trim()) {
      toast.error('テンプレート名を入力してください');
      return;
    }

    if (!templateImage) {
      toast.error('テンプレート画像をアップロードしてください');
      return;
    }

    onCreateTemplate({
      name: templateName,
      description: templateDescription,
      category: templateCategory as any,
      style: templateStyle as any,
      preview: previewImage,
      // テンプレート画像も保存（将来的に使用する可能性）
      templateImage: templateImage
    });

    // フォームをリセット
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('custom');
    setTemplateStyle('simple');
    setTemplateImage('');
    setPreviewImage('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              カスタムテンプレート作成
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            既存のサムネイル画像をアップロードしてテンプレートとして保存できます
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-xs text-yellow-800">
              <strong>注意:</strong> カスタムテンプレートは現在1280×720でのエクスポートのみ対応しています。
              他の解像度でのエクスポートは正常に動作しない場合があります。
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* テンプレート画像アップロード */}
          <div>
            <Label className="text-sm font-medium">テンプレート画像</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />
              {templateImage && (
                <div className="space-y-2">
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={templateImage}
                      alt="テンプレート"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500">元画像 (1280×720px推奨)</p>
                </div>
              )}
              {previewImage && (
                <div className="space-y-2">
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden max-w-xs">
                    <img
                      src={previewImage}
                      alt="プレビュー"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500">プレビュー画像 (320×180px)</p>
                </div>
              )}
              {isUploading && (
                <p className="text-xs text-gray-500 mt-1">アップロード中...</p>
              )}
              {isGeneratingPreview && (
                <p className="text-xs text-blue-500 mt-1">プレビュー生成中...</p>
              )}
            </div>
          </div>

          {/* テンプレート名 */}
          <div>
            <Label className="text-sm font-medium">テンプレート名</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="テンプレート名を入力"
              className="mt-1"
            />
          </div>

          {/* 説明 */}
          <div>
            <Label className="text-sm font-medium">説明</Label>
            <Textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="テンプレートの説明を入力"
              className="mt-1 min-h-[80px] resize-none"
            />
          </div>

          {/* カテゴリとスタイル */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">カテゴリ</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gaming">ゲーム</SelectItem>
                  <SelectItem value="talk">雑談</SelectItem>
                  <SelectItem value="singing">歌枠</SelectItem>
                  <SelectItem value="collaboration">コラボ</SelectItem>
                  <SelectItem value="event">イベント</SelectItem>
                  <SelectItem value="custom">カスタム</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">スタイル</Label>
              <Select value={templateStyle} onValueChange={setTemplateStyle}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cute">可愛い</SelectItem>
                  <SelectItem value="cool">クール</SelectItem>
                  <SelectItem value="elegant">エレガント</SelectItem>
                  <SelectItem value="funny">面白い</SelectItem>
                  <SelectItem value="simple">シンプル</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreate} className="flex-1" disabled={!templateName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              テンプレートを作成
            </Button>
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(TemplateSelector);