"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const NOTIFICATION_SETTINGS_KEY = "vtuber-tools-notification-settings";

interface NotificationSettings {
  emailNewTools: boolean;
  emailUpdates: boolean;
  pushMentions: boolean;
  pushComments: boolean;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNewTools: false,
    emailUpdates: true,
    pushMentions: true,
    pushComments: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Failed to load notification settings from localStorage", error);
      toast.error("通知設定の読み込みに失敗しました。");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      try {
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error("Failed to save notification settings to localStorage", error);
        toast.error("通知設定の保存に失敗しました。");
      }
      return newSettings;
    });
  };
  
  const handleSave = () => {
    try {
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      toast.success("通知設定を保存しました。");
    } catch (error) {
      console.error("Failed to save notification settings to localStorage", error);
      toast.error("通知設定の保存に失敗しました。");
    }
  };

  if (!isLoaded) {
    return <div>読み込み中...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>通知設定</CardTitle>
        <CardDescription>通知の受け取り方法と種類を選択します。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">メール通知</h3>
          <div className="space-y-4 rounded-md border p-4">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-new-tools">新しいツールのお知らせ</Label>
                <p className="text-sm text-muted-foreground">
                  新しいツールや機能が追加されたときにメールで通知します。
                </p>
              </div>
              <Switch 
                id="email-new-tools"
                checked={settings.emailNewTools}
                onCheckedChange={(value) => handleSettingChange("emailNewTools", value)}
              />
            </div>
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-updates">重要な更新</Label>
                <p className="text-sm text-muted-foreground">
                  利用規約の変更など、重要なお知らせをメールで通知します。
                </p>
              </div>
              <Switch 
                id="email-updates"
                checked={settings.emailUpdates}
                onCheckedChange={(value) => handleSettingChange("emailUpdates", value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">プッシュ通知</h3>
          <div className="space-y-4 rounded-md border p-4">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-mentions">メンション</Label>
                <p className="text-sm text-muted-foreground">
                  他のユーザーからメンションされたときに通知します。
                </p>
              </div>
              <Switch 
                id="push-mentions"
                checked={settings.pushMentions}
                onCheckedChange={(value) => handleSettingChange("pushMentions", value)}
              />
            </div>
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-comments">コメント</Label>
                <p className="text-sm text-muted-foreground">
                  あなたの投稿にコメントがあったときに通知します。
                </p>
              </div>
              <Switch 
                id="push-comments"
                checked={settings.pushComments}
                onCheckedChange={(value) => handleSettingChange("pushComments", value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>設定を保存</Button>
      </CardFooter>
    </Card>
  );
}