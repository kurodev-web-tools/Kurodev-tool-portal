"use client";

import { useMemo } from "react";

interface Tool {
  id: string;
  title: string;
  description: string;
  status: 'released' | 'beta' | 'development';
  href: string;
  iconName?: string;
  color?: string;
}

interface Suite {
  id: string;
  title: string;
  description: string;
  status: 'released' | 'beta' | 'development';
  href?: string;
  iconName?: string;
  color?: string;
  stats?: string;
}

interface UseStatsOptions {
  tools: Tool[];
  suites: Suite[];
}

export function useStats({ tools, suites }: UseStatsOptions) {
  const stats = useMemo(() => {
    // ツール統計
    const totalTools = tools.length;
    const availableTools = tools.filter(tool => tool.status === 'released').length;
    const betaTools = tools.filter(tool => tool.status === 'beta').length;
    const developmentTools = tools.filter(tool => tool.status === 'development').length;

    // スイート統計
    const totalSuites = suites.length;
    const availableSuites = suites.filter(suite => suite.status === 'released').length;
    const betaSuites = suites.filter(suite => suite.status === 'beta').length;
    const developmentSuites = suites.filter(suite => suite.status === 'development').length;

    // 進捗率計算
    const toolProgress = totalTools > 0 ? Math.round((availableTools / totalTools) * 100) : 0;
    const suiteProgress = totalSuites > 0 ? Math.round((availableSuites / totalSuites) * 100) : 0;

    // 最近追加されたツール（開発中ツールを最近として扱う）
    const recentTools = tools
      .filter(tool => tool.status === 'development')
      .slice(0, 3);

    // よく使われるツール（ベータ版をよく使われるとして扱う）
    const popularTools = tools
      .filter(tool => tool.status === 'beta')
      .slice(0, 3);

    return {
      // 基本統計
      totalTools,
      availableTools,
      betaTools,
      developmentTools,
      totalSuites,
      availableSuites,
      betaSuites,
      developmentSuites,
      
      // 進捗統計
      toolProgress,
      suiteProgress,
      
      // 追加情報
      recentTools,
      popularTools,
      
      // 計算された統計
      totalItems: totalTools + totalSuites,
      completionRate: (totalTools + totalSuites) > 0 ? Math.round(((availableTools + availableSuites) / (totalTools + totalSuites)) * 100) : 0
    };
  }, [tools, suites]);

  return stats;
}
