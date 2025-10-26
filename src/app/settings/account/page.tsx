'use client';

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff, Twitter, Youtube, Trash2 } from 'lucide-react';

// Zodスキーマの定義
const passwordSchema = z.object({
  current: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }),
  new: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }),
  confirm: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }),
}).refine((data) => data.new === data.confirm, {
  message: "新しいパスワードが一致しません。",
  path: ["confirm"],
});

export default function AccountPage() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const keyMap: { [key: string]: keyof typeof passwords } = {
      "current-password": "current",
      "new-password": "new",
      "confirm-password": "confirm",
    };
    const fieldKey = keyMap[id];
    setPasswords((prev) => ({ ...prev, [fieldKey]: value }));
    if (errors[fieldKey]) {
      setErrors((prev) => ({ ...prev, [fieldKey]: undefined }));
    }
  };

  const handlePasswordChange = () => {
    const result = passwordSchema.safeParse(passwords);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      toast.error("入力内容にエラーがあります。ご確認ください。");
      return;
    }

    toast.success("パスワードが変更されました。");
    setPasswords({ current: "", new: "", confirm: "" });
    setErrors({});
  };

  const handleSocialLink = (socialName: string) => () => {
    toast.info(`${socialName}との連携処理を開始します...`);
  };

  const handleDeleteAccount = () => {
    toast.warning("アカウント削除処理はまだ実装されていません。");
    setShowDeleteDialog(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* メールアドレス */}
      <Card className="bg-[#2D2D2D] border-[#3A3A3A]">
        <CardHeader>
          <CardTitle className="text-white">メールアドレス</CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            メールアドレスは変更できません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            defaultValue="user@example.com" 
            readOnly 
            className="bg-[#1A1A1A] border-[#3A3A3A] text-white"
          />
        </CardContent>
      </Card>

      {/* パスワード変更 */}
      <Card className="bg-[#2D2D2D] border-[#3A3A3A]">
        <CardHeader>
          <CardTitle className="text-white">パスワード</CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            セキュリティのため、定期的なパスワードの変更を推奨します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-white">現在のパスワード</Label>
            <div className="relative">
              <Input 
                id="current-password" 
                type={showCurrentPassword ? "text" : "password"}
                value={passwords.current}
                onChange={handlePasswordInputChange}
                className="bg-[#1A1A1A] border-[#3A3A3A] text-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-[#808080] hover:text-white"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.current && <p className="text-sm text-red-400 mt-1">{errors.current[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white">新しいパスワード</Label>
            <div className="relative">
              <Input 
                id="new-password" 
                type={showNewPassword ? "text" : "password"}
                value={passwords.new}
                onChange={handlePasswordInputChange}
                className="bg-[#1A1A1A] border-[#3A3A3A] text-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-[#808080] hover:text-white"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.new && <p className="text-sm text-red-400 mt-1">{errors.new[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white">新しいパスワード（確認）</Label>
            <div className="relative">
              <Input 
                id="confirm-password" 
                type={showConfirmPassword ? "text" : "password"}
                value={passwords.confirm}
                onChange={handlePasswordInputChange}
                className="bg-[#1A1A1A] border-[#3A3A3A] text-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-[#808080] hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirm && <p className="text-sm text-red-400 mt-1">{errors.confirm[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="border-t border-[#3A3A3A]">
          <Button 
            onClick={handlePasswordChange}
            className="bg-[#20B2AA] hover:bg-[#1a9b94] text-white"
          >
            パスワードを変更
          </Button>
        </CardFooter>
      </Card>

      {/* SNS連携 */}
      <Card className="bg-[#2D2D2D] border-[#3A3A3A]">
        <CardHeader>
          <CardTitle className="text-white">SNS連携</CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            各種SNSと連携して、ログインや通知をより便利に利用できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={handleSocialLink("X (Twitter)")}
            className="border-[#3A3A3A] hover:bg-[#20B2AA]/10 hover:text-[#20B2AA] hover:border-[#20B2AA]"
          >
            <Twitter className="h-4 w-4 mr-2" />
            X (Twitter)と連携
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSocialLink("Google")}
            className="border-[#3A3A3A] hover:bg-[#20B2AA]/10 hover:text-[#20B2AA] hover:border-[#20B2AA]"
          >
            <Youtube className="h-4 w-4 mr-2" />
            Googleと連携
          </Button>
        </CardContent>
      </Card>

      {/* アカウント削除 */}
      <Card className="bg-[#2D2D2D] border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            アカウント削除
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            アカウントを削除すると、すべてのデータが完全に削除され、元に戻すことはできません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            アカウントを完全に削除する
          </Button>
        </CardContent>
      </Card>

      {/* 削除確認モーダル */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#2D2D2D] border-[#3A3A3A]">
          <DialogHeader>
            <DialogTitle className="text-red-400">アカウント削除の確認</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              この操作は取り消すことができません。アカウントとすべてのデータが完全に削除されます。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white mb-4">削除を続ける場合は、「削除」と入力してください。</p>
            <Input 
              placeholder="削除" 
              className="bg-[#1A1A1A] border-[#3A3A3A] text-white"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="border-[#3A3A3A] hover:bg-[#3A3A3A]"
            >
              キャンセル
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}