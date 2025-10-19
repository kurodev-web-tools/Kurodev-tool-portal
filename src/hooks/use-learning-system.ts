'use client';

import { useEffect, useState, useCallback } from 'react';

interface UsagePattern {
  toolId: string;
  timestamp: number;
  duration: number; // 使用時間（分）
  context: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number; // 0-6 (日曜日-土曜日)
  frequency: number; // 使用頻度
}

interface LearningInsights {
  favoriteTools: string[];
  peakUsageTimes: string[];
  weeklyPatterns: Record<string, number>;
  recommendations: Array<{ title: string; description?: string; action?: string }>;
  productivityScore: number;
}

interface LearningSystem {
  insights: LearningInsights;
  trackUsage: (toolId: string, duration?: number) => void;
  getRecommendations: () => Array<{ title: string; description?: string; action?: string }>;
  getProductivityInsights: () => string[];
  getToolDisplayName: (toolId: string) => string;
}

const STORAGE_KEY = 'vtuber-tools-usage-patterns';

export function useLearningSystem(): LearningSystem {
  const [insights, setInsights] = useState<LearningInsights>({
    favoriteTools: [],
    peakUsageTimes: [],
    weeklyPatterns: {},
    recommendations: [],
    productivityScore: 0,
  });

  // 使用パターンを保存
  const saveUsagePattern = useCallback((pattern: UsagePattern) => {
    if (typeof window !== 'undefined') {
      const existingPatterns = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      );
      
      // 既存のパターンを更新または新しいパターンを追加
      const existingIndex = existingPatterns.findIndex(
        (p: UsagePattern) => p.toolId === pattern.toolId
      );
      
      if (existingIndex >= 0) {
        existingPatterns[existingIndex] = {
          ...existingPatterns[existingIndex],
          frequency: existingPatterns[existingIndex].frequency + 1,
          timestamp: pattern.timestamp,
          duration: pattern.duration,
        };
      } else {
        existingPatterns.push(pattern);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPatterns));
      analyzePatterns(existingPatterns);
    }
  }, []);

  // パターンを分析してインサイトを生成
  const analyzePatterns = useCallback((patterns: UsagePattern[]) => {
    if (patterns.length === 0) return;

    // お気に入りツールを計算
    const toolFrequency = patterns.reduce((acc, pattern) => {
      acc[pattern.toolId] = (acc[pattern.toolId] || 0) + pattern.frequency;
      return acc;
    }, {} as Record<string, number>);

    const favoriteTools = Object.entries(toolFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([toolId]) => toolId);

    // ピーク使用時間を計算
    const timeFrequency = patterns.reduce((acc, pattern) => {
      const hour = new Date(pattern.timestamp).getHours();
      const timeSlot = getTimeSlot(hour);
      acc[timeSlot] = (acc[timeSlot] || 0) + pattern.frequency;
      return acc;
    }, {} as Record<string, number>);

    const peakUsageTimes = Object.entries(timeFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([timeSlot]) => timeSlot);

    // 週間パターンを計算
    const weeklyPatterns = patterns.reduce((acc, pattern) => {
      const dayName = getDayName(pattern.dayOfWeek);
      acc[dayName] = (acc[dayName] || 0) + pattern.frequency;
      return acc;
    }, {} as Record<string, number>);

    // 推奨事項を生成
    const recommendations = generateRecommendations(
      favoriteTools,
      peakUsageTimes,
      weeklyPatterns
    );

    // 生産性スコアを計算
    const productivityScore = calculateProductivityScore(patterns);

    setInsights({
      favoriteTools,
      peakUsageTimes,
      weeklyPatterns,
      recommendations,
      productivityScore,
    });
  }, []);

  // 使用を追跡
  const trackUsage = useCallback((toolId: string, duration: number = 5) => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const pattern: UsagePattern = {
      toolId,
      timestamp: now.getTime(),
      duration,
      context: getTimeContext(hour),
      dayOfWeek,
      frequency: 1,
    };

    saveUsagePattern(pattern);
  }, [saveUsagePattern]);

  // 推奨事項を取得
  const getRecommendations = useCallback(() => {
    return insights.recommendations;
  }, [insights.recommendations]);

  // 生産性インサイトを取得
  const getProductivityInsights = useCallback(() => {
    const productivityInsights: string[] = [];
    
    if (insights.productivityScore > 80) {
      productivityInsights.push('素晴らしい生産性を維持しています！');
    } else if (insights.productivityScore > 60) {
      productivityInsights.push('良いペースで作業を進めています。');
    } else {
      productivityInsights.push('ツールの使用頻度を上げてみませんか？');
    }

    if (insights.favoriteTools.length > 0) {
      productivityInsights.push(`最も使用しているツール: ${insights.favoriteTools[0]}`);
    }

    if (insights.peakUsageTimes.length > 0) {
      productivityInsights.push(`最も活発な時間帯: ${insights.peakUsageTimes[0]}`);
    }

    return productivityInsights;
  }, [insights]);

  // 初期化時に既存のパターンを読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingPatterns = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      );
      analyzePatterns(existingPatterns);
    }
  }, [analyzePatterns]);

  return {
    insights,
    trackUsage,
    getRecommendations,
    getProductivityInsights,
    getToolDisplayName,
  };
}

