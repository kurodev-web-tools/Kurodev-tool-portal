"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { Bell, Mail, Smartphone } from 'lucide-react';

const NOTIFICATION_SETTINGS_KEY = "vtuber-tools-notification-settings";

interface NotificationSettings {
  emailNewTools: boolean;
  emailUpdates: boolean;
  pushMentions: boolean;
  pushComments: boolean;
  browserNotifications: boolean;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNewTools: false,
    emailUpdates: true,
    pushMentions: true,
    pushComments: false,
    browserNotifications: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      logger.error('通知設定読み込み失敗', error, 'NotificationsPage');
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
        logger.error('通知設定保存失敗', error, 'NotificationsPage');
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
      logger.error('通知設定保存失敗', error, 'NotificationsPage');
      toast.error("通知設定の保存に失敗しました。");
    }
  };

  const handleBrowserNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error("このブラウザは通知機能をサポートしていません。");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleSettingChange('browserNotifications', true);
        toast.success("ブラウザ通知が有効になりました。");
      } else {
        toast.error("ブラウザ通知の許可が必要です。");
      }
    } catch (error) {
      logger.error('通知許可取得失敗', error, 'NotificationsPage');
      toast.error("通知の許可に失敗しました。");
    }
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-[#A0A0A0]">通知設定を読み込み中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* ブラウザ通知 */}
      <Card className="bg-[#2D2D2D] border-[#20B2AA]/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[#20B2AA]" />
            ブラウザ通知
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            デスクトップ通知を有効にして、リアルタイムで情報を受け取ります。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="browser-notifications" className="text-white">
                ブラウザ通知を許可
              </Label>
              <p className="text-sm text-[#808080]">
                このブラウザで通知を受け取る
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="browser-notifications"
                checked={settings.browserNotifications}
                onCheckedChange={(value) => {
                  if (value) {
                    handleBrowserNotificationPermission();
                  } else {
                    handleSettingChange("browserNotifications", false);
                  }
                }}
              />
              <span className={`text-sm font-medium ${settings.browserNotifications ? 'text-[#20B2AA]' : 'text-[#808080]'}`}>
                {settings.browserNotifications ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          {!settings.browserNotifications && (
            <Button
              variant="outline"
              onClick={handleBrowserNotificationPermission}
              className="mt-4 border-[#20B2AA] text-[#20B2AA] hover:bg-[#20B2AA]/10 w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              通知の許可をリクエスト
            </Button>
          )}
        </CardContent>
      </Card>

      {/* メール通知 */}
      <Card className="bg-[#2D2D2D] border-[#3A3A3A]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#20B2AA]" />
            メール通知
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            メールアドレス宛に通知を送信します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-[#3A3A3A] p-4 bg-[#1A1A1A]">
            <div className="space-y-0.5">
              <Label htmlFor="email-new-tools" className="text-white">新しいツールのお知らせ</Label>
              <p className="text-sm text-[#808080]">
                新しいツールや機能が追加されたときにメールで通知します。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="email-new-tools"
                checked={settings.emailNewTools}
                onCheckedChange={(value) => handleSettingChange("emailNewTools", value)}
              />
              <span className={`text-sm font-medium ${settings.emailNewTools ? 'text-[#20B2AA]' : 'text-[#808080]'}`}>
                {settings.emailNewTools ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#3A3A3A] p-4 bg-[#1A1A1A]">
            <div className="space-y-0.5">
              <Label htmlFor="email-updates" className="text-white">重要な更新</Label>
              <p className="text-sm text-[#808080]">
                利用規約の変更など、重要なお知らせをメールで通知します。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="email-updates"
                checked={settings.emailUpdates}
                onCheckedChange={(value) => handleSettingChange("emailUpdates", value)}
              />
              <span className={`text-sm font-medium ${settings.emailUpdates ? 'text-[#20B2AA]' : 'text-[#808080]'}`}>
                {settings.emailUpdates ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* プッシュ通知 */}
      <Card className="bg-[#2D2D2D] border-[#3A3A3A]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#20B2AA]" />
            プッシュ通知
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            アプリ内でのリアルタイム通知設定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-[#3A3A3A] p-4 bg-[#1A1A1A]">
            <div className="space-y-0.5">
              <Label htmlFor="push-mentions" className="text-white">メンション</Label>
              <p className="text-sm text-[#808080]">
                他のユーザーからメンションされたときに通知します。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="push-mentions"
                checked={settings.pushMentions}
                onCheckedChange={(value) => handleSettingChange("pushMentions", value)}
              />
              <span className={`text-sm font-medium ${settings.pushMentions ? 'text-[#20B2AA]' : 'text-[#808080]'}`}>
                {settings.pushMentions ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#3A3A3A] p-4 bg-[#1A1A1A]">
            <div className="space-y-0.5">
              <Label htmlFor="push-comments" className="text-white">コメント</Label>
              <p className="text-sm text-[#808080]">
                あなたの投稿にコメントがあったときに通知します。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="push-comments"
                checked={settings.pushComments}
                onCheckedChange={(value) => handleSettingChange("pushComments", value)}
              />
              <span className={`text-sm font-medium ${settings.pushComments ? 'text-[#20B2AA]' : 'text-[#808080]'}`}>
                {settings.pushComments ? 'ON' : 'OFF'}
              </span>
            </div>
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