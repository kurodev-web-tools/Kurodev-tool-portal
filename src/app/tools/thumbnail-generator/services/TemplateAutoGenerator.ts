/**
 * テンプレート自動生成サービスの基盤設計
 * 将来のAI自動生成機能に備えた構造設計
 */

import { ThumbnailTemplate } from '@/types/template';

// 自動生成の設定
export interface AutoGenerationConfig {
  // 生成対象
  target: {
    category: 'gaming' | 'talk' | 'singing' | 'collaboration' | 'event' | 'custom';
    style: 'cute' | 'cool' | 'elegant' | 'funny' | 'simple';
    aspectRatio: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  
  // 生成パラメータ
  parameters: {
    objectCount: {
      min: number;
      max: number;
      preferred: number;
    };
    colorScheme: 'monochrome' | 'complementary' | 'triadic' | 'analogous' | 'random';
    fontStyle: 'modern' | 'classic' | 'playful' | 'elegant' | 'bold';
    layoutType: 'centered' | 'asymmetric' | 'grid' | 'flow' | 'random';
  };
  
  // 制約条件
  constraints: {
    maxTextLength: number;
    minObjectSize: number;
    maxObjectSize: number;
    allowOverlap: boolean;
    requireBalance: boolean;
  };
  
  // 品質設定
  quality: {
    complexity: 'low' | 'medium' | 'high';
    uniqueness: 'low' | 'medium' | 'high';
    trendiness: 'low' | 'medium' | 'high';
  };
}

// 生成結果の評価
export interface GenerationResult {
  template: ThumbnailTemplate;
  score: {
    overall: number; // 0-100
    aesthetics: number; // 0-100
    usability: number; // 0-100
    uniqueness: number; // 0-100
    trendiness: number; // 0-100
  };
  metadata: {
    generationTime: number; // ms
    algorithm: string;
    version: string;
    seed?: string;
  };
  suggestions: string[];
}

// テンプレート生成アルゴリズムの基底クラス
export abstract class TemplateGenerator {
  protected config: AutoGenerationConfig;
  
  constructor(config: AutoGenerationConfig) {
    this.config = config;
  }
  
  // テンプレート生成の抽象メソッド
  abstract generate(): Promise<GenerationResult>;
  
  // 生成結果の評価
  abstract evaluate(template: ThumbnailTemplate): Promise<GenerationResult['score']>;
  
  // 設定の検証
  protected validateConfig(): boolean {
    const { target, parameters, constraints } = this.config;
    
    // 基本的な検証
    if (parameters.objectCount.min > parameters.objectCount.max) return false;
    if (parameters.objectCount.preferred < parameters.objectCount.min) return false;
    if (parameters.objectCount.preferred > parameters.objectCount.max) return false;
    if (constraints.minObjectSize > constraints.maxObjectSize) return false;
    
    return true;
  }
  
