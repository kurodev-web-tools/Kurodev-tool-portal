'use client';

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Zodスキーマの定義
const profileSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です。" }),
  bio: z.string().max(160, { message: "自己紹介は160文字以内で入力してください。" }).optional(),
  avatar: z.string().url({ message: "有効なURLを入力してください。" }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    bio: "",
    avatar: "",
  });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // ダミーデータをロード
    const dummyData = {
      name: "VTuber太郎",
      bio: "こんにちは！バーチャル世界で活動するVTuberです。ゲーム実況や歌ってみたを中心に活動しています。",
      avatar: "https://github.com/shadcn.png",
    };
    setFormData(dummyData);
    setIsLoaded(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSaveProfile = () => {
    const result = profileSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      toast.error("入力内容にエラーがあります。ご確認ください。");
      return;
    }

    toast.success("プロフィールが保存されました。（実際には保存されません）");
    setErrors({});
  };

  if (!isLoaded) {
    return <div>Loading profile...</div>; // ローディング表示
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール情報</CardTitle>
          <CardDescription>あなたの公開プロフィールを編集します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar} alt="アバター" />
              <AvatarFallback>VT</AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-grow">
              <Label htmlFor="avatar">アバターURL</Label>
              <Input
                id="avatar"
                type="url"
                value={formData.avatar || ""}
                onChange={handleInputChange}
              />
              {errors.avatar && <p className="text-sm text-destructive mt-1">{errors.avatar[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <textarea
              id="bio"
              value={formData.bio || ""}
              onChange={handleInputChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveProfile}>プロフィールを保存</Button>
        </CardFooter>
      </Card>
    </div>
  );
}