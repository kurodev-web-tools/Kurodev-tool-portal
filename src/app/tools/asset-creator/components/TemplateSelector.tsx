import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplate } from '../contexts/TemplateContext';

// テンプレートの型定義
export interface ThumbnailTemplate {
  id: string;
  name: string;
  genre: 'simple' | 'cute' | 'cool' | 'stylish'; // ジャンルプロパティを追加
  initialText: string;
  initialTextColor: string;
  initialFontSize: string;
  initialImageSrc: string; // 必須に変更
  initialBackgroundImagePosition?: { x: number; y: number; width: number; height: number };
  initialCharacterImagePosition?: { x: number; y: number; width: number; height: number };
  initialTextPosition?: { x: number; y: number; width: number; height: number };
  supportedAspectRatios: string[];
}

// ジャンルの表示名
const genreNames: { [key in ThumbnailTemplate['genre']]: string } = {
  simple: 'シンプル',
  cute: 'かわいい',
  cool: 'クール',
  stylish: 'スタイリッシュ',
};

// テンプレートの定義
export const templates: ThumbnailTemplate[] = [
  // --- simple ---
  {
    id: 'simple_1x1_001',
    name: 'シンプル 1:1 001',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/1x1/simple_1x1_001.png',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'simple_1x1_002',
    name: 'シンプル 1:1 002',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/1x1/simple_1x1_002.png',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'simple_1x1_003',
    name: 'シンプル 1:1 003',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/1x1/simple_1x1_003.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'simple_1x1_004',
    name: 'シンプル 1:1 004',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/1x1/simple_1x1_004.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'simple_1x1_005',
    name: 'シンプル 1:1 005',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/1x1/simple_1x1_005.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'simple_1x1_006',
    name: 'シンプル 1:1 006',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/1x1/simple_1x1_006.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'simple_1x1_007',
    name: 'シンプル 1:1 007',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/1x1/simple_1x1_007.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'simple_4x3_001',
    name: 'シンプル 4:3 001',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/4x3/simple_4x3_001.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'simple_4x3_002',
    name: 'シンプル 4:3 002',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/4x3/simple_4x3_002.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'simple_4x3_003',
    name: 'シンプル 4:3 003',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/4x3/simple_4x3_003.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'simple_4x3_004',
    name: 'シンプル 4:3 004',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/4x3/simple_4x3_004.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'simple_4x3_005',
    name: 'シンプル 4:3 005',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/4x3/simple_4x3_005.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'simple_9x16_001',
    name: 'シンプル 9:16 001',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/9x16/simple_9x16_001.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'simple_9x16_002',
    name: 'シンプル 9:16 002',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/9x16/simple_9x16_002.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'simple_9x16_003',
    name: 'シンプル 9:16 003',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/9x16/simple_9x16_003.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'simple_9x16_004',
    name: 'シンプル 9:16 004',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/9x16/simple_9x16_004.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'simple_16x9_001',
    name: 'シンプル 16:9 001',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/16x9/simple_16x9_001.png',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'simple_16x9_002',
    name: 'シンプル 16:9 002',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/16x9/simple_16x9_002.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'simple_16x9_003',
    name: 'シンプル 16:9 003',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/16x9/simple_16x9_003.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'simple_16x9_004',
    name: 'シンプル 16:9 004',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/16x9/simple_16x9_004.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'simple_16x9_005',
    name: 'シンプル 16:9 005',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/16x9/simple_16x9_005.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'simple_16x9_006',
    name: 'シンプル 16:9 006',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/16x9/simple_16x9_006.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'simple_16x9_007',
    name: 'シンプル 16:9 007',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/16x9/simple_16x9_007.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'simple_16x9_008',
    name: 'シンプル 16:9 008',
    genre: 'simple',
    initialText: 'テキスト',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/simple/16x9/simple_16x9_008.jpg',
    supportedAspectRatios: ['16:9'],
  },

  // --- cute ---
  {
    id: 'cute_1x1_001',
    name: 'かわいい 1:1 001',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/1x1/cute_1x1_001.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cute_1x1_002',
    name: 'かわいい 1:1 002',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/1x1/cute_1x1_002.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cute_1x1_003',
    name: 'かわいい 1:1 003',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/1x1/cute_1x1_003.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cute_1x1_004',
    name: 'かわいい 1:1 004',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/1x1/cute_1x1_004.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cute_1x1_005',
    name: 'かわいい 1:1 005',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/1x1/cute_1x1_005.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cute_1x1_006',
    name: 'かわいい 1:1 006',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/1x1/cute_1x1_006.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cute_4x3_001',
    name: 'かわいい 4:3 001',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/4x3/cute_4x3_001.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cute_4x3_002',
    name: 'かわいい 4:3 002',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/4x3/cute_4x3_002.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cute_4x3_003',
    name: 'かわいい 4:3 003',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/4x3/cute_4x3_003.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cute_4x3_004',
    name: 'かわいい 4:3 004',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/4x3/cute_4x3_004.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cute_4x3_005',
    name: 'かわいい 4:3 005',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/4x3/cute_4x3_005.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cute_4x3_006',
    name: 'かわいい 4:3 006',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/4x3/cute_4x3_006.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cute_9x16_001',
    name: 'かわいい 9:16 001',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/9x16/cute_9x16_001.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cute_9x16_002',
    name: 'かわいい 9:16 002',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/9x16/cute_9x16_002.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cute_9x16_003',
    name: 'かわいい 9:16 003',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/9x16/cute_9x16_003.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cute_9x16_004',
    name: 'かわいい 9:16 004',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/9x16/cute_9x16_004.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cute_9x16_005',
    name: 'かわいい 9:16 005',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/9x16/cute_9x16_005.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cute_9x16_006',
    name: 'かわいい 9:16 006',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/9x16/cute_9x16_006.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cute_16x9_001',
    name: 'かわいい 16:9 001',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/16x9/cute_16x9_001.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cute_16x9_002',
    name: 'かわいい 16:9 002',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/16x9/cute_16x9_002.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cute_16x9_003',
    name: 'かわいい 16:9 003',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/16x9/cute_16x9_003.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cute_16x9_004',
    name: 'かわいい 16:9 004',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/16x9/cute_16x9_004.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cute_16x9_005',
    name: 'かわいい 16:9 005',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/16x9/cute_16x9_005.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cute_16x9_006',
    name: 'かわいい 16:9 006',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/16x9/cute_16x9_006.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cute_16x9_007',
    name: 'かわいい 16:9 007',
    genre: 'cute',
    initialText: 'テキスト',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cute/16x9/cute_16x9_007.jpg',
    supportedAspectRatios: ['16:9'],
  },

  // --- cool ---
  {
    id: 'cool_1x1_001',
    name: 'クール 1:1 001',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/1x1/cool_1x1_001.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cool_1x1_002',
    name: 'クール 1:1 002',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/1x1/cool_1x1_002.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cool_1x1_003',
    name: 'クール 1:1 003',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/1x1/cool_1x1_003.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cool_1x1_004',
    name: 'クール 1:1 004',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/1x1/cool_1x1_004.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cool_1x1_005',
    name: 'クール 1:1 005',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/1x1/cool_1x1_005.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cool_1x1_006',
    name: 'クール 1:1 006',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/1x1/cool_1x1_006.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cool_1x1_007',
    name: 'クール 1:1 007',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/1x1/cool_1x1_007.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cool_1x1_008',
    name: 'クール 1:1 008',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/1x1/cool_1x1_008.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cool_1x1_009',
    name: 'クール 1:1 009',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/1x1/cool_1x1_009.jpg',
    supportedAspectRatios: ['1:1'],
  },
  {
    id: 'cool_4x3_001',
    name: 'クール 4:3 001',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/4x3/cool_4x3_001.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cool_4x3_002',
    name: 'クール 4:3 002',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/4x3/cool_4x3_002.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cool_4x3_003',
    name: 'クール 4:3 003',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/4x3/cool_4x3_003.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cool_4x3_004',
    name: 'クール 4:3 004',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/4x3/cool_4x3_004.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cool_4x3_005',
    name: 'クール 4:3 005',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/4x3/cool_4x3_005.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cool_4x3_006',
    name: 'クール 4:3 006',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/4x3/cool_4x3_006.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cool_4x3_007',
    name: 'クール 4:3 007',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/4x3/cool_4x3_007.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cool_4x3_008',
    name: 'クール 4:3 008',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/4x3/cool_4x3_008.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cool_4x3_009',
    name: 'クール 4:3 009',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/4x3/cool_4x3_009.jpg',
    supportedAspectRatios: ['4:3'],
  },
  {
    id: 'cool_9x16_001',
    name: 'クール 9:16 001',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/9x16/cool_9x16_001.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cool_9x16_002',
    name: 'クール 9:16 002',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/9x16/cool_9x16_002.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cool_9x16_003',
    name: 'クール 9:16 003',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/9x16/cool_9x16_003.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cool_9x16_004',
    name: 'クール 9:16 004',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/9x16/cool_9x16_004.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cool_9x16_005',
    name: 'クール 9:16 005',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/9x16/cool_9x16_005.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cool_9x16_006',
    name: 'クール 9:16 006',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/9x16/cool_9x16_006.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cool_9x16_007',
    name: 'クール 9:16 007',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/9x16/cool_9x16_007.jpg',
    supportedAspectRatios: ['9:16'],
  },
  {
    id: 'cool_16x9_001',
    name: 'クール 16:9 001',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_001.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cool_16x9_002',
    name: 'クール 16:9 002',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_002.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cool_16x9_003',
    name: 'クール 16:9 003',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_003.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cool_16x9_004',
    name: 'クール 16:9 004',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_004.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cool_16x9_005',
    name: 'クール 16:9 005',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_005.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cool_16x9_006',
    name: 'クール 16:9 006',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_006.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cool_16x9_007',
    name: 'クール 16:9 007',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_007.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cool_16x9_008',
    name: 'クール 16:9 008',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_008.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cool_16x9_009',
    name: 'クール 16:9 009',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_009.jpg',
    supportedAspectRatios: ['16:9'],
  },
  {
    id: 'cool_16x9_010',
    name: 'クール 16:9 010',
    genre: 'cool',
    initialText: 'テキスト',
    initialTextColor: '#FFFFFF',
    initialFontSize: '4rem',
    initialImageSrc: '/templates/asset-creator/cool/16x9/cool_16x9_010.jpg',
    supportedAspectRatios: ['16:9'],
  },
];

