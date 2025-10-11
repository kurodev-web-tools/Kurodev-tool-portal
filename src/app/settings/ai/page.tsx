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

  if (!isLoaded) {
    return <div>読み込み中...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI設定</CardTitle>
        <CardDescription>各種AI機能の動作をカスタマイズします。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="enable-ai-features">AI機能の有効化</Label>
            <p className="text-sm text-muted-foreground">
              タイトル生成や台本作成などのAIサポート機能を有効にします。
            </p>
          </div>
          <Switch 
            id="enable-ai-features" 
            checked={settings.enableAiFeatures}
            onCheckedChange={(value) => setSettings(prev => ({...prev, enableAiFeatures: value}))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-key">外部APIキー</Label>
          <Input 
            id="api-key" 
            type="password" 
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx" 
            value={settings.apiKey}
            onChange={(e) => setSettings(prev => ({...prev, apiKey: e.target.value}))}
          />
          <p className="text-sm text-muted-foreground">
            より高度な機能を利用するために、外部サービスのAPIキーを設定します。
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="response-style">AIの応答スタイル</Label>
          <Select
            value={settings.responseStyle}
            onValueChange={(value) => setSettings(prev => ({...prev, responseStyle: value}))}
          >
            <SelectTrigger id="response-style">
              <SelectValue placeholder="スタイルを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">フォーマル</SelectItem>
              <SelectItem value="friendly">フレンドリー</SelectItem>
              <SelectItem value="creative">クリエイティブ</SelectItem>
            </SelectContent>
          </Select>
           <p className="text-sm text-muted-foreground">
            AIが生成する文章のトーンを選択します。
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>設定を保存</Button>
      </CardFooter>
    </Card>
  );
}