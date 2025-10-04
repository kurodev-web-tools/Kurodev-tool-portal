import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Star, Upload, Save, X, Grid3X3, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generatePreviewFromTemplate, fileToDataURL } from '@/utils/imageUtils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTemplate } from '../contexts/TemplateContext';
import { TemplateManager } from './TemplateManager';
import { AutoGenerationPanel } from './AutoGenerationPanel';

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
        shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'polygon' | 'heart' | 'diamond';
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

const aspectRatios = ['1:1', '4:3', '9:16', '16:9'];

// テンプレートの定義
export const templates: ThumbnailTemplate[] = [
  {
    id: 'template-1',
    name: 'シンプル',
    description: 'シンプルで使いやすいデザイン',
    category: 'talk',
    style: 'simple',
    rating: 4.5,
    preview: '/templates/thumbnail-generator/previews/talk_simple_template-1_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'color',
        value: '#f8f9fa',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 50, y: 280, width: 600, height: 150 },
          content: {
            text: 'VTuber配信タイトル',
            fontSize: '4rem',
            fontFamily: 'Arial, sans-serif',
            color: '#333333',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 650, y: 100, width: 500, height: 500 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#333333',
      secondary: '#666666',
      accent: '#007bff',
      background: '#f8f9fa',
      text: '#333333',
      light: '#f8f9fa',
      dark: '#333333',
      muted: '#6c757d',
      highlight: '#007bff',
    },
    fontSettings: {
      family: 'Georgia, serif',
      size: '4rem',
      weight: 'normal',
      style: 'normal',
      lineHeight: 1.2,
      letterSpacing: '0.05em',
      textAlign: 'center',
      textDecoration: 'none',
      textShadow: 'none',
    },
    settings: {
      defaultFontSize: '4rem',
      defaultFontFamily: 'Georgia, serif',
      defaultTextColor: '#333333',
      defaultBackgroundColor: '#f8f9fa',
      maxObjects: 10,
      minObjectSize: 20,
      maxObjectSize: 800,
      allowAnimation: false,
      allowEffects: true,
      allowVideo: false,
      allowGif: false,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['simple', 'talk', 'basic'],
      difficulty: 'beginner',
      estimatedTime: 5,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: 'VTuber配信タイトル',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialCharacterImagePosition: { x: 650, y: 100, width: 500, height: 500 },
    initialTextPosition: { x: 50, y: 280, width: 600, height: 150 },
  },
  {
    id: 'template-2',
    name: 'スタイリッシュ',
    description: 'モダンでスタイリッシュなデザイン',
    category: 'gaming',
    style: 'cool',
    rating: 4.8,
    preview: '/templates/thumbnail-generator/previews/gaming_cool_template-2_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 600, y: 250, width: 550, height: 200 },
          content: {
            text: '今日の配信！',
            fontSize: '5rem',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 100, y: 150, width: 450, height: 450 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      accent: '#667eea',
      background: '#667eea',
      text: '#FFFFFF',
      light: '#E0E0E0',
      dark: '#667eea',
      muted: '#BDC3C7',
      highlight: '#764ba2',
    },
    fontSettings: {
      family: 'Arial, sans-serif',
      size: '5rem',
      weight: 'bold',
      style: 'normal',
      lineHeight: 1.1,
      letterSpacing: '0.1em',
      textAlign: 'center',
      textDecoration: 'none',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    settings: {
      defaultFontSize: '5rem',
      defaultFontFamily: 'Arial, sans-serif',
      defaultTextColor: '#FFFFFF',
      defaultBackgroundColor: '#667eea',
      maxObjects: 8,
      minObjectSize: 30,
      maxObjectSize: 600,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: false,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['stylish', 'gaming', 'modern'],
      difficulty: 'intermediate',
      estimatedTime: 8,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: '今日の配信！',
    initialTextColor: '#FFFFFF',
    initialFontSize: '5rem',
    initialCharacterImagePosition: { x: 100, y: 150, width: 450, height: 450 },
    initialTextPosition: { x: 600, y: 250, width: 550, height: 200 },
  },
  {
    id: 'template-3',
    name: 'かわいい',
    description: '可愛らしいデザイン',
    category: 'singing',
    style: 'cute',
    rating: 4.7,
    preview: '/templates/thumbnail-generator/previews/singing_cute_template-3_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 50, y: 450, width: 400, height: 150 },
          content: {
            text: 'みてね！',
            fontSize: '4.5rem',
            fontFamily: 'Arial, sans-serif',
            color: '#FF69B4',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 350, y: 100, width: 400, height: 400 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#FF69B4',
      secondary: '#ff9a9e',
      accent: '#fecfef',
      background: '#ff9a9e',
      text: '#FF69B4',
      light: '#fecfef',
      dark: '#FF69B4',
      muted: '#ffb3ba',
      highlight: '#ff6b9d',
    },
    fontSettings: {
      family: 'Arial, sans-serif',
      size: '4.5rem',
      weight: 'normal',
      style: 'normal',
      lineHeight: 1.3,
      letterSpacing: '0.02em',
      textAlign: 'center',
      textDecoration: 'none',
      textShadow: '1px 1px 2px rgba(255,255,255,0.5)',
    },
    settings: {
      defaultFontSize: '4.5rem',
      defaultFontFamily: 'Arial, sans-serif',
      defaultTextColor: '#FF69B4',
      defaultBackgroundColor: '#ff9a9e',
      maxObjects: 6,
      minObjectSize: 25,
      maxObjectSize: 500,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: true,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['cute', 'singing', 'pink'],
      difficulty: 'beginner',
      estimatedTime: 6,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: 'みてね！',
    initialTextColor: '#FF69B4',
    initialFontSize: '4.5rem',
    initialCharacterImagePosition: { x: 350, y: 100, width: 400, height: 400 },
    initialTextPosition: { x: 50, y: 450, width: 400, height: 150 },
  },
  {
    id: 'template-4',
    name: 'クール',
    description: 'クールで格好いいデザイン',
    category: 'event',
    style: 'cool',
    rating: 4.6,
    preview: '/templates/thumbnail-generator/previews/event_cool_template-4_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 650, y: 280, width: 500, height: 150 },
          content: {
            text: '緊急告知',
            fontSize: '6rem',
            fontFamily: 'Arial, sans-serif',
            color: '#E0E0E0',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 100, y: 100, width: 500, height: 500 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#E0E0E0',
      secondary: '#BDC3C7',
      accent: '#3498DB',
      background: '#2c3e50',
      text: '#E0E0E0',
      light: '#BDC3C7',
      dark: '#2c3e50',
      muted: '#7f8c8d',
      highlight: '#3498DB',
    },
    fontSettings: {
      family: 'Arial, sans-serif',
      size: '6rem',
      weight: 'bold',
      style: 'normal',
      lineHeight: 1.0,
      letterSpacing: '0.15em',
      textAlign: 'center',
      textDecoration: 'none',
      textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
    },
    settings: {
      defaultFontSize: '6rem',
      defaultFontFamily: 'Arial, sans-serif',
      defaultTextColor: '#E0E0E0',
      defaultBackgroundColor: '#2c3e50',
      maxObjects: 5,
      minObjectSize: 40,
      maxObjectSize: 700,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: false,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'ultra',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['cool', 'event', 'dark'],
      difficulty: 'advanced',
      estimatedTime: 10,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: '緊急告知',
    initialTextColor: '#E0E0E0',
    initialFontSize: '6rem',
    initialCharacterImagePosition: { x: 100, y: 100, width: 500, height: 500 },
    initialTextPosition: { x: 650, y: 280, width: 500, height: 150 },
  },
  {
    id: 'template-5',
    name: 'まっさら',
    description: '白紙から始められるテンプレート',
    category: 'custom',
    style: 'simple',
    rating: 4.0,
    preview: '/templates/thumbnail-generator/previews/custom_simple_template-5_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
    layout: {
      background: {
        type: 'color',
        value: '#FFFFFF',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 340, y: 285, width: 600, height: 150 },
          content: {
            text: 'テキストを入力',
            fontSize: '4rem',
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#007bff',
      background: '#FFFFFF',
      text: '#000000',
      light: '#FFFFFF',
      dark: '#000000',
      muted: '#6c757d',
      highlight: '#007bff',
    },
    fontSettings: {
      family: 'Arial, sans-serif',
      size: '4rem',
      weight: 'normal',
      style: 'normal',
      lineHeight: 1.2,
      letterSpacing: '0.05em',
      textAlign: 'center',
      textDecoration: 'none',
      textShadow: 'none',
    },
    settings: {
      defaultFontSize: '4rem',
      defaultFontFamily: 'Arial, sans-serif',
      defaultTextColor: '#000000',
      defaultBackgroundColor: '#FFFFFF',
      maxObjects: 20,
      minObjectSize: 10,
      maxObjectSize: 1000,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: true,
      allowGif: true,
      exportFormats: ['png', 'jpg', 'webp', 'svg', 'pdf'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['blank', 'custom', 'flexible'],
      difficulty: 'beginner',
      estimatedTime: 3,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: 'テキストを入力',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialTextPosition: { x: 340, y: 285, width: 600, height: 150 },
  },
  // ゲーミング系テンプレート
  {
    id: 'template-gaming-1',
    name: 'ゲーム実況',
    description: 'ゲーム実況に最適なテンプレート',
    category: 'gaming',
    style: 'cool',
    rating: 4.8,
    preview: '/templates/thumbnail-generator/previews/gaming_cool_template-gaming-1_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 50, y: 200, width: 700, height: 120 },
          content: {
            text: 'ゲーム実況！',
            fontSize: '5rem',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'text-sub',
          type: 'text',
          position: { x: 50, y: 350, width: 400, height: 80 },
          content: {
            text: '今日は〇〇をプレイ！',
            fontSize: '2.5rem',
            fontFamily: 'Arial, sans-serif',
            color: '#E0E0E0',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 800, y: 100, width: 400, height: 400 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      accent: '#FFD700',
      background: '#1e3c72',
      text: '#FFFFFF',
      light: '#E0E0E0',
      dark: '#1e3c72',
      muted: '#BDC3C7',
      highlight: '#FFD700',
    },
    fontSettings: {
      family: 'Impact, Arial Black, sans-serif',
      size: '5rem',
      weight: 'bold',
      style: 'normal',
      lineHeight: 1.1,
      letterSpacing: '0.1em',
      textAlign: 'left',
      textDecoration: 'none',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    },
    settings: {
      defaultFontSize: '5rem',
      defaultFontFamily: 'Impact, Arial Black, sans-serif',
      defaultTextColor: '#FFFFFF',
      defaultBackgroundColor: '#1e3c72',
      maxObjects: 8,
      minObjectSize: 30,
      maxObjectSize: 600,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: false,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['gaming', 'streaming', 'blue', 'action'],
      difficulty: 'intermediate',
      estimatedTime: 8,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: 'ゲーム実況！',
    initialTextColor: '#FFFFFF',
    initialFontSize: '5rem',
    initialCharacterImagePosition: { x: 800, y: 100, width: 400, height: 400 },
    initialTextPosition: { x: 50, y: 200, width: 700, height: 120 },
  },
  {
    id: 'template-gaming-2',
    name: 'RPG冒険',
    description: 'RPGや冒険系ゲームに最適',
    category: 'gaming',
    style: 'elegant',
    rating: 4.6,
    preview: '/templates/thumbnail-generator/previews/gaming_elegant_template-gaming-2_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(45deg, #8B4513 0%, #D2691E 50%, #F4A460 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 600, y: 150, width: 600, height: 150 },
          content: {
            text: '冒険の始まり',
            fontSize: '4.5rem',
            fontFamily: 'serif',
            color: '#8B4513',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'shape-decoration',
          type: 'shape',
          position: { x: 50, y: 50, width: 100, height: 100 },
          content: {
            shapeType: 'star',
            backgroundColor: '#FFD700',
            borderColor: '#FFA500',
            borderWidth: 3,
          },
          zIndex: 1,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 100, y: 200, width: 450, height: 450 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#FFD700',
      background: '#8B4513',
      text: '#8B4513',
      light: '#F4A460',
      dark: '#8B4513',
      muted: '#CD853F',
      highlight: '#FFD700',
    },
    fontSettings: {
      family: 'serif',
      size: '4.5rem',
      weight: 'bold',
      style: 'normal',
      lineHeight: 1.2,
      letterSpacing: '0.05em',
      textAlign: 'center',
      textDecoration: 'none',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    settings: {
      defaultFontSize: '4.5rem',
      defaultFontFamily: 'serif',
      defaultTextColor: '#8B4513',
      defaultBackgroundColor: '#8B4513',
      maxObjects: 6,
      minObjectSize: 25,
      maxObjectSize: 500,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: false,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['rpg', 'adventure', 'brown', 'fantasy'],
      difficulty: 'intermediate',
      estimatedTime: 10,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: '冒険の始まり',
    initialTextColor: '#8B4513',
    initialFontSize: '4.5rem',
    initialCharacterImagePosition: { x: 100, y: 200, width: 450, height: 450 },
    initialTextPosition: { x: 600, y: 150, width: 600, height: 150 },
  },
  // トーク系テンプレート
  {
    id: 'template-talk-1',
    name: '雑談配信',
    description: '雑談配信に最適なテンプレート',
    category: 'talk',
    style: 'cute',
    rating: 4.7,
    preview: '/templates/thumbnail-generator/previews/talk_cute_template-talk-1_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FFE4E1 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 50, y: 300, width: 500, height: 120 },
          content: {
            text: 'おはよう！',
            fontSize: '4rem',
            fontFamily: 'Arial, sans-serif',
            color: '#FF1493',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'text-sub',
          type: 'text',
          position: { x: 50, y: 450, width: 400, height: 80 },
          content: {
            text: '今日もよろしくね',
            fontSize: '2rem',
            fontFamily: 'Arial, sans-serif',
            color: '#FF69B4',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 600, y: 150, width: 400, height: 400 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#FF1493',
      secondary: '#FF69B4',
      accent: '#FFB6C1',
      background: '#FFB6C1',
      text: '#FF1493',
      light: '#FFE4E1',
      dark: '#FF1493',
      muted: '#FFC0CB',
      highlight: '#FF69B4',
    },
    fontSettings: {
      family: 'Arial, sans-serif',
      size: '4rem',
      weight: 'normal',
      style: 'normal',
      lineHeight: 1.3,
      letterSpacing: '0.02em',
      textAlign: 'left',
      textDecoration: 'none',
      textShadow: '1px 1px 2px rgba(255,255,255,0.5)',
    },
    settings: {
      defaultFontSize: '4rem',
      defaultFontFamily: 'Arial, sans-serif',
      defaultTextColor: '#FF1493',
      defaultBackgroundColor: '#FFB6C1',
      maxObjects: 6,
      minObjectSize: 25,
      maxObjectSize: 500,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: true,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['talk', 'chat', 'pink', 'cute'],
      difficulty: 'beginner',
      estimatedTime: 5,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: 'おはよう！',
    initialTextColor: '#FF1493',
    initialFontSize: '4rem',
    initialCharacterImagePosition: { x: 600, y: 150, width: 400, height: 400 },
    initialTextPosition: { x: 50, y: 300, width: 500, height: 120 },
  },
  {
    id: 'template-talk-2',
    name: '企画配信',
    description: '企画やイベント配信に最適',
    category: 'talk',
    style: 'funny',
    rating: 4.5,
    preview: '/templates/thumbnail-generator/previews/talk_funny_template-talk-2_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 50, y: 200, width: 600, height: 100 },
          content: {
            text: '企画配信！',
            fontSize: '4.5rem',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'text-sub',
          type: 'text',
          position: { x: 50, y: 320, width: 500, height: 80 },
          content: {
            text: 'みんなで楽しもう',
            fontSize: '2.5rem',
            fontFamily: 'Arial, sans-serif',
            color: '#E0E0E0',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'shape-decoration',
          type: 'shape',
          position: { x: 700, y: 100, width: 80, height: 80 },
          content: {
            shapeType: 'circle',
            backgroundColor: '#FFD700',
            borderColor: '#FFA500',
            borderWidth: 2,
          },
          zIndex: 1,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 800, y: 200, width: 350, height: 350 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      accent: '#FFD700',
      background: '#FF6B6B',
      text: '#FFFFFF',
      light: '#E0E0E0',
      dark: '#FF6B6B',
      muted: '#BDC3C7',
      highlight: '#FFD700',
    },
    fontSettings: {
      family: 'Arial, sans-serif',
      size: '4.5rem',
      weight: 'bold',
      style: 'normal',
      lineHeight: 1.1,
      letterSpacing: '0.08em',
      textAlign: 'left',
      textDecoration: 'none',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    settings: {
      defaultFontSize: '4.5rem',
      defaultFontFamily: 'Arial, sans-serif',
      defaultTextColor: '#FFFFFF',
      defaultBackgroundColor: '#FF6B6B',
      maxObjects: 7,
      minObjectSize: 30,
      maxObjectSize: 600,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: true,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['event', 'planning', 'colorful', 'fun'],
      difficulty: 'intermediate',
      estimatedTime: 7,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: '企画配信！',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4.5rem',
    initialCharacterImagePosition: { x: 800, y: 200, width: 350, height: 350 },
    initialTextPosition: { x: 50, y: 200, width: 600, height: 100 },
  },
  // 音楽系テンプレート
  {
    id: 'template-music-1',
    name: '歌枠',
    description: '歌枠に最適なテンプレート',
    category: 'singing',
    style: 'elegant',
    rating: 4.9,
    preview: '/templates/thumbnail-generator/previews/singing_elegant_template-music-1_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 50, y: 150, width: 700, height: 120 },
          content: {
            text: '歌枠',
            fontSize: '6rem',
            fontFamily: 'serif',
            color: '#FFFFFF',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'text-sub',
          type: 'text',
          position: { x: 50, y: 300, width: 500, height: 80 },
          content: {
            text: '今日の歌を楽しもう',
            fontSize: '2.5rem',
            fontFamily: 'serif',
            color: '#E0E0E0',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'shape-decoration',
          type: 'shape',
          position: { x: 600, y: 400, width: 60, height: 60 },
          content: {
            shapeType: 'heart',
            backgroundColor: '#FF69B4',
            borderColor: '#FF1493',
            borderWidth: 2,
          },
          zIndex: 1,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 800, y: 100, width: 400, height: 400 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      accent: '#FF69B4',
      background: '#667eea',
      text: '#FFFFFF',
      light: '#E0E0E0',
      dark: '#667eea',
      muted: '#BDC3C7',
      highlight: '#FF69B4',
    },
    fontSettings: {
      family: 'serif',
      size: '6rem',
      weight: 'bold',
      style: 'normal',
      lineHeight: 1.0,
      letterSpacing: '0.1em',
      textAlign: 'left',
      textDecoration: 'none',
      textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
    },
    settings: {
      defaultFontSize: '6rem',
      defaultFontFamily: 'serif',
      defaultTextColor: '#FFFFFF',
      defaultBackgroundColor: '#667eea',
      maxObjects: 6,
      minObjectSize: 30,
      maxObjectSize: 600,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: false,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'ultra',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['singing', 'music', 'purple', 'elegant'],
      difficulty: 'intermediate',
      estimatedTime: 8,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: '歌枠',
    initialTextColor: '#FFFFFF',
    initialFontSize: '6rem',
    initialCharacterImagePosition: { x: 800, y: 100, width: 400, height: 400 },
    initialTextPosition: { x: 50, y: 150, width: 700, height: 120 },
  },
  {
    id: 'template-music-2',
    name: '楽器演奏',
    description: '楽器演奏に最適なテンプレート',
    category: 'singing',
    style: 'cool',
    rating: 4.4,
    preview: '/templates/thumbnail-generator/previews/singing_cool_template-music-2_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(45deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 50, y: 200, width: 600, height: 100 },
          content: {
            text: '楽器演奏',
            fontSize: '5rem',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'text-sub',
          type: 'text',
          position: { x: 50, y: 320, width: 400, height: 80 },
          content: {
            text: '今日の演奏を聴いてね',
            fontSize: '2rem',
            fontFamily: 'Arial, sans-serif',
            color: '#BDC3C7',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 700, y: 150, width: 350, height: 350 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#FFFFFF',
      secondary: '#BDC3C7',
      accent: '#3498DB',
      background: '#2c3e50',
      text: '#FFFFFF',
      light: '#BDC3C7',
      dark: '#2c3e50',
      muted: '#7f8c8d',
      highlight: '#3498DB',
    },
    fontSettings: {
      family: 'Arial, sans-serif',
      size: '5rem',
      weight: 'bold',
      style: 'normal',
      lineHeight: 1.1,
      letterSpacing: '0.1em',
      textAlign: 'left',
      textDecoration: 'none',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    },
    settings: {
      defaultFontSize: '5rem',
      defaultFontFamily: 'Arial, sans-serif',
      defaultTextColor: '#FFFFFF',
      defaultBackgroundColor: '#2c3e50',
      maxObjects: 5,
      minObjectSize: 30,
      maxObjectSize: 600,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: false,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['instrument', 'music', 'dark', 'cool'],
      difficulty: 'intermediate',
      estimatedTime: 7,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: '楽器演奏',
    initialTextColor: '#FFFFFF',
    initialFontSize: '5rem',
    initialCharacterImagePosition: { x: 700, y: 150, width: 350, height: 350 },
    initialTextPosition: { x: 50, y: 200, width: 600, height: 100 },
  },
  // イベント系テンプレート
  {
    id: 'template-event-1',
    name: '配信記念',
    description: '配信記念やマイルストーンに最適',
    category: 'event',
    style: 'elegant',
    rating: 4.8,
    preview: '/templates/thumbnail-generator/previews/event_elegant_template-event-1_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 50, y: 150, width: 700, height: 120 },
          content: {
            text: '配信記念！',
            fontSize: '5.5rem',
            fontFamily: 'serif',
            color: '#FFFFFF',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'text-sub',
          type: 'text',
          position: { x: 50, y: 300, width: 500, height: 80 },
          content: {
            text: 'ありがとうございます',
            fontSize: '2.5rem',
            fontFamily: 'serif',
            color: '#FFF8DC',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'shape-decoration',
          type: 'shape',
          position: { x: 600, y: 400, width: 100, height: 100 },
          content: {
            shapeType: 'star',
            backgroundColor: '#FFFFFF',
            borderColor: '#FFD700',
            borderWidth: 3,
          },
          zIndex: 1,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 800, y: 100, width: 400, height: 400 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#FFFFFF',
      secondary: '#FFF8DC',
      accent: '#FFD700',
      background: '#FFD700',
      text: '#FFFFFF',
      light: '#FFF8DC',
      dark: '#FF8C00',
      muted: '#FFA500',
      highlight: '#FFD700',
    },
    fontSettings: {
      family: 'serif',
      size: '5.5rem',
      weight: 'bold',
      style: 'normal',
      lineHeight: 1.0,
      letterSpacing: '0.1em',
      textAlign: 'left',
      textDecoration: 'none',
      textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
    },
    settings: {
      defaultFontSize: '5.5rem',
      defaultFontFamily: 'serif',
      defaultTextColor: '#FFFFFF',
      defaultBackgroundColor: '#FFD700',
      maxObjects: 6,
      minObjectSize: 30,
      maxObjectSize: 600,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: false,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'ultra',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['anniversary', 'milestone', 'gold', 'celebration'],
      difficulty: 'intermediate',
      estimatedTime: 9,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: '配信記念！',
    initialTextColor: '#FFFFFF',
    initialFontSize: '5.5rem',
    initialCharacterImagePosition: { x: 800, y: 100, width: 400, height: 400 },
    initialTextPosition: { x: 50, y: 150, width: 700, height: 120 },
  },
  {
    id: 'template-event-2',
    name: '誕生日配信',
    description: '誕生日配信に最適なテンプレート',
    category: 'event',
    style: 'cute',
    rating: 4.9,
    preview: '/templates/thumbnail-generator/previews/event_cute_template-event-2_preview.jpg',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    layout: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(45deg, #FF69B4 0%, #FFB6C1 50%, #FFC0CB 100%)',
      },
      objects: [
        {
          id: 'text-main',
          type: 'text',
          position: { x: 50, y: 200, width: 600, height: 120 },
          content: {
            text: 'お誕生日！',
            fontSize: '5rem',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'text-sub',
          type: 'text',
          position: { x: 50, y: 350, width: 400, height: 80 },
          content: {
            text: '一緒にお祝いしよう',
            fontSize: '2.5rem',
            fontFamily: 'Arial, sans-serif',
            color: '#FFF0F5',
          },
          zIndex: 2,
          visible: true,
        },
        {
          id: 'shape-decoration-1',
          type: 'shape',
          position: { x: 700, y: 100, width: 60, height: 60 },
          content: {
            shapeType: 'heart',
            backgroundColor: '#FF1493',
            borderColor: '#FF69B4',
            borderWidth: 2,
          },
          zIndex: 1,
          visible: true,
        },
        {
          id: 'shape-decoration-2',
          type: 'shape',
          position: { x: 800, y: 200, width: 60, height: 60 },
          content: {
            shapeType: 'heart',
            backgroundColor: '#FF69B4',
            borderColor: '#FF1493',
            borderWidth: 2,
          },
          zIndex: 1,
          visible: true,
        },
        {
          id: 'character-image',
          type: 'image',
          position: { x: 700, y: 300, width: 350, height: 350 },
          content: {
            imageSrc: '',
          },
          zIndex: 1,
          visible: true,
        },
      ],
    },
    colorPalette: {
      primary: '#FFFFFF',
      secondary: '#FFF0F5',
      accent: '#FF1493',
      background: '#FF69B4',
      text: '#FFFFFF',
      light: '#FFF0F5',
      dark: '#FF1493',
      muted: '#FFB6C1',
      highlight: '#FF1493',
    },
    fontSettings: {
      family: 'Comic Sans MS, cursive',
      size: '5rem',
      weight: 'bold',
      style: 'normal',
      lineHeight: 1.1,
      letterSpacing: '0.05em',
      textAlign: 'left',
      textDecoration: 'none',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    settings: {
      defaultFontSize: '5rem',
      defaultFontFamily: 'Comic Sans MS, cursive',
      defaultTextColor: '#FFFFFF',
      defaultBackgroundColor: '#FF69B4',
      maxObjects: 7,
      minObjectSize: 30,
      maxObjectSize: 600,
      allowAnimation: true,
      allowEffects: true,
      allowVideo: false,
      allowGif: true,
      exportFormats: ['png', 'jpg', 'webp'],
      defaultExportFormat: 'png',
      exportQuality: 'high',
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
      tags: ['birthday', 'celebration', 'pink', 'cute'],
      difficulty: 'beginner',
      estimatedTime: 6,
      lastModified: new Date().toISOString(),
      usage: {
        views: 0,
        downloads: 0,
        favorites: 0,
      },
    },
    // レガシーサポート
    initialText: 'お誕生日！',
    initialTextColor: '#FFFFFF',
    initialFontSize: '5rem',
    initialCharacterImagePosition: { x: 700, y: 300, width: 350, height: 350 },
    initialTextPosition: { x: 50, y: 200, width: 600, height: 120 },
  },
];

interface TemplateSelectorProps {
  onSelectTemplate: (template: ThumbnailTemplate) => void;
  selectedTemplateId: string | null;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, selectedTemplateId }) => {
  const { 
    aspectRatio, 
    setAspectRatio, 
    customAspectRatio, 
    setCustomAspectRatio 
  } = useTemplate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<ThumbnailTemplate[]>([]);
  const [allTemplates, setAllTemplates] = useState<ThumbnailTemplate[]>(templates);
  const [activeTab, setActiveTab] = useState<'browse' | 'manage' | 'auto-generate'>('browse');

  // カスタムテンプレートの読み込み
  useEffect(() => {
    const savedTemplates = localStorage.getItem('customThumbnailTemplates');
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      setCustomTemplates(parsed);
      setAllTemplates([...templates, ...parsed]);
    }
  }, []);

  const handleCustomAspectRatioChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'width' | 'height') => {
    const value = parseInt(e.target.value, 10);
    const newRatio = { ...customAspectRatio, [type]: value };
    if (!isNaN(value) && value > 0) {
      setCustomAspectRatio(newRatio);
      setAspectRatio('custom');
    }
  };

  // フィルタリング
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStyle = styleFilter === 'all' || template.style === styleFilter;
    const matchesDifficulty = difficultyFilter === 'all' || template.metadata.difficulty === difficultyFilter;
    const matchesAspectRatio = aspectRatio === 'custom' || template.supportedAspectRatios.includes(aspectRatio);
    
    return matchesSearch && matchesCategory && matchesStyle && matchesDifficulty && matchesAspectRatio;
  });

  // カスタムテンプレート作成
  const handleCreateCustomTemplate = (templateData: Partial<ThumbnailTemplate>) => {
    const newTemplate: ThumbnailTemplate = {
      id: `custom-${Date.now()}`,
      name: templateData.name || 'カスタムテンプレート',
      description: templateData.description || '',
      category: templateData.category || 'custom',
      style: templateData.style || 'simple',
      rating: 0,
      preview: templateData.preview || '',
      supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
      layout: {
        background: {
          type: 'color',
          value: '#FFFFFF',
        },
        objects: [
          {
            id: 'text-main',
            type: 'text',
            position: { x: 340, y: 285, width: 600, height: 150 },
            content: {
              text: '新しいテキスト',
              fontSize: '4rem',
              fontFamily: 'Arial, sans-serif',
              color: '#000000',
            },
            zIndex: 1,
            visible: true,
          },
        ],
      },
      colorPalette: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#007bff',
        background: '#FFFFFF',
        text: '#000000',
        light: '#FFFFFF',
        dark: '#000000',
        muted: '#6c757d',
        highlight: '#007bff',
      },
      fontSettings: {
        family: 'Arial, sans-serif',
        size: '4rem',
        weight: 'normal',
        style: 'normal',
        lineHeight: 1.2,
        letterSpacing: '0.05em',
        textAlign: 'center',
        textDecoration: 'none',
        textShadow: 'none',
      },
      settings: {
        defaultFontSize: '4rem',
        defaultFontFamily: 'Arial, sans-serif',
        defaultTextColor: '#000000',
        defaultBackgroundColor: '#FFFFFF',
        maxObjects: 20,
        minObjectSize: 10,
        maxObjectSize: 1000,
        allowAnimation: true,
        allowEffects: true,
        allowVideo: true,
        allowGif: true,
        exportFormats: ['png', 'jpg', 'webp', 'svg', 'pdf'],
        defaultExportFormat: 'png',
        exportQuality: 'high',
      },
      metadata: {
        version: '1.0.0',
        author: 'User',
        tags: ['custom', 'user-created'],
        difficulty: 'beginner',
        estimatedTime: 5,
        lastModified: new Date().toISOString(),
        usage: {
          views: 0,
          downloads: 0,
          favorites: 0,
        },
      },
      // レガシーサポート
      initialText: '新しいテキスト',
      initialTextColor: '#000000',
      initialFontSize: '4rem',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updatedCustomTemplates = [...customTemplates, newTemplate];
    setCustomTemplates(updatedCustomTemplates);
    setAllTemplates([...templates, ...updatedCustomTemplates]);
    
    localStorage.setItem('customThumbnailTemplates', JSON.stringify(updatedCustomTemplates));
    toast.success('カスタムテンプレートを作成しました！');
    setShowCustomCreator(false);
  };

  // カスタムテンプレート削除
  const handleDeleteCustomTemplate = (templateId: string) => {
    if (confirm('このカスタムテンプレートを削除しますか？')) {
      const updatedCustomTemplates = customTemplates.filter(template => template.id !== templateId);
      setCustomTemplates(updatedCustomTemplates);
      setAllTemplates([...templates, ...updatedCustomTemplates]);
      
      localStorage.setItem('customThumbnailTemplates', JSON.stringify(updatedCustomTemplates));
      toast.success('カスタムテンプレートを削除しました！');
    }
  };

  // テンプレート管理用のハンドラー
  const handleTemplatesChange = (updatedTemplates: ThumbnailTemplate[]) => {
    setCustomTemplates(updatedTemplates);
    setAllTemplates([...templates, ...updatedTemplates]);
    localStorage.setItem('customThumbnailTemplates', JSON.stringify(updatedTemplates));
  };

  return (
    <div className="w-full">
      {/* タブ切り替え */}
      <div className="border-b mb-4">
        <div className="flex justify-center">
          <button
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'browse'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('browse')}
          >
            <Grid3X3 className="h-4 w-4" />
            <span>選択</span>
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'manage'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            <Settings className="h-4 w-4" />
            <span>管理</span>
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'auto-generate'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('auto-generate')}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI生成</span>
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <Accordion type="multiple" className="w-full" defaultValue={['aspect-ratio', 'templates']}>
      <AccordionItem value="aspect-ratio">
        <AccordionTrigger>アスペクト比</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <Label>プリセット</Label>
          <ToggleGroup 
            type="single" 
            value={aspectRatio === 'custom' ? '' : aspectRatio}
            onValueChange={(value) => { if (value) setAspectRatio(value); }}
            variant="outline" 
            className="flex-wrap justify-start"
          >
            {aspectRatios.map(ratio => (
              <ToggleGroupItem key={ratio} value={ratio} aria-label={`比率 ${ratio}`}>{ratio}</ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="space-y-2">
            <Label>手動設定</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="幅" 
                className="w-24" 
                value={customAspectRatio.width}
                onChange={(e) => handleCustomAspectRatioChange(e, 'width')}
              />
              <span>:</span>
              <Input 
                type="number" 
                placeholder="高さ" 
                className="w-24" 
                value={customAspectRatio.height}
                onChange={(e) => handleCustomAspectRatioChange(e, 'height')}
              />
            </div>
            <p className="text-xs text-muted-foreground">小さい数字で比率、大きい数字で解像度を指定できます。</p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="templates">
        <AccordionTrigger>テンプレート選択</AccordionTrigger>
        <AccordionContent className="pt-4">
          <div className="space-y-4">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-lg font-semibold">テンプレート選択</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCustomCreator(true)}
                className="flex items-center gap-1 md:gap-2 h-9 px-3 md:px-4"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">カスタム作成</span>
                <span className="sm:hidden">作成</span>
              </Button>
            </div>

      {/* 検索・フィルター */}
      <div className="space-y-3">
        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="テンプレートを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 md:h-9"
          />
        </div>
        
        {/* フィルター */}
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-32 h-10 md:h-9">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="gaming">ゲーム</SelectItem>
              <SelectItem value="talk">雑談</SelectItem>
              <SelectItem value="singing">歌枠</SelectItem>
              <SelectItem value="collaboration">コラボ</SelectItem>
              <SelectItem value="event">イベント</SelectItem>
              <SelectItem value="custom">カスタム</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-full md:w-32 h-10 md:h-9">
              <SelectValue placeholder="スタイル" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="cute">可愛い</SelectItem>
              <SelectItem value="cool">クール</SelectItem>
              <SelectItem value="elegant">エレガント</SelectItem>
              <SelectItem value="funny">面白い</SelectItem>
              <SelectItem value="simple">シンプル</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-32 h-10 md:h-9">
              <SelectValue placeholder="難易度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="beginner">初級</SelectItem>
              <SelectItem value="intermediate">中級</SelectItem>
              <SelectItem value="advanced">上級</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* テンプレートグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={cn(
              "relative group cursor-pointer transition-all hover:scale-[1.02] md:hover:scale-105 p-1",
              selectedTemplateId === template.id && "ring-2 ring-blue-500 ring-inset"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            {/* モバイル用横長レイアウト */}
            <Card className="overflow-hidden md:block">
              <div className="flex md:block">
                {/* プレビュー画像部分 */}
                <div className="w-24 h-16 md:w-full md:aspect-video bg-gray-100 dark:bg-gray-800 relative flex-shrink-0">
                  {template.preview ? (
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-xs md:text-sm relative overflow-hidden"
                      style={{
                        background: template.layout.background.type === 'color' 
                          ? template.layout.background.value
                          : template.layout.background.type === 'gradient'
                          ? template.layout.background.value
                          : '#f8f9fa'
                      }}
                    >
                      {/* テンプレートオブジェクトのプレビュー */}
                      {template.layout.objects.map((obj) => {
                        if (obj.type === 'text' && obj.content?.text) {
                          return (
                            <div
                              key={obj.id}
                              className="absolute"
                              style={{
                                left: `${(obj.position.x / 1200) * 100}%`,
                                top: `${(obj.position.y / 675) * 100}%`,
                                width: `${(obj.position.width / 1200) * 100}%`,
                                height: `${(obj.position.height / 675) * 100}%`,
                                fontSize: '0.5rem',
                                color: obj.content.color || template.colorPalette.text,
                                fontFamily: obj.content.fontFamily || template.fontSettings.family,
                                fontWeight: obj.content.fontSize?.includes('bold') ? 'bold' : 'normal',
                                textAlign: obj.content.textAlign || template.fontSettings.textAlign,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: `scale(${Math.min(1, 100 / (obj.content.text.length || 1))})`,
                              }}
                            >
                              {obj.content.text}
                            </div>
                          );
                        }
                        return null;
                      })}
                      
                      {/* フォールバック: レガシーサポート */}
                      {template.layout.objects.length === 0 && template.initialText && (
                        <p 
                          className="font-bold text-center px-1" 
                          style={{ 
                            color: template.initialTextColor || template.colorPalette.text,
                            fontSize: '0.5rem'
                          }}
                        >
                          {template.initialText}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* デスクトップ用ホバーオーバーレイ */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 md:group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary">
                      <Eye className="h-4 w-4 mr-1" />
                      プレビュー
                    </Button>
                    {template.isCustom && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomTemplate(template.id);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        削除
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* コンテンツ部分 */}
                <div className="flex-1 p-3 md:p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-sm truncate">{template.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 md:line-clamp-2">{template.description}</p>
                    </div>
                    {/* モバイル用削除ボタン */}
                    {template.isCustom && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="md:hidden ml-2 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomTemplate(template.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {template.category === 'gaming' ? 'ゲーム' :
                         template.category === 'talk' ? '雑談' :
                         template.category === 'singing' ? '歌枠' :
                         template.category === 'collaboration' ? 'コラボ' :
                         template.category === 'event' ? 'イベント' : 'カスタム'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{
                          color: template.metadata.difficulty === 'beginner' ? '#22c55e' :
                                 template.metadata.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444'
                        }}
                      >
                        {template.metadata.difficulty === 'beginner' ? '初級' :
                         template.metadata.difficulty === 'intermediate' ? '中級' : '上級'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">{template.rating}</span>
                    </div>
                  </div>
                  
                  {/* メタデータ情報 */}
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                    <span>{template.metadata.estimatedTime}分</span>
                    <span>{template.layout.objects.length}オブジェクト</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

            {/* カスタムテンプレート作成モーダル */}
            {showCustomCreator && (
              <CustomTemplateCreator
                onCreateTemplate={handleCreateCustomTemplate}
                onClose={() => setShowCustomCreator(false)}
              />
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
      ) : activeTab === 'manage' ? (
        <TemplateManager
          templates={customTemplates}
          onTemplatesChange={handleTemplatesChange}
          onSelectTemplate={onSelectTemplate}
          selectedTemplateId={selectedTemplateId}
        />
      ) : (
        <AutoGenerationPanel
          onTemplateGenerated={onSelectTemplate}
          onTemplatesGenerated={(templates) => {
            const updatedTemplates = [...customTemplates, ...templates];
            handleTemplatesChange(updatedTemplates);
          }}
        />
      )}
    </div>
  );
};

// カスタムテンプレート作成コンポーネント
interface CustomTemplateCreatorProps {
  onCreateTemplate: (templateData: Partial<ThumbnailTemplate>) => void;
  onClose: () => void;
}

const CustomTemplateCreator: React.FC<CustomTemplateCreatorProps> = ({ onCreateTemplate, onClose }) => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('custom');
  const [templateStyle, setTemplateStyle] = useState<string>('simple');
  const [templateImage, setTemplateImage] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // ファイルをDataURLに変換
      const templateDataURL = await fileToDataURL(file);
      setTemplateImage(templateDataURL);
      
      // プレビュー画像を自動生成
      setIsGeneratingPreview(true);
      const previewDataURL = await generatePreviewFromTemplate(templateDataURL);
      setPreviewImage(previewDataURL);
      
      toast.success('画像をアップロードし、プレビューを生成しました！');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
      setIsGeneratingPreview(false);
    }
  };

  const handleCreate = () => {
    if (!templateName.trim()) {
      toast.error('テンプレート名を入力してください');
      return;
    }

    if (!templateImage) {
      toast.error('テンプレート画像をアップロードしてください');
      return;
    }

    onCreateTemplate({
      name: templateName,
      description: templateDescription,
      category: templateCategory as any,
      style: templateStyle as any,
      preview: previewImage,
    });

    // フォームをリセット
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('custom');
    setTemplateStyle('simple');
    setTemplateImage('');
    setPreviewImage('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              カスタムテンプレート作成
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            既存のサムネイル画像をアップロードしてテンプレートとして保存できます
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-xs text-yellow-800">
              <strong>注意:</strong> カスタムテンプレートは現在1280×720でのエクスポートのみ対応しています。
              他の解像度でのエクスポートは正常に動作しない場合があります。
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* テンプレート画像アップロード */}
          <div>
            <Label className="text-sm font-medium">テンプレート画像</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />
              {templateImage && (
                <div className="space-y-2">
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={templateImage}
                      alt="テンプレート"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500">元画像 (1280×720px推奨)</p>
                </div>
              )}
              {previewImage && (
                <div className="space-y-2">
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden max-w-xs">
                    <img
                      src={previewImage}
                      alt="プレビュー"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500">プレビュー画像 (320×180px)</p>
                </div>
              )}
              {isUploading && (
                <p className="text-xs text-gray-500 mt-1">アップロード中...</p>
              )}
              {isGeneratingPreview && (
                <p className="text-xs text-blue-500 mt-1">プレビュー生成中...</p>
              )}
            </div>
          </div>

          {/* テンプレート名 */}
          <div>
            <Label className="text-sm font-medium">テンプレート名</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="テンプレート名を入力"
              className="mt-1"
            />
          </div>

          {/* 説明 */}
          <div>
            <Label className="text-sm font-medium">説明</Label>
            <Textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="テンプレートの説明を入力"
              className="mt-1 min-h-[80px] resize-none"
            />
          </div>

          {/* カテゴリとスタイル */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">カテゴリ</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gaming">ゲーム</SelectItem>
                  <SelectItem value="talk">雑談</SelectItem>
                  <SelectItem value="singing">歌枠</SelectItem>
                  <SelectItem value="collaboration">コラボ</SelectItem>
                  <SelectItem value="event">イベント</SelectItem>
                  <SelectItem value="custom">カスタム</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">スタイル</Label>
              <Select value={templateStyle} onValueChange={setTemplateStyle}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cute">可愛い</SelectItem>
                  <SelectItem value="cool">クール</SelectItem>
                  <SelectItem value="elegant">エレガント</SelectItem>
                  <SelectItem value="funny">面白い</SelectItem>
                  <SelectItem value="simple">シンプル</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreate} className="flex-1" disabled={!templateName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              テンプレートを作成
            </Button>
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(TemplateSelector);