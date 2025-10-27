// カテゴリごとの色定義
export const categoryColors: Record<string, string> = {
  // デフォルトカテゴリ
  '雑談': '#3B82F6',      // 青
  'ゲーム': '#10B981',      // 緑
  '歌枠': '#EC4899',        // ピンク
  'コラボ': '#F59E0B',      // オレンジ
  'ASMR': '#8B5CF6',        // 紫
  'その他': '#20B2AA',      // シアン（テーマカラー）
  
  // 日本語カテゴリ（小文字対応）
  '雑談配信': '#3B82F6',
  'ゲーム配信': '#10B981',
  '歌枠配信': '#EC4899',
  'コラボ配信': '#F59E0B',
  'ASMR配信': '#8B5CF6',
  
  // 英語カテゴリ
  'talk': '#3B82F6',
  'gaming': '#10B981',
  'singing': '#EC4899',
  'collaboration': '#F59E0B',
  'asmr': '#8B5CF6',
  'other': '#20B2AA',
};

// カテゴリの色を取得する関数
export function getCategoryColor(category?: string): string {
  if (!category) return '#20B2AA'; // デフォルト（テーマカラー）
  
  // 完全一致で検索
  if (categoryColors[category]) {
    return categoryColors[category];
  }
  
  // 大文字小文字を無視して検索
  const normalized = category.toLowerCase();
  if (categoryColors[normalized]) {
    return categoryColors[normalized];
  }
  
  // 部分一致で検索
  for (const [key, value] of Object.entries(categoryColors)) {
    if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // デフォルト
  return '#20B2AA';
}

// 色の明るさを調整する関数（背景色用）
export function getCategoryBackgroundColor(category?: string, opacity: number = 0.15): string {
  const color = getCategoryColor(category);
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// 境界線の色を取得する関数
export function getCategoryBorderColor(category?: string, opacity: number = 0.5): string {
  const color = getCategoryColor(category);
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
