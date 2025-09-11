'use client';

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Zodスキーマの定義
const passwordSchema = z.object({
  current: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }),
  new: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }),
  confirm: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }),
}).refine((data) => data.new === data.confirm, {
  message: "新しいパスワードが一致しません。",
  path: ["confirm"], // エラーメッセージをconfirmフィールドに関連付ける
});

export default function AccountPage() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

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

    toast.success("パスワードが変更されました。（実際には保存されません）");
    setPasswords({ current: "", new: "", confirm: "" });
    setErrors({});
  };

  const handleSocialLink = (socialName: string) => () => {
    toast.info(`${socialName}との連携処理を開始します...`);
  };

  const handleDeleteAccount = () => {
    toast.warning("アカウント削除処理はまだ実装されていません。", {
      description: "この操作は元に戻せません。",
      action: {
        label: "OK",
        onClick: () => console.log("OK clicked"),
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>メールアドレス</CardTitle>
          <CardDescription>メールアドレスは変更できません。</CardDescription>
        </CardHeader>
        <CardContent>
          <Input defaultValue="user@example.com" readOnly />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>パスワード</CardTitle>
          <CardDescription>セキュリティのため、定期的なパスワードの変更を推奨します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">現在のパスワード</Label>
            <Input 
              id="current-password" 
              type="password" 
              value={passwords.current}
              onChange={handlePasswordInputChange}
            />
            {errors.current && <p className="text-sm text-destructive mt-1">{errors.current[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">新しいパスワード</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={passwords.new}
              onChange={handlePasswordInputChange}
            />
            {errors.new && <p className="text-sm text-destructive mt-1">{errors.new[0]}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={passwords.confirm}
              onChange={handlePasswordInputChange}
            />
            {errors.confirm && <p className="text-sm text-destructive mt-1">{errors.confirm[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePasswordChange}>パスワードを変更</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SNS連携</CardTitle>
          <CardDescription>各種SNSと連携して、ログインや通知をより便利に利用できます。</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
            <Button variant="outline" onClick={handleSocialLink("X (Twitter)")}>X (Twitter)と連携</Button>
            <Button variant="outline" onClick={handleSocialLink("Google")}>Googleと連携</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>アカウント削除</CardTitle>
          <CardDescription>
            アカウントを削除すると、すべてのデータが完全に削除され、元に戻すことはできません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteAccount}>アカウントを完全に削除する</Button>
        </CardContent>
      </Card>
    </div>
  );
}