/**
 * アスペクト比関連のユーティリティ関数
 */

/**
 * 幅と高さからアスペクト比を計算
 * @param width 幅
 * @param height 高さ
 * @returns アスペクト比（例: '16:9', '4:3', '1:1'）
 */
export const calculateAspectRatio = (width: number, height: number): string => {
  if (width === 0 || height === 0) {
    return '1:1';
  }

  // 最大公約数を求める
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const divisor = gcd(width, height);
  const ratioWidth = width / divisor;
  const ratioHeight = height / divisor;

  // 一般的なアスペクト比に丸める
  const commonRatios: { [key: string]: string } = {
    '16:9': '16:9',
    '9:16': '9:16',
    '4:3': '4:3',
    '3:4': '3:4',
    '1:1': '1:1',
    '21:9': '21:9',
    '2:3': '2:3',
    '3:2': '3:2',
  };

  const calculatedRatio = `${ratioWidth}:${ratioHeight}`;
  
  // 一般的な比率と比較（誤差10%以内）
  const targetRatio = width / height;
  for (const [key, value] of Object.entries(commonRatios)) {
    const [w, h] = key.split(':').map(Number);
    const commonRatio = w / h;
    if (Math.abs(targetRatio - commonRatio) / commonRatio < 0.1) {
      return value;
    }
  }

  return calculatedRatio;
};

/**
 * アスペクト比文字列を解析
 * @param ratio アスペクト比（例: '16:9'）
 * @returns { width, height } オブジェクト
 */
export const parseAspectRatio = (ratio: string): { width: number; height: number } => {
  const parts = ratio.split(':').map(Number);
  
  if (parts.length !== 2 || parts.some(isNaN)) {
    return { width: 16, height: 9 }; // デフォルト
  }

  return {
    width: parts[0],
    height: parts[1],
  };
};

/**
 * アスペクト比の日本語ラベルを取得
 * @param ratio アスペクト比（例: '16:9'）
 * @returns 日本語ラベル（例: '横長（16:9）'）
 */
export const getAspectRatioLabel = (ratio: string): string => {
  const labels: { [key: string]: string } = {
    '16:9': '横長（16:9）',
    '9:16': '縦長（9:16）',
    '4:3': '横長（4:3）',
    '3:4': '縦長（3:4）',
    '1:1': '正方形（1:1）',
    '21:9': 'ウルトラワイド（21:9）',
    '2:3': '縦長（2:3）',
    '3:2': '横長（3:2）',
    'custom': 'カスタム',
  };

  return labels[ratio] || `カスタム（${ratio}）`;
};

/**
 * アスペクト比に基づいて画像サイズを計算
 * @param ratio アスペクト比（例: '16:9'）
 * @param targetWidth 目標幅（指定した場合、幅を基準に高さを計算）
 * @param targetHeight 目標高さ（指定した場合、高さを基準に幅を計算）
 * @returns { width, height } オブジェクト
 */
export const calculateDimensionsFromRatio = (
  ratio: string,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } => {
  const { width: ratioWidth, height: ratioHeight } = parseAspectRatio(ratio);

  if (targetWidth) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth * (ratioHeight / ratioWidth)),
    };
  }

  if (targetHeight) {
    return {
      width: Math.round(targetHeight * (ratioWidth / ratioHeight)),
      height: targetHeight,
    };
  }

  // どちらも指定されていない場合はデフォルト値
  return {
    width: 1920,
    height: 1080,
  };
};

/**
 * アスペクト比を維持しながら、最大サイズに収める
 * @param originalWidth 元の幅
 * @param originalHeight 元の高さ
 * @param maxWidth 最大幅
 * @param maxHeight 最大高さ
 * @returns リサイズ後の { width, height } オブジェクト
 */
export const fitToMaxDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // 最大幅を超える場合
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // 最大高さを超える場合
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
};

/**
 * アスペクト比が一致するか判定
 * @param ratio1 アスペクト比1
 * @param ratio2 アスペクト比2
 * @param tolerance 許容誤差（デフォルト: 0.01）
 * @returns 一致する場合 true
 */
export const isAspectRatioMatch = (
  ratio1: string,
  ratio2: string,
  tolerance: number = 0.01
): boolean => {
  const { width: w1, height: h1 } = parseAspectRatio(ratio1);
  const { width: w2, height: h2 } = parseAspectRatio(ratio2);

  const r1 = w1 / h1;
  const r2 = w2 / h2;

  return Math.abs(r1 - r2) <= tolerance;
};

/**
 * 一般的なアスペクト比のリストを取得
 * @returns アスペクト比の配列
 */
export const getCommonAspectRatios = (): Array<{ value: string; label: string }> => {
  return [
    { value: '16:9', label: '横長（16:9）' },
    { value: '9:16', label: '縦長（9:16）' },
    { value: '4:3', label: '横長（4:3）' },
    { value: '3:4', label: '縦長（3:4）' },
    { value: '1:1', label: '正方形（1:1）' },
    { value: '21:9', label: 'ウルトラワイド（21:9）' },
    { value: '2:3', label: '縦長（2:3）' },
    { value: '3:2', label: '横長（3:2）' },
    { value: 'custom', label: 'カスタム' },
  ];
};

