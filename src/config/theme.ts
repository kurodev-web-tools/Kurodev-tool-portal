/**
 * アプリケーション全体のテーマ設定
 * カラーコード、グラデーション、スタイルなどを一元管理
 */

import { ToolCategory } from '@/data/tools';

/**
 * ツールカテゴリ別のカラーテーマ
 */
export const toolColors = {
  planning: "from-[#20B2AA] to-[#1a9b94]",
  production: "from-green-500 to-emerald-500",
  branding: "from-orange-500 to-red-500",
  collaboration: "from-purple-500 to-pink-500",
  analytics: "from-[#20B2AA] to-[#1a9b94]",
} as const satisfies Record<ToolCategory, string>;

/**
 * スイート（ツールグループ）別のカラーテーマ
 */
export const suiteColors = {
  planning: "from-[#20B2AA] to-[#1a9b94]",
  publishing: "from-[#20B2AA] to-[#1a9b94]",
  streaming: "from-green-500 to-emerald-500",
  analysis: "from-indigo-500 to-purple-500",
} as const;

/**
 * ステータス別のカラーテーマ
 */
export const statusColors = {
  released: "bg-green-500/20 text-green-400 border-green-500/30",
  beta: "bg-[#20B2AA]/20 text-[#20B2AA] border-[#20B2AA]/30",
  development: "bg-orange-500/20 text-orange-400 border-orange-500/30",
} as const;

/**
 * 統計カード用のグラデーション
 */
export const statsGradients = {
  tools: "from-[#20B2AA] to-[#1a9b94]",
  suites: "from-purple-600 to-pink-600",
  users: "from-green-600 to-emerald-600",
  usage: "from-orange-600 to-red-600",
} as const;

/**
 * 共通のグラデーションスタイル
 */
export const commonGradients = {
  primary: "from-[#20B2AA] to-[#1a9b94]",
  secondary: "from-purple-600 to-pink-600",
  success: "from-green-600 to-emerald-600",
  warning: "from-orange-600 to-red-600",
  info: "from-[#20B2AA] to-[#1a9b94]",
} as const;

/**
 * アイコン別のカラーテーマ
 * ツールアイコンの色を統一
 */
export const iconColors = {
  calendar: "text-[#20B2AA]",
  brain: "text-purple-500",
  image: "text-green-500",
  sparkles: "text-orange-500",
  trendingUp: "text-indigo-500",
  users: "text-pink-500",
  settings: "text-gray-500",
} as const;

/**
 * カテゴリ名からカラーテーマを取得するヘルパー関数
 */
export function getCategoryColor(category: ToolCategory): string {
  return toolColors[category];
}

/**
 * ステータス名からカラースタイルを取得するヘルパー関数
 */
export function getStatusColor(status: 'released' | 'beta' | 'development'): string {
  return statusColors[status];
}

/**
 * 型安全なテーマの使用例
 * 
 * @example
 * import { toolColors, getCategoryColor } from '@/config/theme';
 * 
 * // 直接使用
 * <div className={`bg-gradient-to-r ${toolColors.planning}`}>
 * 
 * // ヘルパー関数経由
 * const color = getCategoryColor('planning');
 */


