/**
 * ツールデータの共通定義
 * ポータルページとツール一覧ページで共有
 */

import { getCategoryColor } from '@/config/theme';

export type ToolStatus = 'released' | 'beta' | 'development';

export type ToolCategory = 'planning' | 'production' | 'branding' | 'collaboration' | 'analytics';

export interface Tool {
  id: string;
  title: string;
  description: string;
  status: ToolStatus;
  href: string;
  iconName: string;
  color: string; // カテゴリから自動生成される（後方互換性のため保持）
  category: ToolCategory;
  tags: string[];
  usageCount: number;
  rating: number;
  feedbackMessage?: string;
  stats?: string;
}

/**
 * ツールのカラーを取得するヘルパー関数
 */
export function getToolColor(tool: Tool): string {
  return getCategoryColor(tool.category);
}

// ツールデータを作成（colorはcategoryから自動生成）
const createTool = (tool: Omit<Tool, 'color'>): Tool => ({
  ...tool,
  color: getCategoryColor(tool.category),
});

export const tools: Tool[] = [
  createTool({
    id: "tool-1",
    title: "スケジュールカレンダー",
    description: "配信・ライブのスケジュールを管理するツール。",
    status: "beta",
    href: "/tools/schedule-calendar",
    feedbackMessage: "フィードバックお待ちしております！",
    iconName: "calendar",
    stats: "利用可能",
    category: "planning",
    tags: ["スケジュール", "管理", "配信"],
    usageCount: 150,
    rating: 4.2
  }),
  createTool({
    id: "tool-2",
    title: "企画・台本サポートAI",
    description: "コンテンツの企画や台本作成をAIがサポート。",
    status: "beta",
    href: "/tools/script-generator",
    feedbackMessage: "フィードバックお待ちしております！",
    iconName: "brain",
    stats: "利用可能",
    category: "planning",
    tags: ["AI", "台本", "企画"],
    usageCount: 89,
    rating: 4.5
  }),
  createTool({
    id: "tool-3",
    title: "サムネイル自動生成ツール",
    description: "動画・コンテンツのサムネイルをAIが自動生成。",
    status: "beta",
    href: "/tools/thumbnail-generator",
    feedbackMessage: "フィードバックお待ちしております！",
    iconName: "image",
    stats: "利用可能",
    category: "production",
    tags: ["AI", "サムネイル", "画像生成"],
    usageCount: 320,
    rating: 4.7
  }),
  createTool({
    id: "tool-4",
    title: "コンセプト・ブランディング提案",
    description: "AIがあなたのブランドコンセプトを提案します。",
    status: "development",
    href: "/tools/branding-generator",
    iconName: "sparkles",
    stats: "開発中",
    category: "branding",
    tags: ["AI", "ブランディング", "コンセプト"],
    usageCount: 45,
    rating: 4.0
  }),
  createTool({
    id: "tool-5",
    title: "動画タイトル・概要欄自動生成AI",
    description: "AIが動画・コンテンツのタイトルと概要欄を自動生成。",
    status: "development",
    href: "/tools/title-generator",
    iconName: "trending-up",
    stats: "開発中",
    category: "production",
    tags: ["AI", "タイトル", "SEO"],
    usageCount: 67,
    rating: 4.3
  }),
  createTool({
    id: "tool-6",
    title: "配信スケジュール自動調整",
    description: "コラボ相手との配信スケジュールを自動調整。",
    status: "development",
    href: "/tools/schedule-adjuster",
    iconName: "calendar",
    stats: "開発中",
    category: "collaboration",
    tags: ["スケジュール", "コラボ", "自動調整"],
    usageCount: 23,
    rating: 3.8
  }),
  createTool({
    id: "tool-7",
    title: "イベント用素材制作",
    description: "Canvaのようにイベント用の素材を制作。",
    status: "development",
    href: "/tools/asset-creator",
    iconName: "image",
    stats: "開発中",
    category: "production",
    tags: ["素材", "デザイン", "イベント"],
    usageCount: 78,
    rating: 4.1
  }),
  createTool({
    id: "tool-8",
    title: "バーチャル背景自動生成AI",
    description: "AIが配信用のバーチャル背景を自動生成。",
    status: "development",
    href: "/tools/virtual-bg-generator",
    iconName: "image",
    stats: "開発中",
    category: "production",
    tags: ["AI", "背景", "配信"],
    usageCount: 112,
    rating: 4.4
  }),
];

/**
 * ステータスに応じた表示用ラベルを取得
 */
export function getStatusLabel(status: ToolStatus): string {
  switch (status) {
    case 'released':
      return '利用可能';
    case 'beta':
      return 'ベータ版';
    case 'development':
      return '開発中';
    default:
      return '不明';
  }
}

/**
 * カテゴリに応じた表示用ラベルを取得
 */
export function getCategoryLabel(category: ToolCategory): string {
  switch (category) {
    case 'planning':
      return '企画・準備';
    case 'production':
      return '制作・配信';
    case 'branding':
      return 'ブランディング';
    case 'collaboration':
      return 'コラボレーション';
    case 'analytics':
      return 'データ分析';
    default:
      return 'その他';
  }
}

