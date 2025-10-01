'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

// 設定の型定義
interface AppSettings {
  categories: string[];
  platforms: string[];
  snsTemplates: { id: string; name: string; content: string; }[];
  hashtags: string[];
}

// デフォルト設定
const defaultSettings: AppSettings = {
  categories: ['雑談', 'ゲーム', '歌枠', '飲酒', 'コラボ', 'その他'],
  platforms: ['YouTube', 'Twitch', 'IRIAM', '17LIVE', 'その他'],
  snsTemplates: [
    {
      id: '1',
      name: '基本テンプレート',
      content: '📢配信告知📢\n\nタイトル: {title}\n日時: {date} {time}\nカテゴリ: {category}\nプラットフォーム: {platform}\n\n詳細: {notes}\n\n{hashtags}',
    },
    {
      id: '2',
      name: 'シンプルテンプレート',
      content: '✨{title}✨\n{date} {time}より配信開始！\n{platform}にて！\n\n{hashtags}',
    },
  ],
  hashtags: ['#新人VTuber', '#VTuberはじめました'],
};

const VARIABLES = [
  { value: '{title}', label: 'タイトル' },
  { value: '{date}', label: '日付' },
  { value: '{time}', label: '時間' },
  { value: '{category}', label: 'カテゴリ' },
  { value: '{platform}', label: 'プラットフォーム' },
  { value: '{notes}', label: '備考' },
  { value: '{hashtags}', label: '共通ハッシュタグ' },
];

// Contextの作成
const SettingsContext = createContext<{ 
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
} | undefined>(undefined);

// SettingsProvider
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettingsJson = localStorage.getItem('vtuber_schedule_app_settings');
      if (savedSettingsJson) {
        const savedSettings = JSON.parse(savedSettingsJson);
        return {
          ...defaultSettings,
          ...savedSettings,
        };
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vtuber_schedule_app_settings', JSON.stringify(settings));
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
    toast.success('設定を保存しました。');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// useSettingsフック
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// SettingsTabコンポーネント
export function SettingsTab() {
  const { settings, updateSettings } = useSettings();
  const [newCategory, setNewCategory] = useState('');
  const [newPlatform, setNewPlatform] = useState('');
  const [newHashtag, setNewHashtag] = useState('');
  const [newSnsTemplateName, setNewSnsTemplateName] = useState('');
  const [newSnsTemplateContent, setNewSnsTemplateContent] = useState('');
  const templateContentRef = useRef<HTMLTextAreaElement>(null);

  const handleAddCategory = () => {
    if (newCategory && !settings.categories.includes(newCategory)) {
      updateSettings({ categories: [...settings.categories, newCategory] });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    updateSettings({ categories: settings.categories.filter(c => c !== categoryToRemove) });
  };

  const handleAddPlatform = () => {
    if (newPlatform && !settings.platforms.includes(newPlatform)) {
      updateSettings({ platforms: [...settings.platforms, newPlatform] });
      setNewPlatform('');
    }
  };

  const handleRemovePlatform = (platformToRemove: string) => {
    updateSettings({ platforms: settings.platforms.filter(p => p !== platformToRemove) });
  };
  
  const handleAddHashtag = () => {
    if (newHashtag && !settings.hashtags.includes(newHashtag)) {
      updateSettings({ hashtags: [...settings.hashtags, newHashtag] });
      setNewHashtag('');
    }
  };

  const handleRemoveHashtag = (hashtagToRemove: string) => {
    updateSettings({ hashtags: settings.hashtags.filter(h => h !== hashtagToRemove) });
  };

  const handleAddSnsTemplate = () => {
    if (newSnsTemplateName && newSnsTemplateContent) {
      const newTemplate = {
        id: String(Date.now()),
        name: newSnsTemplateName,
        content: newSnsTemplateContent,
      };
      updateSettings({ snsTemplates: [...settings.snsTemplates, newTemplate] });
      setNewSnsTemplateName('');
      setNewSnsTemplateContent('');
    }
  };

  const handleRemoveSnsTemplate = (idToRemove: string) => {
    updateSettings({ snsTemplates: settings.snsTemplates.filter(t => t.id !== idToRemove) });
  };

  const insertVariable = (text: string) => {
    const textarea = templateContentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = newSnsTemplateContent.substring(0, start) + text + newSnsTemplateContent.substring(end);
      setNewSnsTemplateContent(newText);
      textarea.focus();
      setTimeout(() => textarea.setSelectionRange(start + text.length, start + text.length), 0);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">設定</h2>
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">

        <AccordionItem value="item-1">
          <AccordionTrigger>カテゴリ設定</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings.categories.sort().map(category => (
                <span key={category} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm w-[110px] justify-center">
                  <span className="flex-1 text-center text-xs font-medium truncate">{category}</span>
                  <Button variant="ghost" size="icon" className="ml-1 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0" onClick={() => handleRemoveCategory(category)}>
                    ×
                  </Button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="新しいカテゴリ"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAddCategory}>追加</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>プラットフォーム設定</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings.platforms.map(platform => (
                <span key={platform} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm w-[110px] justify-center">
                  <span className="flex-1 text-center text-xs font-medium truncate">{platform}</span>
                  <Button variant="ghost" size="icon" className="ml-1 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0" onClick={() => handleRemovePlatform(platform)}>
                    ×
                  </Button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="新しいプラットフォーム"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAddPlatform}>追加</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>SNSテンプレート設定</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mb-4">
              {settings.snsTemplates.map(template => (
                <div key={template.id} className="border p-3 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveSnsTemplate(template.id)}>
                      削除
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{template.content}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSnsTemplateName">新しいテンプレート名</Label>
              <Input
                id="newSnsTemplateName"
                value={newSnsTemplateName}
                onChange={(e) => setNewSnsTemplateName(e.target.value)}
                placeholder="例: 告知用テンプレート"
              />
              <Label htmlFor="newSnsTemplateContent">内容</Label>
              <Textarea
                id="newSnsTemplateContent"
                ref={templateContentRef}
                value={newSnsTemplateContent}
                onChange={(e) => setNewSnsTemplateContent(e.target.value)}
                placeholder="例: 📢配信告知📢\nタイトル: {title}"
                rows={5}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">変数を挿入</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="flex flex-col">
                      {VARIABLES.map(v => (
                        <Button key={v.value} variant="ghost" size="sm" onClick={() => insertVariable(v.value)} className="justify-start">
                          {v.label}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleAddSnsTemplate} className="mt-2">テンプレートを追加</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>ハッシュタグ設定</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 mb-4">
              {settings.hashtags.map(hashtag => (
                <div key={hashtag} className="flex items-center justify-between bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm">
                  <span className="text-xs font-medium">{hashtag}</span>
                  <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleRemoveHashtag(hashtag)}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="新しいハッシュタグ (例: #VTuber)"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAddHashtag}>追加</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}