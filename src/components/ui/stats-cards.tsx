"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Star
} from "lucide-react";

interface StatsCardsProps {
  totalTools: number;
  availableTools: number;
  betaTools: number;
  developmentTools: number;
  totalSuites: number;
  className?: string;
}

export const StatsCards = React.memo(function StatsCards({
  totalTools,
  availableTools,
  betaTools,
  developmentTools,
  totalSuites,
  className = ""
}: StatsCardsProps) {
  const stats = React.useMemo(() => [
    {
      title: "総ツール数",
      value: totalTools,
      icon: Wrench,
      color: "from-blue-500 to-cyan-500",
      description: "利用可能なツールの総数"
    },
    {
      title: "利用可能",
      value: availableTools,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      description: "現在利用可能なツール"
    },
    {
      title: "ベータ版",
      value: betaTools,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      description: "フィードバック募集中"
    },
    {
      title: "開発中",
      value: developmentTools,
      icon: TrendingUp,
      color: "from-red-500 to-pink-500",
      description: "近日公開予定"
    },
    {
      title: "スイート数",
      value: totalSuites,
      icon: Users,
      color: "from-purple-500 to-indigo-500",
      description: "連鎖ツールスイート"
    }
  ], [totalTools, availableTools, betaTools, developmentTools, totalSuites]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card 
          key={stat.title}
          className="bg-gray-900/30 border-gray-800 hover:bg-gray-900/40 card-interactive group"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg hover-scale-sm`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <Badge 
                className={`text-xs ${
                  stat.title === "利用可能" ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  stat.title === "ベータ版" ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  stat.title === "開発中" ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}
              >
                {stat.title === "利用可能" ? "公開済み" : 
                 stat.title === "ベータ版" ? "ベータ" : 
                 stat.title === "開発中" ? "開発中" : "総数"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-smooth">
                  {stat.value}
                </span>
                <span className="text-sm text-gray-300">件</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  color?: string;
  className?: string;
}

export function ProgressCard({
  title,
  current,
  total,
  color = "from-blue-500 to-cyan-500",
  className = ""
}: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Card className={`bg-gray-900/30 border-gray-800 hover:bg-gray-900/40 card-interactive ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-300" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">進捗状況</span>
            <span className="text-white font-medium">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-3 border border-gray-500">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${color} progress-fill shadow-sm`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>{current} / {total} 完了</span>
            <span>{total - current} 件残り</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
