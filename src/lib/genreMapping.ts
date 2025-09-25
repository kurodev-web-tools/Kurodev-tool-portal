// ジャンル名のマッピング辞書
export const genreDisplayNames: Record<string, string> = {
  // 既存のジャンル
  simple: 'シンプル',
  cute: 'かわいい',
  cool: 'クール',
  stylish: 'スタイリッシュ',
  
  // 将来追加予定のジャンル
  elegant: 'エレガント',
  modern: 'モダン',
  vintage: 'ヴィンテージ',
  minimal: 'ミニマル',
  colorful: 'カラフル',
  dark: 'ダーク',
  bright: 'ブライト',
  nature: 'ナチュラル',
  urban: 'アーバン',
  fantasy: 'ファンタジー',
  retro: 'レトロ',
  futuristic: 'フューチャー',
  romantic: 'ロマンチック',
  energetic: 'エネルギッシュ',
  calm: 'カーム',
  professional: 'プロフェッショナル',
  casual: 'カジュアル',
  formal: 'フォーマル',
  playful: 'プレイフル',
  serious: 'シリアス',
  artistic: 'アーティスティック',
  tech: 'テック',
  gaming: 'ゲーミング',
  music: 'ミュージック',
  food: 'フード',
  travel: 'トラベル',
  fashion: 'ファッション',
  beauty: 'ビューティー',
  lifestyle: 'ライフスタイル',
  business: 'ビジネス',
  education: 'エデュケーション',
  health: 'ヘルス',
  sports: 'スポーツ',
  entertainment: 'エンターテイメント',
  news: 'ニュース',
  technology: 'テクノロジー',
  science: 'サイエンス',
  culture: 'カルチャー',
  social: 'ソーシャル',
  personal: 'パーソナル',
  creative: 'クリエイティブ',
  innovative: 'イノベーティブ',
  traditional: 'トラディショナル',
  contemporary: 'コンテンポラリー',
  experimental: 'エクスペリメンタル',
  classic: 'クラシック',
  trendy: 'トレンディ',
  unique: 'ユニーク',
  premium: 'プレミアム',
  affordable: 'アフォーダブル',
  luxury: 'ラグジュアリー',
  eco: 'エコ',
  sustainable: 'サステナブル',
  organic: 'オーガニック',
  digital: 'デジタル',
  analog: 'アナログ',
  hybrid: 'ハイブリッド',
  pure: 'ピュア',
  mixed: 'ミックス',
  solid: 'ソリッド',
  gradient: 'グラデーション',
  pattern: 'パターン',
  texture: 'テクスチャー',
  geometric: 'ジオメトリック',
  abstract: 'アブストラクト',
  realistic: 'リアリスティック',
  cartoon: 'カートゥーン',
  anime: 'アニメ',
  manga: 'マンガ',
  illustration: 'イラストレーション',
  photography: 'フォトグラフィー',
  design: 'デザイン',
  art: 'アート',
  craft: 'クラフト',
  handmade: 'ハンドメイド',
  industrial: 'インダストリアル',
  rustic: 'ラスティック',
  cozy: 'コージー',
  spacious: 'スペーシャス',
  compact: 'コンパクト',
  large: 'ラージ',
  small: 'スモール',
  medium: 'ミディアム',
  extra: 'エクストラ',
  mega: 'メガ',
  micro: 'マイクロ',
  macro: 'マクロ',
  nano: 'ナノ',
  pico: 'ピコ',
  giga: 'ギガ',
  kilo: 'キロ',
  milli: 'ミリ',
  centi: 'センチ',
  deci: 'デシ',
  deca: 'デカ',
  hecto: 'ヘクト',
  peta: 'ペタ',
  exa: 'エクサ',
  zetta: 'ゼタ',
  yotta: 'ヨタ',
  ronna: 'ロナ',
  quetta: 'クエタ',
  femto: 'フェムト',
  atto: 'アト',
  zepto: 'ゼプト',
  yocto: 'ヨクト',
  ronto: 'ロント',
  quecto: 'クエクト',
};

/**
 * ジャンル名から表示名を取得する
 * @param genre ジャンル名（フォルダ名）
 * @returns 表示名（日本語）
 */
export const getGenreDisplayName = (genre: string): string => {
  return genreDisplayNames[genre] || genre;
};

/**
 * 利用可能なジャンルの表示名マッピングを生成する
 * @param genres 利用可能なジャンル配列
 * @returns ジャンル→表示名のマッピングオブジェクト
 */
export const createGenreDisplayMapping = (genres: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  genres.forEach(genre => {
    mapping[genre] = getGenreDisplayName(genre);
  });
  return mapping;
};