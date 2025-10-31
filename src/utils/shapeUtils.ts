/**
 * 図形関連のユーティリティ
 */

import { ShapeType } from '@/types/layers';
import { Square, Circle, Triangle, Minus, ArrowRight, Star, Hexagon, Heart, Diamond, GripHorizontal, MessageCircle, MessageSquare, Brain, Award, Ribbon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ShapeOption {
  type: ShapeType;
  label: string;
  icon: LucideIcon;
  category: 'basic' | 'decorative' | 'bubble' | 'badge';
}

/**
 * 全図形オプションの定義
 */
export const ALL_SHAPE_OPTIONS: ShapeOption[] = [
  // 基本図形
  { type: 'rectangle', label: '四角形', icon: Square, category: 'basic' },
  { type: 'circle', label: '円', icon: Circle, category: 'basic' },
  { type: 'triangle', label: '三角形', icon: Triangle, category: 'basic' },
  { type: 'line', label: '線', icon: Minus, category: 'basic' },
  { type: 'arrow', label: '矢印', icon: ArrowRight, category: 'basic' },
  { type: 'star', label: '星', icon: Star, category: 'basic' },
  { type: 'polygon', label: '多角形', icon: Hexagon, category: 'basic' },
  { type: 'heart', label: 'ハート', icon: Heart, category: 'basic' },
  { type: 'diamond', label: 'ダイヤ', icon: Diamond, category: 'basic' },
  // 装飾線
  { type: 'dashed-line', label: '点線', icon: GripHorizontal, category: 'decorative' },
  { type: 'dotted-line', label: '点線', icon: GripHorizontal, category: 'decorative' },
  { type: 'wavy-line', label: '波線', icon: GripHorizontal, category: 'decorative' },
  // 吹き出し
  { type: 'speech-bubble-round', label: '吹き出し', icon: MessageCircle, category: 'bubble' },
  { type: 'speech-bubble-square', label: '吹き出し(角)', icon: MessageSquare, category: 'bubble' },
  { type: 'thought-bubble', label: '思考バブル', icon: Brain, category: 'bubble' },
  // バッジ・リボン
  { type: 'badge', label: 'バッジ', icon: Award, category: 'badge' },
  { type: 'ribbon', label: 'リボン', icon: Ribbon, category: 'badge' },
];

/**
 * カテゴリごとにグループ化
 */
export const SHAPE_OPTIONS_BY_CATEGORY = {
  basic: ALL_SHAPE_OPTIONS.filter(s => s.category === 'basic'),
  decorative: ALL_SHAPE_OPTIONS.filter(s => s.category === 'decorative'),
  bubble: ALL_SHAPE_OPTIONS.filter(s => s.category === 'bubble'),
  badge: ALL_SHAPE_OPTIONS.filter(s => s.category === 'badge'),
};

