/**
 * カラー関連のユーティリティ関数
 */

/**
 * HEXカラーをRGBAに変換
 * @param hex HEXカラー（例: '#FF5733' または 'FF5733'）
 * @param alpha アルファ値（0-1）
 * @returns RGBA文字列（例: 'rgba(255, 87, 51, 0.8)'）
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  // '#'を除去
  const cleanHex = hex.replace('#', '');

  // 3桁の場合は6桁に展開
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex;

  // RGB値を抽出
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // NaNチェック
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  // アルファ値を0-1の範囲に制限
  const clampedAlpha = Math.max(0, Math.min(1, alpha));

  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
};

/**
 * RGBAカラーをHEXに変換
 * @param rgba RGBA文字列（例: 'rgba(255, 87, 51, 0.8)' または 'rgb(255, 87, 51)'）
 * @returns HEXカラー（例: '#FF5733'）とアルファ値のオブジェクト
 */
export const rgbaToHex = (rgba: string): { hex: string; alpha: number } => {
  // rgb/rgba から数値を抽出
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

  if (!match) {
    return { hex: '#000000', alpha: 1 };
  }

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const alpha = match[4] ? parseFloat(match[4]) : 1;

  // 各値を16進数に変換
  const toHex = (value: number): string => {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return {
    hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase(),
    alpha,
  };
};

/**
 * 背景色に対して適切なコントラスト色（黒 or 白）を返す
 * @param bgColor 背景色（HEXまたはRGBA）
 * @returns コントラスト色（'#FFFFFF' または '#000000'）
 */
export const getContrastColor = (bgColor: string): string => {
  let r: number, g: number, b: number;

  // HEXの場合
  if (bgColor.startsWith('#')) {
    const hex = bgColor.replace('#', '');
    const fullHex =
      hex.length === 3
        ? hex
            .split('')
            .map((char) => char + char)
            .join('')
        : hex;

    r = parseInt(fullHex.substring(0, 2), 16);
    g = parseInt(fullHex.substring(2, 4), 16);
    b = parseInt(fullHex.substring(4, 6), 16);
  }
  // RGBまたはRGBAの場合
  else {
    const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) {
      return '#FFFFFF'; // デフォルト
    }
    r = parseInt(match[1]);
    g = parseInt(match[2]);
    b = parseInt(match[3]);
  }

  // 相対輝度を計算（WCAG 2.0）
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // 輝度が0.5以上なら黒、それ以下なら白
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * HEXカラーの妥当性をチェック
 * @param hex HEXカラー文字列
 * @returns 妥当な場合 true
 */
export const isValidHex = (hex: string): boolean => {
  const cleanHex = hex.replace('#', '');
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
};

/**
 * カラーコードを正規化（HEXに統一）
 * @param color カラーコード（HEX, RGB, RGBA, named color）
 * @returns 正規化されたHEX
 */
export const normalizeColor = (color: string): string => {
  // すでにHEXの場合
  if (color.startsWith('#') && isValidHex(color)) {
    return color.toUpperCase();
  }

  // RGB/RGBAの場合
  if (color.startsWith('rgb')) {
    const { hex } = rgbaToHex(color);
    return hex;
  }

  // CSS color namesの変換（一般的なもののみ）
  const namedColors: { [key: string]: string } = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    gray: '#808080',
    silver: '#C0C0C0',
    maroon: '#800000',
    olive: '#808000',
    lime: '#00FF00',
    aqua: '#00FFFF',
    teal: '#008080',
    navy: '#000080',
    fuchsia: '#FF00FF',
    purple: '#800080',
    orange: '#FFA500',
    transparent: '#00000000',
  };

  const lowerColor = color.toLowerCase();
  if (namedColors[lowerColor]) {
    return namedColors[lowerColor];
  }

  // デフォルト
  return '#000000';
};

/**
 * カラーを明るく/暗くする
 * @param hex HEXカラー
 * @param percent 変更率（-100 から 100。正の値で明るく、負の値で暗く）
 * @returns 調整されたHEXカラー
 */
export const adjustBrightness = (hex: string, percent: number): string => {
  const cleanHex = hex.replace('#', '');
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex;

  let r = parseInt(fullHex.substring(0, 2), 16);
  let g = parseInt(fullHex.substring(2, 4), 16);
  let b = parseInt(fullHex.substring(4, 6), 16);

  const adjust = (value: number) => {
    const adjusted = value + (value * percent) / 100;
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };

  r = adjust(r);
  g = adjust(g);
  b = adjust(b);

  const toHex = (value: number): string => {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

/**
 * 2つのカラーをブレンド
 * @param color1 カラー1（HEX）
 * @param color2 カラー2（HEX）
 * @param ratio ブレンド比率（0-1、0=color1のみ、1=color2のみ）
 * @returns ブレンドされたHEXカラー
 */
export const blendColors = (color1: string, color2: string, ratio: number = 0.5): string => {
  const cleanHex1 = color1.replace('#', '');
  const cleanHex2 = color2.replace('#', '');

  const fullHex1 =
    cleanHex1.length === 3
      ? cleanHex1
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex1;
  const fullHex2 =
    cleanHex2.length === 3
      ? cleanHex2
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex2;

  const r1 = parseInt(fullHex1.substring(0, 2), 16);
  const g1 = parseInt(fullHex1.substring(2, 4), 16);
  const b1 = parseInt(fullHex1.substring(4, 6), 16);

  const r2 = parseInt(fullHex2.substring(0, 2), 16);
  const g2 = parseInt(fullHex2.substring(2, 4), 16);
  const b2 = parseInt(fullHex2.substring(4, 6), 16);

  const clampedRatio = Math.max(0, Math.min(1, ratio));

  const r = Math.round(r1 + (r2 - r1) * clampedRatio);
  const g = Math.round(g1 + (g2 - g1) * clampedRatio);
  const b = Math.round(b1 + (b2 - b1) * clampedRatio);

  const toHex = (value: number): string => {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

/**
 * カラーパレット（類似色）を生成
 * @param baseHex 基準カラー（HEX）
 * @param count 生成する色数
 * @returns HEXカラーの配列
 */
export const generateColorPalette = (baseHex: string, count: number = 5): string[] => {
  const palette: string[] = [baseHex];
  const step = 20;

  for (let i = 1; i < count; i++) {
    const brightness = i % 2 === 0 ? -step * Math.floor(i / 2) : step * Math.ceil(i / 2);
    palette.push(adjustBrightness(baseHex, brightness));
  }

  return palette;
};