const aspectRatios = ['1:1', '4:3', '9:16', '16:9'];

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

  const handleCustomAspectRatioChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'width' | 'height') => {
    const value = parseInt(e.target.value, 10);
    const newRatio = { ...customAspectRatio, [type]: value };
    if (!isNaN(value) && value > 0) {
      setCustomAspectRatio(newRatio);
      setAspectRatio('custom');
    }
  };

  // 選択中のアスペクト比でテンプレートをフィルタリング
  const filteredTemplates = templates.filter(t => 
    aspectRatio === 'custom' || t.supportedAspectRatios.includes(aspectRatio)
  );

  // フィルタリングされたテンプレートからユニークなジャンルを取得
  const availableGenres = [...new Set(filteredTemplates.map(t => t.genre))] as ThumbnailTemplate['genre'][];

  return (
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
          {availableGenres.length > 0 ? (
            <Tabs defaultValue={availableGenres[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {availableGenres.map(genre => (
                  <TabsTrigger key={genre} value={genre}>{genreNames[genre]}</TabsTrigger>
                ))}
              </TabsList>
              {availableGenres.map(genre => (
                <TabsContent key={genre} value={genre}>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {filteredTemplates
                      .filter(template => template.genre === genre)
                      .map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            "cursor-pointer hover:border-primary transition-colors group",
                            selectedTemplateId === template.id && "border-primary ring-2 ring-primary"
                          )}
                          onClick={() => onSelectTemplate(template)}
                        >
                          <CardContent className="p-0 rounded-md">
                            <div className={cn(
                              "w-full rounded-md flex items-center justify-center relative overflow-hidden",
                              aspectRatio === '1:1' ? 'aspect-square' : 
                              aspectRatio === '4:3' ? 'aspect-[4/3]' :
                              aspectRatio === '9:16' ? 'aspect-[9/16]' :
                              'aspect-video'
                            )}>
                              <Image
                                src={template.initialImageSrc}
                                alt={template.name}
                                layout="fill"
                                objectFit="cover"
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              このアスペクト比に対応するテンプレートはありません。
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default React.memo(TemplateSelector);