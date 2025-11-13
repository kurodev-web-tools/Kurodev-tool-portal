import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  STORAGE_KEYS,
  loadDescriptionTemplatesFromStorage,
  saveDescriptionTemplatesToStorage,
  type DescriptionTemplate,
  type TemplateSection,
} from '../types/storage';

/**
 * プリセットテンプレート定義
 */
const PRESET_TEMPLATES: DescriptionTemplate[] = [
  {
    id: 'default',
    name: 'デフォルト',
    description: '標準的な構成（概要、タイムスタンプ、関連動画、ハッシュタグ、SNS）',
    sections: [
      {
        type: 'summary',
        content: 'この動画では、{videoTheme}について詳しく解説しています。',
        enabled: true,
        order: 1,
      },
      {
        type: 'timestamp',
        title: 'タイムスタンプ',
        content: '00:00 オープニング\n02:30 本編開始\n15:45 まとめ',
        enabled: true,
        order: 2,
      },
      {
        type: 'related',
        title: '関連動画',
        content: '・前回の動画: [リンク]\n・次回予告: [リンク]',
        enabled: true,
        order: 3,
      },
      {
        type: 'hashtag',
        title: 'ハッシュタグ',
        content: '{hashtags}',
        enabled: true,
        order: 4,
      },
      {
        type: 'sns',
        title: 'SNS',
        content: 'Twitter: @your_twitter\nInstagram: @your_instagram',
        enabled: true,
        order: 5,
      },
    ],
  },
  {
    id: 'game-streaming',
    name: 'ゲーム実況用',
    description: 'ゲーム実況向けの構成（概要、タイムスタンプ、ハッシュタグ）',
    sections: [
      {
        type: 'summary',
        content: 'この動画では、{videoTheme}を実況プレイしています。',
        enabled: true,
        order: 1,
      },
      {
        type: 'timestamp',
        title: 'タイムスタンプ',
        content: '00:00 オープニング\n02:30 ゲーム開始\n20:00 ハイライト',
        enabled: true,
        order: 2,
      },
      {
        type: 'hashtag',
        title: 'ハッシュタグ',
        content: '{hashtags}',
        enabled: true,
        order: 3,
      },
      {
        type: 'sns',
        title: 'SNS',
        content: 'Twitter: @your_twitter',
        enabled: true,
        order: 4,
      },
    ],
  },
  {
    id: 'singing-stream',
    name: '歌枠用',
    description: '歌枠向けの構成（概要、セットリスト、ハッシュタグ）',
    sections: [
      {
        type: 'summary',
        content: 'この動画では、{videoTheme}を歌わせていただきました！',
        enabled: true,
        order: 1,
      },
      {
        type: 'setlist',
        title: 'セットリスト',
        content: '1. [曲名1]\n2. [曲名2]\n3. [曲名3]',
        enabled: true,
        order: 2,
      },
      {
        type: 'hashtag',
        title: 'ハッシュタグ',
        content: '{hashtags}',
        enabled: true,
        order: 3,
      },
      {
        type: 'sns',
        title: 'SNS',
        content: 'Twitter: @your_twitter',
        enabled: true,
        order: 4,
      },
    ],
  },
  {
    id: 'collaboration',
    name: 'コラボ用',
    description: 'コラボ配信向けの構成（概要、ゲスト情報、タイムスタンプ、ハッシュタグ）',
    sections: [
      {
        type: 'summary',
        content: 'この動画では、{videoTheme}をコラボ配信しました！',
        enabled: true,
        order: 1,
      },
      {
        type: 'guest',
        title: 'ゲスト',
        content: 'ゲスト: [ゲスト名]\nチャンネル: [チャンネルリンク]',
        enabled: true,
        order: 2,
      },
      {
        type: 'timestamp',
        title: 'タイムスタンプ',
        content: '00:00 オープニング\n05:00 本編開始',
        enabled: true,
        order: 3,
      },
      {
        type: 'hashtag',
        title: 'ハッシュタグ',
        content: '{hashtags}',
        enabled: true,
        order: 4,
      },
      {
        type: 'sns',
        title: 'SNS',
        content: 'Twitter: @your_twitter',
        enabled: true,
        order: 5,
      },
    ],
  },
  {
    id: 'simple',
    name: 'シンプル',
    description: 'シンプルな構成（概要、ハッシュタグのみ）',
    sections: [
      {
        type: 'summary',
        content: '{videoTheme}',
        enabled: true,
        order: 1,
      },
      {
        type: 'hashtag',
        title: 'ハッシュタグ',
        content: '{hashtags}',
        enabled: true,
        order: 2,
      },
    ],
  },
];

