'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from './settings-tab';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

export function SnsPostTab() {
  const { schedules, selectedDate } = useSchedule();
  const { settings } = useSettings();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [postContent, setPostContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const targetSchedule = schedules.find(s => s.date === (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''));

  useEffect(() => {
    if (settings.snsTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(settings.snsTemplates[0].id);
    }
  }, [settings.snsTemplates, selectedTemplateId]);

  useEffect(() => {
    const template = settings.snsTemplates.find(t => t.id === selectedTemplateId);
    if (template) {
      let content = template.content;
      if (targetSchedule) {
        content = content.replace(/{title}/g, targetSchedule.title || '未定');
        content = content.replace(/{date}/g, targetSchedule.date ? format(new Date(targetSchedule.date), 'yyyy/MM/dd', { locale: ja }) : '未定');
        content = content.replace(/{time}/g, targetSchedule.time || '未定');
        content = content.replace(/{category}/g, targetSchedule.category || '未定');
        content = content.replace(/{platform}/g, targetSchedule.platform || '未定');
        content = content.replace(/{notes}/g, targetSchedule.notes || '');
      } else {
        const placeholderVars = ['{title}', '{date}', '{time}', '{category}', '{platform}', '{notes}'];
        placeholderVars.forEach(v => {
            content = content.replace(new RegExp(v, 'g'), '');
        });
      }
      content = content.replace(/{hashtags}/g, settings.hashtags.join(' '));
      setPostContent(content);
    }
  }, [selectedTemplateId, targetSchedule, settings.snsTemplates, settings.hashtags]);

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = postContent.substring(0, start) + text + postContent.substring(end);
      setPostContent(newText);
      textarea.focus();
      setTimeout(() => textarea.setSelectionRange(start + text.length, start + text.length), 0);
    }
  };

  const handlePostToX = () => {
    const text = encodeURIComponent(postContent);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank');
    toast.success('Xへの投稿画面を開きました。');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postContent);
      toast.success('クリップボードにコピーしました！');
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('コピーに失敗しました。');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="templateSelect">テンプレート選択</label>
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger id="templateSelect">
            <SelectValue placeholder="テンプレートを選択" />
          </SelectTrigger>
          <SelectContent>
            {settings.snsTemplates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="postContent">投稿内容</label>
        <Textarea
          id="postContent"
          ref={textareaRef}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="h-48"
          placeholder={targetSchedule ? "" : "カレンダーで日付を選択すると、スケジュール情報が自動で入力されます。"}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">ハッシュタグを挿入</Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col space-y-2">
                {settings.hashtags.map(tag => (
                    <Button key={tag} variant="ghost" size="sm" onClick={() => insertText(tag + ' ')} className="justify-start">
                        {tag}
                    </Button>
                ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={handlePostToX} disabled={!postContent} className="flex-grow">
          Xに投稿
        </Button>
        <Button onClick={handleCopy} disabled={!postContent} variant="outline" className="flex-grow">
          コピー
        </Button>
      </div>
    </div>
  );
}
