'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Users, Settings, Edit, Plus, Copy, Mail, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProjectDetailClientProps {
  project: any;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  // 時間をフォーマットする関数
  const formatTime = (time: string) => {
    return time;
  };

  // 時間差を計算する関数（分）
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;
    return end - start;
  };

  // スケジュールが空の場合の処理
  const hasSchedules = project.schedules && project.schedules.length > 0;

  // 参加者リストの取得（ダミーデータまたは空配列）
  const participantList = project.participantList || [];

  // 招待リンクをコピーする関数
  const handleCopyInviteLink = async () => {
    const inviteLink = project.inviteLink || `https://example.com/invite/project-${project.id}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteLinkCopied(true);
      toast.success('招待リンクをコピーしました', {
        description: 'DiscordやXなどで参加者に共有できます',
      });
      setTimeout(() => setInviteLinkCopied(false), 2000);
    } catch (err) {
      toast.error('コピーに失敗しました');
    }
  };

  // 参加者のステータスバッジを取得する関数
  const getParticipantStatusBadge = (status: string) => {
    switch (status) {
      case 'linked':
        return (
          <Badge className="bg-[#0070F3] text-white text-xs font-medium">
            連携済み
          </Badge>
        );
      case 'manual':
        return (
          <Badge className="bg-[#0070F3] text-white text-xs font-medium">
            入力済み
          </Badge>
        );
      case 'not_linked':
      default:
        return (
          <Badge className="bg-[#4A4A4A] text-[#E0E0E0] text-xs font-medium">
            未連携
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-[#E0E0E0] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#E0E0E0] break-words">{project.name}</h1>
            {project.description && (
              <p className="text-sm sm:text-base text-[#A0A0A0] mt-1 break-words">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            className={
              project.status === 'active'
                ? 'bg-[#0070F3] text-white text-xs font-medium'
                : 'bg-[#4A4A4A] text-[#E0E0E0] text-xs font-medium'
            }
          >
            {project.status === 'active' ? '進行中' : '完了'}
          </Badge>
          <Button 
            variant="outline"
            onClick={() => toast.info('この機能は今後実装予定です')}
            className="border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
          >
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* プロジェクト情報 */}
          <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E0E0E0]">
                <Calendar className="h-5 w-5" />
                プロジェクト情報
              </CardTitle>
              <CardDescription className="text-[#A0A0A0]">
                プロジェクトの基本情報を確認できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-[#1A1A1A] rounded-lg border border-[#4A4A4A]">
                  <Clock className="h-5 w-5 text-[#0070F3] mt-0.5" />
                  <div>
                    <label className="text-xs font-medium text-[#A0A0A0] mb-1.5 block">配信時間</label>
                    <p className="text-base font-semibold text-[#E0E0E0]">
                      {project.duration}分
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#1A1A1A] rounded-lg border border-[#4A4A4A]">
                  <Users className="h-5 w-5 text-[#0070F3] mt-0.5" />
                  <div>
                    <label className="text-xs font-medium text-[#A0A0A0] mb-1.5 block">参加者数</label>
                    <p className="text-base font-semibold text-[#E0E0E0]">
                      {project.participants}人
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#4A4A4A]">
                <div>
                  <label className="text-xs font-medium text-[#A0A0A0] mb-1.5 block">作成日</label>
                  <p className="text-sm text-[#E0E0E0]">{project.createdAt}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#A0A0A0] mb-1.5 block">更新日</label>
                  <p className="text-sm text-[#E0E0E0]">
                    {project.updatedAt !== project.createdAt ? project.updatedAt : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 参加者管理 */}
          <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#E0E0E0] flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  参加者管理
                </CardTitle>
                <CardDescription className="text-[#A0A0A0]">
                  {participantList.length > 0 
                    ? `${participantList.length}人の参加者`
                    : '参加者を追加してコラボを始めましょう'
                  }
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info('この機能は今後実装予定です')}
                className="border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
              >
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 招待リンクセクション */}
              <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#4A4A4A]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#E0E0E0]">招待リンク</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyInviteLink}
                    className="h-7 px-2 border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
                  >
                    <Copy className={`h-3 w-3 mr-1 ${inviteLinkCopied ? 'text-green-400' : ''}`} />
                    {inviteLinkCopied ? 'コピー済み' : 'コピー'}
                  </Button>
                </div>
                <div className="flex items-center gap-2 p-2 bg-[#0F0F0F] rounded border border-[#4A4A4A]">
                  <Mail className="h-4 w-4 text-[#808080]" />
                  <code className="text-xs text-[#A0A0A0] flex-1 truncate">
                    {project.inviteLink || `https://example.com/invite/project-${project.id}`}
                  </code>
                </div>
                <p className="text-xs text-[#808080] mt-2">
                  このリンクをDiscordやXなどで参加者に共有してください
                </p>
              </div>

              {/* 参加者リスト */}
              {participantList.length > 0 ? (
                <div className="space-y-2">
                  {participantList.map((participant: any) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-[#4A4A4A] hover:bg-[#2D2D2D] transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* アバター（アイコン） */}
                        <div className="flex-shrink-0">
                          {participant.avatar ? (
                            <img
                              src={participant.avatar}
                              alt={participant.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#4A4A4A] flex items-center justify-center">
                              <UserCircle className="h-6 w-6 text-[#808080]" />
                            </div>
                          )}
                        </div>
                        
                        {/* 参加者情報 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-[#E0E0E0] truncate">{participant.name}</p>
                            {getParticipantStatusBadge(participant.status)}
                          </div>
                          {participant.email && (
                            <p className="text-xs text-[#A0A0A0] truncate">{participant.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#4A4A4A] rounded-lg bg-[#1A1A1A]">
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#2D2D2D] border-2 border-[#4A4A4A] flex items-center justify-center mb-4 mx-auto">
                      <Users className="w-8 h-8 text-[#0070F3]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#E0E0E0] mb-2">参加者がいません</h3>
                    <p className="text-sm text-[#A0A0A0] mb-1 max-w-sm mx-auto px-4">
                      招待リンクを共有するか、参加者を手動で追加してください
                    </p>
                    <p className="text-xs text-[#808080] max-w-sm mx-auto px-4">
                      コラボ配信には参加者の登録が必要です
                    </p>
                  </div>
                  <Button
                    variant="default"
                    onClick={() => toast.info('この機能は今後実装予定です')}
                    size="lg"
                    className="bg-[#0070F3] hover:bg-[#0051CC] text-white"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    参加者を追加
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* スケジュール */}
          <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#E0E0E0]">スケジュール</CardTitle>
                <CardDescription className="text-[#A0A0A0]">
                  配信の詳細スケジュール
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info('この機能は今後実装予定です')}
                className="border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
              >
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            </CardHeader>
            <CardContent>
              {hasSchedules ? (
                <div className="space-y-4">
                  {/* タイムライン表示 */}
                  {project.schedules.map((schedule: any, index: number) => {
                    const duration = calculateDuration(schedule.startTime, schedule.endTime);
                    const colors = [
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-purple-500',
                      'bg-orange-500',
                      'bg-pink-500',
                    ];
                    const dotColor = colors[index % colors.length];
                    
                    return (
                      <div key={schedule.id} className="relative">
                        {/* タイムラインの線（最後の要素以外） */}
                        {index < project.schedules.length - 1 && (
                          <div className="absolute left-3 top-12 bottom-0 w-0.5 bg-[#4A4A4A] z-0" />
                        )}
                        
                        {/* スケジュールカード */}
                        <div className="relative border border-[#4A4A4A] rounded-lg p-4 bg-[#1A1A1A] hover:bg-[#2D2D2D] transition-colors">
                          <div className="flex items-start gap-3">
                            {/* タイムラインドット */}
                            <div className={`w-6 h-6 rounded-full ${dotColor} flex-shrink-0 flex items-center justify-center mt-1 z-10 relative`}>
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* タイトル */}
                              <h3 className="font-semibold text-[#E0E0E0] text-lg mb-3">{schedule.title}</h3>
                              
                              {/* 時間帯（視認性向上） */}
                              <div className="flex items-center gap-2 mb-3 p-2 bg-[#2D2D2D] rounded-md border border-[#4A4A4A]">
                                <Clock className="h-4 w-4 text-[#0070F3] flex-shrink-0" />
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-[#E0E0E0] text-sm">
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                  <span className="text-xs text-[#A0A0A0] font-medium">
                                    ({duration}分)
                                  </span>
                                </div>
                              </div>
                              
                              {/* 説明 */}
                              {schedule.description && (
                                <p className="text-sm text-[#A0A0A0] mb-3 leading-relaxed">{schedule.description}</p>
                              )}
                              
                              {/* 参加者（配置改善） */}
                              {schedule.participants && schedule.participants.length > 0 && (
                                <div className="flex items-start gap-2 pt-2 border-t border-[#4A4A4A]">
                                  <Users className="h-4 w-4 text-[#A0A0A0] mt-0.5 flex-shrink-0" />
                                  <div className="flex gap-2 flex-wrap">
                                    {schedule.participants.map((participant: string, pIndex: number) => (
                                      <Badge 
                                        key={pIndex} 
                                        variant="outline" 
                                        className="text-xs bg-[#2D2D2D] border-[#4A4A4A] text-[#E0E0E0] font-medium px-2 py-1"
                                      >
                                        {participant}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[#4A4A4A] rounded-lg bg-[#1A1A1A]">
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#2D2D2D] border-2 border-[#4A4A4A] flex items-center justify-center mb-4 mx-auto">
                      <Calendar className="w-8 h-8 text-[#0070F3]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#E0E0E0] mb-2">スケジュールがありません</h3>
                    <p className="text-sm text-[#A0A0A0] mb-1 max-w-sm mx-auto px-4">
                      最初のスケジュールを追加して配信の準備を始めましょう
                    </p>
                    <p className="text-xs text-[#808080] max-w-sm mx-auto px-4">
                      配信準備やメイン配信などのスケジュールを追加できます
                    </p>
                  </div>
                  <Button
                    variant="default"
                    onClick={() => toast.info('この機能は今後実装予定です')}
                    size="lg"
                    className="bg-[#0070F3] hover:bg-[#0051CC] text-white"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    スケジュールを追加
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-4 sm:space-y-6">
          {/* 設定 */}
          <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E0E0E0]">
                <Settings className="h-5 w-5" />
                設定
              </CardTitle>
              <CardDescription className="text-[#A0A0A0]">
                プロジェクトの設定を確認できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#4A4A4A]">
                <label className="text-xs font-medium text-[#A0A0A0] mb-1.5 block">タイムゾーン</label>
                <p className="text-sm font-medium text-[#E0E0E0]">{project.settings.timezone}</p>
              </div>
              <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#4A4A4A]">
                <label className="text-xs font-medium text-[#A0A0A0] mb-1.5 block">バッファ時間</label>
                <p className="text-sm font-medium text-[#E0E0E0]">{project.settings.bufferTime}分</p>
              </div>
              <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#4A4A4A]">
                <label className="text-xs font-medium text-[#A0A0A0] mb-1.5 block">自動調整</label>
                <Badge 
                  variant={project.settings.autoAdjust ? 'default' : 'secondary'}
                  className={
                    project.settings.autoAdjust
                      ? 'bg-[#0070F3] text-white mt-1 font-medium'
                      : 'bg-[#4A4A4A] text-[#E0E0E0] mt-1 font-medium'
                  }
                >
                  {project.settings.autoAdjust ? '有効' : '無効'}
                </Badge>
              </div>
              <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#4A4A4A]">
                <label className="text-xs font-medium text-[#A0A0A0] mb-1.5 block">通知</label>
                <Badge 
                  variant={project.settings.notifications ? 'default' : 'secondary'}
                  className={
                    project.settings.notifications
                      ? 'bg-[#0070F3] text-white mt-1 font-medium'
                      : 'bg-[#4A4A4A] text-[#E0E0E0] mt-1 font-medium'
                  }
                >
                  {project.settings.notifications ? '有効' : '無効'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* アクション */}
          <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#E0E0E0]">アクション</CardTitle>
                  <CardDescription className="text-[#A0A0A0]">
                    プロジェクトの管理操作
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-[#4A4A4A] text-[#A0A0A0] text-xs">
                  準備中
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 主要アクション */}
              <div className="pb-2 border-b border-[#4A4A4A]">
                <Button 
                  variant="default"
                  className="w-full bg-[#0070F3] hover:bg-[#0051CC] text-white h-11"
                  onClick={() => toast.info('この機能は今後実装予定です', {
                    description: 'スケジュールの追加・編集機能は開発中です',
                  })}
                >
                  <Edit className="h-5 w-5 mr-2" />
                  <span className="font-medium">スケジュール編集</span>
                </Button>
              </div>
              
              {/* その他のアクション */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A] h-10"
                  onClick={() => toast.info('この機能は今後実装予定です', {
                    description: '参加者の追加・削除・管理機能は開発中です',
                  })}
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span>参加者管理</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A] h-10"
                  onClick={() => toast.info('この機能は今後実装予定です', {
                    description: 'プロジェクト設定の変更機能は開発中です',
                  })}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>設定変更</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