// ヘルパー関数
function getTimeSlot(hour: number): string {
  if (hour >= 6 && hour < 12) return '朝 (6-12時)';
  if (hour >= 12 && hour < 18) return '午後 (12-18時)';
  if (hour >= 18 && hour < 22) return '夕方 (18-22時)';
  return '夜 (22-6時)';
}

function getTimeContext(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function getDayName(dayOfWeek: number): string {
  const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
  return days[dayOfWeek];
}

// ツールIDを日本語名にマッピング
const toolNameMap: Record<string, string> = {
  'suite-1': '企画・準備支援スイート',
  'suite-2': '配信・動画制作スイート',
  'suite-3': 'データ分析・マーケティングスイート',
  'suite-4': 'ファンサービス・交流スイート',
  'suite-5': 'アイデンティティ・ブランディングスイート',
  'calendar': 'スケジュール管理ツール',
  'brain': '企画・台本サポートAI',
  'image': 'イラスト素材テンプレート',
  'sparkles': '配信効果音・BGM',
  'trending-up': 'データ分析ダッシュボード',
};

function getToolDisplayName(toolId: string): string {
  return toolNameMap[toolId] || toolId;
}

function generateRecommendations(
  favoriteTools: string[],
  peakUsageTimes: string[],
  weeklyPatterns: Record<string, number>
): Array<{ title: string; description?: string; action?: string }> {
  const recommendations: Array<{ title: string; description?: string; action?: string }> = [];

  if (favoriteTools.length > 0) {
    const toolName = getToolDisplayName(favoriteTools[0]);
    recommendations.push({
      title: `${toolName}をより効率的に使用する方法を探してみませんか？`,
      description: 'このツールの詳細な使い方や応用テクニックを確認できます',
      action: '詳細を見る'
    });
  }

  if (peakUsageTimes.length > 0) {
    recommendations.push({
      title: `${peakUsageTimes[0]}に集中して作業することをお勧めします。`,
      description: 'この時間帯に最も生産性が高くなる傾向があります',
      action: 'スケジュール設定'
    });
  }

  const mostActiveDay = Object.entries(weeklyPatterns)
    .sort(([, a], [, b]) => b - a)[0];
  
  if (mostActiveDay) {
    recommendations.push({
      title: `${mostActiveDay[0]}が最も生産的な日です。`,
      description: 'この日のパターンを他の日にも応用してみましょう',
      action: 'パターン分析'
    });
  }

  return recommendations;
}

function calculateProductivityScore(patterns: UsagePattern[]): number {
  if (patterns.length === 0) return 0;

  const totalFrequency = patterns.reduce((sum, pattern) => sum + pattern.frequency, 0);
  const averageDuration = patterns.reduce((sum, pattern) => sum + pattern.duration, 0) / patterns.length;
  
  // 使用頻度と平均使用時間に基づいてスコアを計算
  const frequencyScore = Math.min(totalFrequency * 10, 50);
  const durationScore = Math.min(averageDuration * 2, 30);
  const diversityScore = Math.min(patterns.length * 5, 20);

  return Math.round(frequencyScore + durationScore + diversityScore);
}
