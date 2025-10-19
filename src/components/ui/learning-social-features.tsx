'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLearningSystem } from '@/hooks/use-learning-system';
import { useSocialFeature } from '@/hooks/use-social-feature';
import { Brain, Users, TrendingUp, Clock, Star, Share2, Eye, Settings, ChevronRight, Target, BarChart3, Calendar, Edit3, Save, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LearningInsights() {
  const { insights, getProductivityInsights, getToolDisplayName } = useLearningSystem();
  const productivityInsights = getProductivityInsights();
  const [activeTab, setActiveTab] = React.useState('overview');

  // ダミーデータ（実際の実装ではAPIから取得）
  const [userGoals, setUserGoals] = React.useState({
    weeklyHours: 80,
    currentHours: 72,
    productivityTarget: 85,
    currentProductivity: insights.productivityScore
  });

  const [isEditingGoals, setIsEditingGoals] = React.useState(false);

  const handleGoalChange = (field: keyof typeof userGoals, value: number) => {
    setUserGoals(prev => ({ ...prev, [field]: value }));
  };

  const saveGoals = () => {
    // 実際の実装ではAPIに保存
    setIsEditingGoals(false);
  };

  const weeklyTrend = [
    { day: '月', hours: 12, productivity: 78 },
    { day: '火', hours: 15, productivity: 82 },
    { day: '水', hours: 8, productivity: 75 },
    { day: '木', hours: 18, productivity: 88 },
    { day: '金', hours: 14, productivity: 85 },
    { day: '土', hours: 5, productivity: 70 },
    { day: '日', hours: 0, productivity: 0 }
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2 text-[#20B2AA] mb-2">
          <Brain className="h-5 w-5" />
          学習インサイト
        </h3>
        <p className="text-sm text-gray-400">
          あなたの使用パターンから得られた洞察
        </p>
      </div>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/80 backdrop-blur-sm border border-gray-600/50">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[#20B2AA] data-[state=active]:text-white hover:text-[#20B2AA]"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              概要
            </TabsTrigger>
            <TabsTrigger 
              value="goals" 
              className="data-[state=active]:bg-[#20B2AA] data-[state=active]:text-white hover:text-[#20B2AA]"
            >
              <Target className="h-4 w-4 mr-2" />
              目標
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-[#20B2AA] data-[state=active]:text-white hover:text-[#20B2AA]"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              履歴
            </TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* 生産性スコア */}
            <div className="bg-gradient-to-r from-[#20B2AA]/20 to-[#1a9b94]/20 border border-[#20B2AA]/30 rounded-lg p-4 space-y-3 hover:shadow-lg hover:shadow-[#20B2AA]/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#20B2AA]" />
                  <div>
                    <span className="text-lg font-semibold text-[#20B2AA]">生産性スコア</span>
                    <p className="text-xs text-gray-400">過去7日間のツール使用効率</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{insights.productivityScore}</span>
                  <span className="text-sm text-gray-300 ml-1">/100</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[#20B2AA] to-[#1a9b94] h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${insights.productivityScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

                {/* お気に入りツール */}
                {insights.favoriteTools.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium flex items-center gap-2 text-[#20B2AA]">
                        <Star className="h-4 w-4" />
                        よく使用するツール
                      </h4>
                      <span className="text-xs text-gray-400">過去30日間</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {insights.favoriteTools.slice(0, 3).map((toolId, index) => (
                        <Badge key={toolId} variant="secondary" className="text-xs hover:bg-[#20B2AA]/20 hover:text-[#20B2AA] transition-colors cursor-pointer">
                          {index + 1}. {getToolDisplayName(toolId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

            {/* ピーク使用時間 */}
            {insights.peakUsageTimes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-[#20B2AA]">
                    <Clock className="h-4 w-4" />
                    最も活発な時間帯
                  </h4>
                  <span className="text-xs text-gray-400">過去30日間</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insights.peakUsageTimes.map((timeSlot) => (
                    <Badge key={timeSlot} variant="outline" className="text-xs hover:bg-[#20B2AA]/10 hover:text-[#20B2AA] hover:border-[#20B2AA] transition-colors cursor-pointer">
                      {timeSlot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

                {/* 推奨事項 */}
                {insights.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-[#20B2AA]">
                      <TrendingUp className="h-4 w-4" />
                      推奨事項
                    </h4>
                    <ul className="space-y-2">
                      {insights.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                          <span className="text-[#20B2AA] mt-1 font-bold">•</span>
                          <div className="flex-1">
                            <span className="font-medium">{recommendation.title}</span>
                            {recommendation.description && (
                              <p className="text-xs text-gray-400 mt-1">{recommendation.description}</p>
                            )}
                          </div>
                          {recommendation.action && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-6 px-2 hover:bg-[#20B2AA]/10 hover:text-[#20B2AA] border-gray-600"
                            >
                              {recommendation.action}
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
          </TabsContent>

              {/* 目標タブ */}
              <TabsContent value="goals" className="space-y-4 mt-4">
                {/* 目標設定セクション */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-[#20B2AA]">
                      <Target className="h-4 w-4" />
                      目標との比較
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingGoals(!isEditingGoals)}
                      className="text-xs h-7 px-2 hover:bg-[#20B2AA]/10 hover:text-[#20B2AA] border-gray-600"
                    >
                      {isEditingGoals ? (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          キャンセル
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-3 w-3 mr-1" />
                          編集
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4 space-y-3">
                    {/* 週間時間目標 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">週間時間目標</span>
                        {isEditingGoals ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={userGoals.weeklyHours}
                              onChange={(e) => handleGoalChange('weeklyHours', parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-[#20B2AA] focus:outline-none"
                              min="1"
                              max="168"
                            />
                            <span className="text-white">時間</span>
                          </div>
                        ) : (
                          <span className="text-white">{userGoals.weeklyHours}時間</span>
                        )}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#20B2AA] to-[#1a9b94] h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((userGoals.currentHours / userGoals.weeklyHours) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>実績: {userGoals.currentHours}時間</span>
                        <span>達成率: {Math.round((userGoals.currentHours / userGoals.weeklyHours) * 100)}%</span>
                      </div>
                    </div>

                    {/* 生産性目標 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">生産性目標</span>
                        {isEditingGoals ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={userGoals.productivityTarget}
                              onChange={(e) => handleGoalChange('productivityTarget', parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-[#20B2AA] focus:outline-none"
                              min="1"
                              max="100"
                            />
                            <span className="text-white">/100</span>
                          </div>
                        ) : (
                          <span className="text-white">{userGoals.productivityTarget}/100</span>
                        )}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#20B2AA] to-[#1a9b94] h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((userGoals.currentProductivity / userGoals.productivityTarget) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>現在: {userGoals.currentProductivity}/100</span>
                        <span>達成率: {Math.round((userGoals.currentProductivity / userGoals.productivityTarget) * 100)}%</span>
                      </div>
                    </div>

                    {/* 保存ボタン */}
                    {isEditingGoals && (
                      <div className="flex justify-end pt-2 border-t border-gray-700">
                        <Button
                          size="sm"
                          onClick={saveGoals}
                          className="text-xs h-7 px-3 bg-[#20B2AA] hover:bg-[#1a9b94] text-white"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          保存
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

          {/* 履歴タブ */}
          <TabsContent value="history" className="space-y-4 mt-4">
            {/* 履歴・トレンドセクション */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2 text-[#20B2AA]">
                <BarChart3 className="h-4 w-4" />
                週間トレンド
              </h4>
              <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4">
                <div className="space-y-3">
                  {weeklyTrend.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300 w-6">{day.day}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-16 bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-[#20B2AA] h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${(day.hours / 20) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400">{day.hours}h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-[#20B2AA] to-[#1a9b94] h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${day.productivity}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400">{day.productivity}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>上段: 使用時間</span>
                    <span>下段: 生産性</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export function SocialFeatures() {
  const { profiles, getOnlineVTubers, getRecommendedCollaborations } = useSocialFeature();
  const onlineVTubers = getOnlineVTubers();
  const recommendedCollaborations = getRecommendedCollaborations();

  return (
    <div className="space-y-6">
      {/* オンラインVTuber */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            オンラインVTuber
          </CardTitle>
          <CardDescription>
            現在アクティブなVTuber
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {onlineVTubers.map((vtuber) => {
              // カテゴリ別アイコンの統一
              const getCategoryIcon = (specialty: string) => {
                if (specialty.includes('歌') || specialty.includes('音楽')) return '🎵';
                if (specialty.includes('ゲーム') || specialty.includes('ゲーム配信')) return '🎮';
                if (specialty.includes('アート') || specialty.includes('絵')) return '🎨';
                return '🎭';
              };
              
              return (
                <div key={vtuber.id} className="flex items-center space-x-3 p-3 bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/60 transition-colors rounded-lg">
                  <div className="text-2xl">{getCategoryIcon(vtuber.specialty)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate text-white">{vtuber.name}</h4>
                    <p className="text-xs text-gray-300 truncate">{vtuber.specialty}</p>
                    <p className="text-xs text-[#20B2AA]">
                      {vtuber.followerCount.toLocaleString()}フォロワー
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-400">オンライン</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs hover:bg-[#20B2AA]/10 hover:text-[#20B2AA] hover:border-[#20B2AA]">
                      <Share2 className="h-3 w-3 mr-1" />
                      共有
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {/* 空きスペースに統計情報を追加 */}
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 rounded-lg p-3 hover:bg-gray-700/60 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📊</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-white">統計情報</h4>
                  <p className="text-xs text-gray-300">総フォロワー数</p>
                  <p className="text-xs text-[#20B2AA]">
                    {onlineVTubers.reduce((sum, vtuber) => sum + vtuber.followerCount, 0).toLocaleString()}フォロワー
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#20B2AA] rounded-full"></div>
                  <span className="text-xs text-[#20B2AA]">集計</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 推奨コラボレーション */}
      {recommendedCollaborations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              推奨コラボレーション
            </CardTitle>
            <CardDescription>
              参加可能なコラボレーション
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedCollaborations.map((collab) => (
                <div key={collab.id} className="p-4 border border-gray-600/50 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/60 transition-colors rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1 text-white">{collab.title}</h4>
                      <p className="text-xs text-gray-300 mb-2">{collab.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {collab.participants.length}人参加
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {collab.tools.length}ツール使用
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      参加する
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
