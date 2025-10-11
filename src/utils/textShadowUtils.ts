/**
 * textShadow パラメータの型定義
 */
export interface ShadowParams {
  x: number;
  y: number;
  blur: number;
  color: string;
  opacity: number;
}

/**
 * CSS textShadow文字列をパラメータに分解
 * 
 * @param shadow - CSS textShadow文字列（例: "2px 2px 4px rgba(0,0,0,0.5)"）
 * @returns パース済みのシャドウパラメータ
 * 
 * @example
 * parseTextShadow("2px 2px 4px rgba(0,0,0,0.5)")
 * // => { x: 2, y: 2, blur: 4, color: '#000000', opacity: 0.5 }
 */
export const parseTextShadow = (shadow: string | undefined): ShadowParams => {
  if (!shadow || shadow === 'none') {
    return { x: 0, y: 0, blur: 0, color: '#000000', opacity: 0.5 };
  }
  
  // rgba形式をパース（例: "2px 2px 4px rgba(0,0,0,0.5)"）
  const match = shadow.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      x: parseInt(match[1]),
      y: parseInt(match[2]),
      blur: parseInt(match[3]),
      color: `#${parseInt(match[4]).toString(16).padStart(2, '0')}${parseInt(match[5]).toString(16).padStart(2, '0')}${parseInt(match[6]).toString(16).padStart(2, '0')}`,
      opacity: match[7] ? parseFloat(match[7]) : 1,
    };
  }
  
  // 簡易形式をパース（例: "2px 2px 4px #000000"）
  const simpleMatch = shadow.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(#[0-9a-fA-F]{6})/);
  if (simpleMatch) {
    return {
      x: parseInt(simpleMatch[1]),
      y: parseInt(simpleMatch[2]),
      blur: parseInt(simpleMatch[3]),
      color: simpleMatch[4],
      opacity: 1,
    };
  }
  
  return { x: 0, y: 0, blur: 0, color: '#000000', opacity: 0.5 };
};

/**
 * パラメータからCSS textShadow文字列を生成
 * 
 * @param x - 水平位置（px）
 * @param y - 垂直位置（px）
 * @param blur - ぼかし距離（px）
 * @param color - 影の色（16進数カラーコード、例: "#000000"）
 * @param opacity - 不透明度（0.0～1.0）
 * @returns CSS textShadow文字列
 * 
 * @example
 * buildTextShadow(2, 2, 4, '#000000', 0.5)
 * // => "2px 2px 4px rgba(0,0,0,0.5)"
 */
export const buildTextShadow = (x: number, y: number, blur: number, color: string, opacity: number): string => {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `${x}px ${y}px ${blur}px rgba(${r},${g},${b},${opacity})`;
};

