/**
 * テンプレート関連の型定義
 * サムネイル自動生成ツールとイベント用素材制作ツールで共有する型定義を提供します。
 */

// オブジェクト配置テンプレートの型定義
export interface ObjectPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  // 追加のカラーバリエーション
  light?: string;
  dark?: string;
  muted?: string;
  highlight?: string;
}

export interface FontSettings {
  family: string;
  size: string;
  weight: 'normal' | 'bold' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  style: 'normal' | 'italic' | 'oblique';
  // 追加のフォント設定
  lineHeight?: number;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textShadow?: string;
}

// グラデーション設定
export interface GradientSettings {
  type: 'linear' | 'radial' | 'conic';
  direction?: string; // linear: 'to right', 'to bottom' etc.
  stops: Array<{
    color: string;
    position: number; // 0-100
  }>;
}

// アニメーション設定
export interface AnimationSettings {
  type: 'none' | 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce';
  duration?: number; // milliseconds
  delay?: number; // milliseconds
  iteration?: 'once' | 'infinite' | number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

// エフェクト設定
export interface EffectSettings {
  shadow?: {
    color: string;
    offsetX: number;
    offsetY: number;
    blur: number;
    spread?: number;
  };
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  sepia?: number;
  invert?: number;
  opacity?: number;
}

export interface ThumbnailTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'gaming' | 'talk' | 'singing' | 'collaboration' | 'event' | 'custom';
  style: 'cute' | 'cool' | 'elegant' | 'funny' | 'simple';
  rating: number;
  preview: string; // プレビュー画像のURL
  supportedAspectRatios: string[];
  
  // オブジェクト配置テンプレート
  layout: {
    background: {
      type: 'color' | 'gradient' | 'image' | 'pattern';
      value: string; // カラーコード、グラデーション設定、または画像URL
      position?: ObjectPosition;
      gradient?: GradientSettings; // グラデーション詳細設定
      pattern?: {
        type: 'dots' | 'lines' | 'grid' | 'waves' | 'geometric';
        color: string;
        size: number;
        opacity: number;
      };
    };
    objects: Array<{
      id: string;
      type: 'text' | 'shape' | 'image' | 'icon' | 'video' | 'gif';
      position: ObjectPosition;
      content?: {
        // テキスト関連
        text?: string;
        fontSize?: string;
        fontFamily?: string;
        color?: string;
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
        borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
        borderRadius?: number;
        padding?: number;
        // 図形関連
        shapeType?: string; // ShapeType (layers.tsから動的にインポートするか、文字列として扱う)
        // メディア関連
        imageSrc?: string;
        iconName?: string;
        videoSrc?: string;
        gifSrc?: string;
        // レイアウト関連
        textAlign?: 'left' | 'center' | 'right' | 'justify';
        verticalAlign?: 'top' | 'middle' | 'bottom';
        overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
        // スタイル関連
        boxShadow?: string;
        filter?: string;
        transform?: string;
      };
      zIndex: number;
      visible: boolean;
      locked?: boolean; // ロック状態
      // アニメーション・エフェクト
      animation?: AnimationSettings;
      effects?: EffectSettings;
      // レスポンシブ設定
      responsive?: {
        mobile?: Partial<ObjectPosition>;
        tablet?: Partial<ObjectPosition>;
        desktop?: Partial<ObjectPosition>;
      };
    }>;
    // レイアウト全体の設定
    grid?: {
      enabled: boolean;
      columns: number;
      rows: number;
      gap: number;
      color: string;
      opacity: number;
    };
    guides?: {
      enabled: boolean;
      color: string;
      opacity: number;
      snapToGrid: boolean;
    };
  };
  
  // カラーパレット
  colorPalette: ColorPalette;
  
  // フォント設定
  fontSettings: FontSettings;
  
  // テンプレート設定
  settings: {
    // デフォルト設定
    defaultFontSize: string;
    defaultFontFamily: string;
    defaultTextColor: string;
    defaultBackgroundColor: string;
    // 制約設定
    maxObjects: number;
    minObjectSize: number;
    maxObjectSize: number;
    // 機能設定
    allowAnimation: boolean;
    allowEffects: boolean;
    allowVideo: boolean;
    allowGif: boolean;
    // エクスポート設定
    exportFormats: Array<'png' | 'jpg' | 'webp' | 'svg' | 'pdf'>;
    defaultExportFormat: 'png' | 'jpg' | 'webp' | 'svg' | 'pdf';
    exportQuality: 'low' | 'medium' | 'high' | 'ultra';
  };
  
  // メタデータ
  metadata: {
    version: string;
    author?: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // minutes
    lastModified: string;
    usage: {
      views: number;
      downloads: number;
      favorites: number;
    };
  };
  
  // レガシーサポート（既存テンプレートとの互換性）
  initialText?: string;
  initialTextColor?: string;
  initialFontSize?: string;
  initialImageSrc?: string;
  initialBackgroundImagePosition?: ObjectPosition;
  initialCharacterImagePosition?: ObjectPosition;
  initialTextPosition?: ObjectPosition;
  
  isCustom?: boolean;
  createdAt?: string;
}

/**
 * サポートされているアスペクト比
 */
export const aspectRatios = ['1:1', '4:3', '9:16', '16:9'] as const;

export type AspectRatio = typeof aspectRatios[number];
