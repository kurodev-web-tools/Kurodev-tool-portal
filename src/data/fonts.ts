/**
 * フォントオプションの型定義
 */
export interface FontOption {
  value: string;
  label: string;
  category: 'japanese' | 'sans-serif' | 'serif' | 'decorative' | 'monospace' | 'system';
}

/**
 * Google Fonts と システムフォントのリスト
 */
export const googleFonts: FontOption[] = [
  // 日本語フォント
  { value: "Noto Sans JP, sans-serif", label: "Noto Sans JP", category: 'japanese' },
  { value: "M PLUS Rounded 1c, sans-serif", label: "M PLUS Rounded 1c", category: 'japanese' },
  { value: "Kosugi Maru, sans-serif", label: "Kosugi Maru", category: 'japanese' },
  { value: "Sawarabi Mincho, serif", label: "Sawarabi Mincho", category: 'japanese' },
  { value: "Noto Serif JP, serif", label: "Noto Serif JP", category: 'japanese' },
  
  // 英語フォント - Sans Serif
  { value: "Roboto, sans-serif", label: "Roboto", category: 'sans-serif' },
  { value: "Open Sans, sans-serif", label: "Open Sans", category: 'sans-serif' },
  { value: "Lato, sans-serif", label: "Lato", category: 'sans-serif' },
  { value: "Montserrat, sans-serif", label: "Montserrat", category: 'sans-serif' },
  { value: "Source Sans 3, sans-serif", label: "Source Sans 3", category: 'sans-serif' },
  { value: "Nunito, sans-serif", label: "Nunito", category: 'sans-serif' },
  { value: "Poppins, sans-serif", label: "Poppins", category: 'sans-serif' },
  { value: "Inter, sans-serif", label: "Inter", category: 'sans-serif' },
  
  // 英語フォント - Serif
  { value: "Playfair Display, serif", label: "Playfair Display", category: 'serif' },
  { value: "Merriweather, serif", label: "Merriweather", category: 'serif' },
  { value: "Lora, serif", label: "Lora", category: 'serif' },
  { value: "Crimson Text, serif", label: "Crimson Text", category: 'serif' },
  
  // 装飾フォント
  { value: "Bebas Neue, sans-serif", label: "Bebas Neue", category: 'decorative' },
  { value: "Oswald, sans-serif", label: "Oswald", category: 'decorative' },
  { value: "Anton, sans-serif", label: "Anton", category: 'decorative' },
  { value: "Dancing Script, cursive", label: "Dancing Script", category: 'decorative' },
  { value: "Pacifico, cursive", label: "Pacifico", category: 'decorative' },
  { value: "Great Vibes, cursive", label: "Great Vibes", category: 'decorative' },
  
  // モノスペースフォント
  { value: "Roboto Mono, monospace", label: "Roboto Mono", category: 'monospace' },
  { value: "Source Code Pro, monospace", label: "Source Code Pro", category: 'monospace' },
  { value: "Fira Code, monospace", label: "Fira Code", category: 'monospace' },
  { value: "JetBrains Mono, monospace", label: "JetBrains Mono", category: 'monospace' },
  
  // システムフォント
  { value: "Arial, sans-serif", label: "Arial (System)", category: 'system' },
  { value: "Helvetica, sans-serif", label: "Helvetica (System)", category: 'system' },
  { value: "Georgia, serif", label: "Georgia (System)", category: 'system' },
  { value: "Times New Roman, serif", label: "Times New Roman (System)", category: 'system' },
];

/**
 * カテゴリ別にフォントを取得
 * 
 * @param category - フォントカテゴリ
 * @returns 指定されたカテゴリのフォント配列
 */
export const getFontsByCategory = (category: FontOption['category']): FontOption[] => {
  return googleFonts.filter(font => font.category === category);
};

/**
 * カテゴリ情報
 */
export const fontCategories = [
  { key: 'japanese' as const, label: '日本語フォント' },
  { key: 'sans-serif' as const, label: '英語フォント - Sans Serif' },
  { key: 'serif' as const, label: '英語フォント - Serif' },
  { key: 'decorative' as const, label: '装飾フォント' },
  { key: 'monospace' as const, label: 'モノスペースフォント' },
  { key: 'system' as const, label: 'システムフォント' },
];

