'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { Brain, Key, Zap, Eye } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

const AI_SETTINGS_KEY = "vtuber-tools-ai-settings";

interface AiSettings {
  enableAiFeatures: boolean;
  apiKey: string;
  responseStyle: string;
}

export default function AiSettingsPage() {
  const [settings, setSettings] = useState<AiSettings>({
    enableAiFeatures: true,
    apiKey: "",
    responseStyle: "friendly",
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(AI_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      logger.error('AI設定読み込み失敗', error, 'AiSettingsPage');
      toast.error("AI設定の読み込みに失敗しました。");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
      toast.success("AI設定を保存しました。");
    } catch (error) {
      logger.error('AI設定保存失敗', error, 'AiSettingsPage');
      toast.error("AI設定の保存に失敗しました。");
    }
  };

  const getPreviewText = () => {
    const styles = {
      formal: "ご案内申し上げます。本日は貴重なお時間をいただき、誠にありがとうございます。",
      friendly: "こんにちは！今日もお時間をいただき、ありがとうございます！",
      creative: "✨ ようこそ！今日は特別なひとときを一緒に過ごせそうですね！🎉"
    };
    return styles[settings.responseStyle as keyof typeof styles] || styles.friendly;
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-[#A0A0A0]">AI設定を読み込み中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* AI機能の有効化 */}
      <Card className="bg-[#2D2D2D] border-[#3A3A3A]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#20B2AA]" />
            AI機能の有効化
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            タイトル生成や台本作成などのAIサポート機能を有効にします。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-[#3A3A3A] p-4 bg-[#1A1A1A]">
            <div className="space-y-0.5">
              <Label htmlFor="enable-ai-features" className="text-white">
                AI機能を有効化
              </Label>
              <p className="text-sm text-[#808080]">
                AIによる自動生成機能を使用できます
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="enable-ai-features" 
                checked={settings.enableAiFeatures}
                onCheckedChange={(value) => setSettings(prev => ({...prev, enableAiFeatures: value}))}
              />
              <span className={`text-sm font-medium ${settings.enableAiFeatures ? 'text-[#20B2AA]' : 'text-[#808080]'}`}>
                {settings.enableAiFeatures ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用量ダッシュボード */}
      <Card className="bg-[#2D2D2D] border-[#20B2AA]/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#20B2AA]" />
            API使用状況
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            今月のAPI使用量
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#A0A0A0]">今月の使用量</span>
              <span className="text-sm font-medium text-white">1,250 / 5,000 リクエスト</span>
            </div>
            <Progress value={25} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="rounded-lg border border-[#3A3A3A] p-3 bg-[#1A1A1A]">
              <p className="text-xs text-[#808080] mb-1">今月のリクエスト</p>
              <p className="text-2xl font-bold text-[#20B2AA]">1,250</p>
            </div>
            <div className="rounded-lg border border-[#3A3A3A] p-3 bg-[#1A1A1A]">
              <p className="text-xs text-[#808080] mb-1">残りリクエスト</p>
              <p className="text-2xl font-bold text-white">3,750</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 外部APIキー */}
      <Card className="bg-[#2D2D2D] border-[#3A3A3A]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-[#20B2AA]" />
            外部APIキー
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            より高度な機能を利用するために、外部サービスのAPIキーを設定します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-white">APIキー</Label>
            <div className="relative">
              <Input 
                id="api-key" 
                type={showApiKey ? "text" : "password"}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx" 
                value={settings.apiKey}
                onChange={(e) => setSettings(prev => ({...prev, apiKey: e.target.value}))}
                className="bg-[#1A1A1A] border-[#3A3A3A] text-white placeholder:text-[#808080] pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-[#808080] hover:text-white"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-[#808080]">
              セキュリティのため、APIキーは暗号化して保存されます。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI応答スタイル */}
      <Card className="bg-[#2D2D2D] border-[#3A3A3A]">
        <CardHeader>
          <CardTitle className="text-white">AIの応答スタイル</CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            AIが生成する文章のトーンを選択します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="response-style" className="text-white">スタイル選択</Label>
            <Select
              value={settings.responseStyle}
              onValueChange={(value) => setSettings(prev => ({...prev, responseStyle: value}))}
            >
              <SelectTrigger id="response-style" className="bg-[#1A1A1A] border-[#3A3A3A] text-white">
                <SelectValue placeholder="スタイルを選択" />
              </SelectTrigger>
              <SelectContent className="bg-[#2D2D2D] border-[#3A3A3A]">
                <SelectItem value="formal" className="text-white hover:bg-[#3A3A3A]">
                  フォーマル
                </SelectItem>
                <SelectItem value="friendly" className="text-white hover:bg-[#3A3A3A]">
                  フレンドリー
                </SelectItem>
                <SelectItem value="creative" className="text-white hover:bg-[#3A3A3A]">
                  クリエイティブ
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* プレビュー */}
          <div className="rounded-lg border border-[#3A3A3A] p-4 bg-[#1A1A1A]">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white">プレビュー</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[#20B2AA] hover:text-[#1a9b94] hover:bg-[#20B2AA]/10"
              >
                {showPreview ? '非表示' : '表示'}
              </Button>
            </div>
            {showPreview && (
              <p className="text-sm text-[#A0A0A0] italic border-t border-[#3A3A3A] pt-3 mt-3">
                "{getPreviewText()}"
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* フッター */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-[#20B2AA] hover:bg-[#1a9b94] text-white"
        >
          設定を保存
        </Button>
      </div>
    </div>
  );
}