  // 共通のユーティリティメソッド
  protected generateId(): string {
    return `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  protected generateName(category: string, style: string): string {
    const adjectives: Record<string, string[]> = {
      cute: ['可愛い', 'キュート', 'チャーミング'],
      cool: ['クール', 'スタイリッシュ', 'モダン'],
      elegant: ['エレガント', '上品', '洗練された'],
      funny: ['面白い', 'ユーモラス', '楽しい'],
      simple: ['シンプル', 'ミニマル', 'クリーン']
    };
    
    const nouns: Record<string, string[]> = {
      gaming: ['ゲーム', 'プレイ', 'バトル'],
      talk: ['トーク', 'おしゃべり', '雑談'],
      singing: ['歌', 'ミュージック', 'パフォーマンス'],
      collaboration: ['コラボ', '協力', 'チーム'],
      event: ['イベント', 'お祭り', '特別'],
      custom: ['カスタム', 'オリジナル', 'ユニーク']
    };
    
    const adj = adjectives[style] || adjectives.simple;
    const noun = nouns[category] || nouns.custom;
    
    const randomAdj = adj[Math.floor(Math.random() * adj.length)];
    const randomNoun = noun[Math.floor(Math.random() * noun.length)];
    
    return `${randomAdj}${randomNoun}テンプレート`;
  }
}

// ルールベース生成器（現在実装可能）
export class RuleBasedGenerator extends TemplateGenerator {
  private colorPalettes: Record<string, any[]> = {
    monochrome: [
      { primary: '#2D3748', secondary: '#4A5568', accent: '#718096', background: '#F7FAFC', text: '#1A202C' },
      { primary: '#2B6CB0', secondary: '#3182CE', accent: '#4299E1', background: '#EBF8FF', text: '#1A365D' },
      { primary: '#805AD5', secondary: '#9F7AEA', accent: '#B794F6', background: '#FAF5FF', text: '#322659' }
    ],
    complementary: [
      { primary: '#E53E3E', secondary: '#38A169', accent: '#D69E2E', background: '#FFF5F5', text: '#1A202C' },
      { primary: '#3182CE', secondary: '#E53E3E', accent: '#38A169', background: '#EBF8FF', text: '#1A365D' },
      { primary: '#805AD5', secondary: '#D69E2E', accent: '#38A169', background: '#FAF5FF', text: '#322659' }
    ],
    triadic: [
      { primary: '#E53E3E', secondary: '#38A169', accent: '#3182CE', background: '#FFF5F5', text: '#1A202C' },
      { primary: '#805AD5', secondary: '#E53E3E', accent: '#38A169', background: '#FAF5FF', text: '#322659' },
      { primary: '#D69E2E', secondary: '#3182CE', accent: '#E53E3E', background: '#FFFBEB', text: '#1A202C' }
    ]
  };
  
  private fontSettings: Record<string, any> = {
    modern: { family: 'Inter, sans-serif', weight: '500', style: 'normal' },
    classic: { family: 'Georgia, serif', weight: '400', style: 'normal' },
    playful: { family: 'Comic Sans MS, cursive', weight: '400', style: 'normal' },
    elegant: { family: 'Playfair Display, serif', weight: '400', style: 'italic' },
    bold: { family: 'Impact, Arial Black, sans-serif', weight: '900', style: 'normal' }
  };
  
  async generate(): Promise<GenerationResult> {
    const startTime = Date.now();
    
    if (!this.validateConfig()) {
      throw new Error('Invalid configuration');
    }
    
    const template = await this.generateTemplate();
    const score = await this.evaluate(template);
    const generationTime = Date.now() - startTime;
    
    return {
      template,
      score,
      metadata: {
        generationTime,
        algorithm: 'rule-based',
        version: '1.0.0'
      },
      suggestions: this.generateSuggestions(template, score)
    };
  }
  
  private async generateTemplate(): Promise<ThumbnailTemplate> {
    const { target, parameters, constraints } = this.config;
    
    // カラーパレット選択
    const colorScheme = this.colorPalettes[parameters.colorScheme] || this.colorPalettes.complementary;
    const selectedPalette = colorScheme[Math.floor(Math.random() * colorScheme.length)];
    
    // フォント設定選択
    const fontConfig = this.fontSettings[parameters.fontStyle] || this.fontSettings.modern;
    
    // オブジェクト数決定
    const objectCount = this.determineObjectCount();
    
    // レイアウト生成
    const layout = this.generateLayout(objectCount, target.aspectRatio);
    
    // テンプレート構築
    const template: ThumbnailTemplate = {
      id: this.generateId(),
      name: this.generateName(target.category, target.style),
      description: `${target.category}向けの${target.style}なデザインテンプレート`,
      category: target.category,
      style: target.style,
      rating: 0,
      preview: '', // 後で生成
      supportedAspectRatios: [target.aspectRatio],
      layout,
      colorPalette: selectedPalette,
      fontSettings: {
        family: fontConfig.family,
        size: this.determineFontSize(target.difficulty),
        weight: fontConfig.weight,
        style: fontConfig.style,
        lineHeight: 1.2,
        letterSpacing: '0',
        textAlign: 'center',
        textDecoration: 'none',
        textShadow: 'none'
      },
      settings: {
        defaultFontSize: this.determineFontSize(target.difficulty),
        defaultFontFamily: fontConfig.family,
        defaultTextColor: selectedPalette.text,
        defaultBackgroundColor: selectedPalette.background,
        maxObjects: constraints.maxObjectSize,
        minObjectSize: constraints.minObjectSize,
        maxObjectSize: constraints.maxObjectSize,
        allowAnimation: false,
        allowEffects: false,
        allowVideo: false,
        allowGif: false,
        exportFormats: ['png', 'jpg'],
        defaultExportFormat: 'png',
        exportQuality: 'high'
      },
      metadata: {
        version: '1.0.0',
        author: 'Auto Generator',
        tags: this.generateTags(target.category, target.style),
        difficulty: target.difficulty,
        estimatedTime: this.estimateTime(objectCount, target.difficulty),
        lastModified: new Date().toISOString(),
        usage: {
          views: 0,
          downloads: 0,
          favorites: 0
        }
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    };
    
    return template;
  }
  
  private determineObjectCount(): number {
    const { min, max, preferred } = this.config.parameters.objectCount;
    const { difficulty } = this.config.target;
    
    // 難易度に応じて調整
    const difficultyMultiplier = {
      beginner: 0.7,
      intermediate: 1.0,
      advanced: 1.3
    };
    
    const adjustedPreferred = Math.round(preferred * difficultyMultiplier[difficulty]);
    const finalCount = Math.max(min, Math.min(max, adjustedPreferred));
    
    return finalCount;
  }
  
  private generateLayout(objectCount: number, aspectRatio: string): ThumbnailTemplate['layout'] {
    const [width, height] = aspectRatio.split(':').map(Number);
    const canvasWidth = 1000;
    const canvasHeight = (canvasWidth * height) / width;
    
    const objects = [];
    
    // 背景はlayout.backgroundで管理するため、objectsには追加しない
    
    // テキストオブジェクト生成
    const textCount = Math.max(1, Math.floor(objectCount * 0.6));
    for (let i = 0; i < textCount; i++) {
      objects.push(this.generateTextObject(i, canvasWidth, canvasHeight));
    }
    
    // 図形オブジェクト生成
    const shapeCount = objectCount - textCount;
    for (let i = 0; i < shapeCount; i++) {
      objects.push(this.generateShapeObject(i, canvasWidth, canvasHeight));
    }
    
    return {
      background: {
        type: 'color',
        value: '#ffffff'
      },
      objects
    };
  }
  
  private generateTextObject(index: number, canvasWidth: number, canvasHeight: number) {
    const positions = this.generatePositions(canvasWidth, canvasHeight);
    const position = positions[index % positions.length];
    
    return {
      id: `text-${index}`,
      type: 'text' as const,
      visible: true,
      locked: false,
      position: {
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        rotation: 0,
        opacity: 1
      },
      zIndex: index + 1,
      content: {
        text: this.generateTextContent(index),
        color: '#1f2937',
        fontSize: this.determineFontSize(this.config.target.difficulty),
        fontFamily: this.fontSettings[this.config.parameters.fontStyle].family
      }
    };
  }
  
  private generateShapeObject(index: number, canvasWidth: number, canvasHeight: number) {
    const positions = this.generatePositions(canvasWidth, canvasHeight);
    const position = positions[index % positions.length];
    const shapeTypes = ['rectangle', 'circle', 'triangle', 'star'] as const;
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    
    return {
      id: `shape-${index}`,
      type: 'shape' as const,
      visible: true,
      locked: false,
      position: {
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        rotation: Math.random() * 360,
        opacity: 0.8
      },
      zIndex: index + 1,
      content: {
        shapeType,
        backgroundColor: this.getRandomColor(),
        borderColor: '#000000',
        borderWidth: 2
      }
    };
  }
  
  private generatePositions(canvasWidth: number, canvasHeight: number) {
    const positions = [];
    const margin = 50;
    const gridCols = 3;
    const gridRows = 3;
    
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const x = margin + (col * (canvasWidth - 2 * margin)) / gridCols;
        const y = margin + (row * (canvasHeight - 2 * margin)) / gridRows;
        const width = (canvasWidth - 2 * margin) / gridCols - 20;
        const height = (canvasHeight - 2 * margin) / gridRows - 20;
        
        positions.push({ x, y, width, height });
      }
    }
    
    return positions;
  }
  
  private generateTextContent(index: number): string {
    const texts = [
      'サンプルテキスト',
      'タイトル',
      'サブタイトル',
      '説明文',
      'キャッチコピー',
      'メッセージ',
      'テーマ',
      'コンセプト'
    ];
    
    return texts[index % texts.length];
  }
  
  private determineFontSize(difficulty: string): string {
    const sizes: Record<string, string[]> = {
      beginner: ['2rem', '2.5rem', '3rem'],
      intermediate: ['1.5rem', '2rem', '2.5rem', '3rem', '3.5rem'],
      advanced: ['1rem', '1.5rem', '2rem', '2.5rem', '3rem', '3.5rem', '4rem']
    };
    
    const availableSizes = sizes[difficulty] || sizes.beginner;
    return availableSizes[Math.floor(Math.random() * availableSizes.length)];
  }
  
  private getRandomColor(): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  private generateTags(category: string, style: string): string[] {
    const categoryTags: Record<string, string[]> = {
      gaming: ['ゲーム', 'プレイ', 'バトル', 'アクション'],
      talk: ['トーク', 'おしゃべり', '雑談', 'コミュニケーション'],
      singing: ['歌', 'ミュージック', 'パフォーマンス', '音楽'],
      collaboration: ['コラボ', '協力', 'チーム', 'パートナーシップ'],
      event: ['イベント', 'お祭り', '特別', '記念'],
      custom: ['カスタム', 'オリジナル', 'ユニーク', '特別']
    };
    
    const styleTags: Record<string, string[]> = {
      cute: ['可愛い', 'キュート', 'チャーミング', '愛らしい'],
      cool: ['クール', 'スタイリッシュ', 'モダン', '洗練'],
      elegant: ['エレガント', '上品', '洗練された', '美しい'],
      funny: ['面白い', 'ユーモラス', '楽しい', '愉快'],
      simple: ['シンプル', 'ミニマル', 'クリーン', 'シンプル']
    };
    
    return [
      ...(categoryTags[category] || []),
      ...(styleTags[style] || []),
      '自動生成'
    ];
  }
  
  private estimateTime(objectCount: number, difficulty: string): number {
    const baseTime = objectCount * 2; // オブジェクト1つあたり2分
    const difficultyMultiplier: Record<string, number> = {
      beginner: 1.0,
      intermediate: 1.5,
      advanced: 2.0
    };
    
    return Math.round(baseTime * difficultyMultiplier[difficulty]);
  }
  
  async evaluate(template: ThumbnailTemplate): Promise<GenerationResult['score']> {
    // シンプルな評価ロジック（将来AI評価に置き換え可能）
    const aesthetics = this.evaluateAesthetics(template);
    const usability = this.evaluateUsability(template);
    const uniqueness = this.evaluateUniqueness(template);
    const trendiness = this.evaluateTrendiness(template);
    
    const overall = (aesthetics + usability + uniqueness + trendiness) / 4;
    
    return {
      overall: Math.round(overall),
      aesthetics: Math.round(aesthetics),
      usability: Math.round(usability),
      uniqueness: Math.round(uniqueness),
      trendiness: Math.round(trendiness)
    };
  }
  
  private evaluateAesthetics(template: ThumbnailTemplate): number {
    let score = 50; // ベーススコア
    
    // カラーパレットの評価
    const { primary, secondary, accent } = template.colorPalette;
    if (this.isColorHarmonious(primary, secondary)) score += 10;
    if (this.isColorHarmonious(secondary, accent)) score += 10;
    
    // レイアウトの評価
    const objectCount = template.layout.objects.length;
    if (objectCount >= 3 && objectCount <= 8) score += 15; // 適切なオブジェクト数
    if (objectCount > 8) score -= 10; // 多すぎる
    
    // フォント設定の評価
    if (template.fontSettings.family !== 'Arial, sans-serif') score += 5;
    
    return Math.min(100, Math.max(0, score));
  }
  
  private evaluateUsability(template: ThumbnailTemplate): number {
    let score = 50; // ベーススコア
    
    // オブジェクト数の評価
    const objectCount = template.layout.objects.length;
    if (objectCount >= 2 && objectCount <= 6) score += 20;
    if (objectCount > 6) score -= 15;
    
    // テキストの可読性
    const textObjects = template.layout.objects.filter(obj => obj.type === 'text');
    if (textObjects.length > 0) score += 10;
    
    // 背景の評価
    if (template.layout.background.type === 'color') score += 5;
    
    return Math.min(100, Math.max(0, score));
  }
  
  private evaluateUniqueness(template: ThumbnailTemplate): number {
    let score = 30; // ベーススコア（自動生成なので低め）
    
    // カラーパレットの独自性
    const { primary, secondary, accent } = template.colorPalette;
    if (this.isUniqueColorCombination(primary, secondary, accent)) score += 20;
    
    // レイアウトの独自性
    const objectCount = template.layout.objects.length;
    if (objectCount % 2 === 1) score += 10; // 奇数個のオブジェクト
    
    // フォントの独自性
    if (template.fontSettings.family.includes('serif') || template.fontSettings.family.includes('cursive')) {
      score += 15;
    }
    
    return Math.min(100, Math.max(0, score));
  }
  
  private evaluateTrendiness(template: ThumbnailTemplate): number {
    let score = 40; // ベーススコア
    
    // 現在のトレンドを考慮（簡易版）
    const currentYear = new Date().getFullYear();
    const isRecent = template.createdAt ? new Date(template.createdAt).getFullYear() === currentYear : false;
    if (isRecent) score += 10;
    
    // モダンなフォント
    if (template.fontSettings.family.includes('Inter') || template.fontSettings.family.includes('Roboto')) {
      score += 15;
    }
    
    // ミニマルなデザイン
    const objectCount = template.layout.objects.length;
    if (objectCount <= 4) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }
  
  private isColorHarmonious(color1: string, color2: string): boolean {
    // 簡易的な色の調和チェック
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const distance = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
    return distance > 100 && distance < 300; // 適度な距離
  }
  
  private isUniqueColorCombination(primary: string, secondary: string, accent: string): boolean {
    // 簡易的な色の組み合わせの独自性チェック
    const colors = [primary, secondary, accent];
    const uniqueColors = new Set(colors);
    return uniqueColors.size === 3; // 全て異なる色
  }
  
  private generateSuggestions(template: ThumbnailTemplate, score: GenerationResult['score']): string[] {
    const suggestions = [];
    
    if (score.aesthetics < 70) {
      suggestions.push('カラーパレットの調整を検討してください');
      suggestions.push('オブジェクトの配置バランスを改善してください');
    }
    
    if (score.usability < 70) {
      suggestions.push('テキストの可読性を向上させてください');
      suggestions.push('オブジェクト数を適切な範囲に調整してください');
    }
    
    if (score.uniqueness < 60) {
      suggestions.push('より独自性のあるデザイン要素を追加してください');
      suggestions.push('カラーパレットの組み合わせを変更してください');
    }
    
    if (score.trendiness < 60) {
      suggestions.push('モダンなフォントを使用してください');
      suggestions.push('ミニマルなデザインを心がけてください');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('バランスの取れた良いテンプレートです');
    }
    
    return suggestions;
  }
}

// AI生成器（将来実装予定）
export class AIGenerator extends TemplateGenerator {
  private apiEndpoint: string;
  private apiKey: string;
  
  constructor(config: AutoGenerationConfig, apiEndpoint: string, apiKey: string) {
    super(config);
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
  }
  
  async generate(): Promise<GenerationResult> {
    const startTime = Date.now();
    
    if (!this.validateConfig()) {
      throw new Error('Invalid configuration');
    }
    
    // AI API呼び出し（将来実装）
    const template = await this.callAIAPI();
    const score = await this.evaluate(template);
    const generationTime = Date.now() - startTime;
    
    return {
      template,
      score,
      metadata: {
        generationTime,
        algorithm: 'ai-powered',
        version: '1.0.0'
      },
      suggestions: this.generateSuggestions(template, score)
    };
  }
  
  private async callAIAPI(): Promise<ThumbnailTemplate> {
    // 将来のAI API呼び出し実装
    throw new Error('AI generation not yet implemented');
  }
  
  async evaluate(template: ThumbnailTemplate): Promise<GenerationResult['score']> {
    // AI評価（将来実装）
    return {
      overall: 85,
      aesthetics: 90,
      usability: 80,
      uniqueness: 85,
      trendiness: 90
    };
  }
  
  private generateSuggestions(template: ThumbnailTemplate, score: GenerationResult['score']): string[] {
    return ['AI生成による高品質なテンプレートです'];
  }
}

// 生成器ファクトリー
export class TemplateGeneratorFactory {
  static createGenerator(
    type: 'rule-based' | 'ai-powered',
    config: AutoGenerationConfig,
    options?: { apiEndpoint?: string; apiKey?: string }
  ): TemplateGenerator {
    switch (type) {
      case 'rule-based':
        return new RuleBasedGenerator(config);
      case 'ai-powered':
        if (!options?.apiEndpoint || !options?.apiKey) {
          throw new Error('API endpoint and key required for AI generator');
        }
        return new AIGenerator(config, options.apiEndpoint, options.apiKey);
      default:
        throw new Error(`Unknown generator type: ${type}`);
    }
  }
}

// デフォルト設定
export const DEFAULT_AUTO_GENERATION_CONFIG: AutoGenerationConfig = {
  target: {
    category: 'custom',
    style: 'simple',
    aspectRatio: '16:9',
    difficulty: 'beginner'
  },
  parameters: {
    objectCount: {
      min: 2,
      max: 8,
      preferred: 4
    },
    colorScheme: 'complementary',
    fontStyle: 'modern',
    layoutType: 'centered'
  },
  constraints: {
    maxTextLength: 50,
    minObjectSize: 20,
    maxObjectSize: 400,
    allowOverlap: false,
    requireBalance: true
  },
  quality: {
    complexity: 'medium',
    uniqueness: 'medium',
    trendiness: 'medium'
  }
};