/**
 * 概要欄テンプレート管理フック
 */
export function useDescriptionTemplate() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  const [customTemplates, setCustomTemplates] = useState<DescriptionTemplate[]>([]);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  /**
   * カスタムテンプレートの読み込み
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const templates = loadDescriptionTemplatesFromStorage(STORAGE_KEYS.DESCRIPTION_TEMPLATES);
      setCustomTemplates(templates);
    } catch (err) {
      console.error('カスタムテンプレート読み込み失敗', err);
    }
  }, []);

  /**
   * カスタムテンプレートの保存
   */
  const saveCustomTemplates = useCallback((templates: DescriptionTemplate[]) => {
    setCustomTemplates(templates);
    saveDescriptionTemplatesToStorage(STORAGE_KEYS.DESCRIPTION_TEMPLATES, templates);
  }, []);

  /**
   * テンプレート一覧（プリセット + カスタム）
   */
  const allTemplates = useMemo(
    () => [...PRESET_TEMPLATES, ...customTemplates],
    [customTemplates],
  );

  /**
   * 選択中のテンプレートを取得
   */
  const selectedTemplate = useMemo(() => {
    return allTemplates.find((t) => t.id === selectedTemplateId) || PRESET_TEMPLATES[0];
  }, [allTemplates, selectedTemplateId]);

  /**
   * テンプレートを適用
   */
  const applyTemplate = useCallback(
    (
      templateId: string,
      videoTheme: string,
      hashtags: string[],
      generateDescription: (
        template: DescriptionTemplate,
        videoTheme: string,
        hashtags: string[],
      ) => string,
      extractHashtags: (description: string) => string[],
      onDescriptionGenerated: (description: string) => void,
      onHashtagsUpdated: (hashtags: string[]) => void,
    ) => {
      if (templateId === selectedTemplateId) return;

      const template = allTemplates.find((t) => t.id === templateId);
      if (!template) return;

      const generated = generateDescription(template, videoTheme, hashtags);
      onDescriptionGenerated(generated);
      setSelectedTemplateId(templateId);

      const extracted = extractHashtags(generated);
      if (extracted.length > 0) {
        onHashtagsUpdated(extracted);
      }

      toast.success(`「${template.name}」テンプレートを適用しました`);
    },
    [allTemplates, selectedTemplateId],
  );

  /**
   * カスタムテンプレートの追加
   */
  const addCustomTemplate = useCallback(
    (template: DescriptionTemplate) => {
      const newTemplates = [...customTemplates, template];
      saveCustomTemplates(newTemplates);
      toast.success('カスタムテンプレートを追加しました');
    },
    [customTemplates, saveCustomTemplates],
  );

  /**
   * カスタムテンプレートの更新
   */
  const updateCustomTemplate = useCallback(
    (templateId: string, updatedTemplate: DescriptionTemplate) => {
      const newTemplates = customTemplates.map((t) =>
        t.id === templateId ? updatedTemplate : t,
      );
      saveCustomTemplates(newTemplates);
      toast.success('カスタムテンプレートを更新しました');
    },
    [customTemplates, saveCustomTemplates],
  );

  /**
   * カスタムテンプレートの削除
   */
  const deleteCustomTemplate = useCallback(
    (templateId: string) => {
      const newTemplates = customTemplates.filter((t) => t.id !== templateId);
      saveCustomTemplates(newTemplates);
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId('default');
      }
      toast.success('カスタムテンプレートを削除しました');
    },
    [customTemplates, saveCustomTemplates, selectedTemplateId],
  );

  return {
    presetTemplates: PRESET_TEMPLATES,
    customTemplates,
    allTemplates,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedTemplate,
    showTemplatePreview,
    setShowTemplatePreview,
    applyTemplate,
    addCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
  };
}
