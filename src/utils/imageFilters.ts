/**
 * 画像フィルター関連のユーティリティ
 */

export interface ImageFilters {
  brightness?: number;      // 0-200 (100 = 元のまま)
  contrast?: number;         // 0-200 (100 = 元のまま)
  saturate?: number;         // 0-200 (100 = 元のまま)
  hueRotate?: number;        // 0-360 (deg)
  sepia?: number;            // 0-100 (%)
  grayscale?: number;        // 0-100 (%)
  blur?: number;             // 0-10 (px) - 背景ぼかし用に軽め
  enabled?: boolean;          // フィルター適用ON/OFF
  preset?: string;           // 適用中のプリセット名（参考用）
}

/**
 * CSS filter文字列を生成
 */
export function buildFilterString(filters: ImageFilters | undefined | null): string {
  if (!filters || !filters.enabled) return 'none';
  
  const parts: string[] = [];
  
  if (filters.brightness !== undefined) {
    parts.push(`brightness(${filters.brightness}%)`);
  }
  if (filters.contrast !== undefined) {
    parts.push(`contrast(${filters.contrast}%)`);
  }
  if (filters.saturate !== undefined) {
    parts.push(`saturate(${filters.saturate}%)`);
  }
  if (filters.hueRotate !== undefined) {
    parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  }
  if (filters.sepia !== undefined && filters.sepia > 0) {
    parts.push(`sepia(${filters.sepia}%)`);
  }
  if (filters.grayscale !== undefined && filters.grayscale > 0) {
    parts.push(`grayscale(${filters.grayscale}%)`);
  }
  if (filters.blur !== undefined && filters.blur > 0) {
    parts.push(`blur(${filters.blur}px)`);
  }
  
  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * プリセット定義
 */
export const FILTER_PRESETS: Record<string, ImageFilters> = {
  'none': {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hueRotate: 0,
    sepia: 0,
    grayscale: 0,
    blur: 0,
    enabled: false,
    preset: 'none',
  },
  'soft': {
    brightness: 110,
    contrast: 90,
    saturate: 105,
    hueRotate: 0,
    sepia: 0,
    grayscale: 0,
    blur: 1,
    enabled: true,
    preset: 'soft',
  },
  'cool': {
    brightness: 100,
    contrast: 115,
    saturate: 110,
    hueRotate: 180,
    sepia: 0,
    grayscale: 0,
    blur: 0,
    enabled: true,
    preset: 'cool',
  },
  'pop': {
    brightness: 105,
    contrast: 120,
    saturate: 130,
    hueRotate: 0,
    sepia: 0,
    grayscale: 0,
    blur: 0,
    enabled: true,
    preset: 'pop',
  },
  'monochrome': {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hueRotate: 0,
    sepia: 0,
    grayscale: 100,
    blur: 0,
    enabled: true,
    preset: 'monochrome',
  },
  'sepia': {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hueRotate: 0,
    sepia: 100,
    grayscale: 0,
    blur: 0,
    enabled: true,
    preset: 'sepia',
  },
};

/**
 * プリセットを適用（デフォルト値とのマージ）
 */
export function applyPreset(presetName: string): ImageFilters {
  const preset = FILTER_PRESETS[presetName];
  if (!preset) return FILTER_PRESETS.none;
  
  return {
    ...FILTER_PRESETS.none,
    ...preset,
  };
}
