'use client';

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Link as LinkIcon } from 'lucide-react';

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
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("画像ファイルを選択してください。");
      return;
    }

    setUploading(true);
    
    // プレビュー用にBase64に変換（実際の実装ではサーバーにアップロード）
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, avatar: base64String }));
      toast.success("画像がアップロードされました。");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
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

    toast.success("プロフィールが保存されました。");
    setErrors({});
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-[#A0A0A0]">プロフィールを読み込み中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-[#2D2D2D] border-[#3A3A3A]">
        <CardHeader>
          <CardTitle className="text-white">プロフィール情報</CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            あなたの公開プロフィールを編集します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* アバターアップロード */}
          <div className="space-y-4">
            <Label htmlFor="avatar" className="text-white">アバター画像</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8
                cursor-pointer transition-all duration-200
                ${isDragging 
                  ? 'border-[#20B2AA] bg-[#20B2AA]/10' 
                  : 'border-[#3A3A3A] hover:border-[#20B2AA]/50 bg-[#1A1A1A]'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              {uploading ? (
                <div className="space-y-2 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#20B2AA] mx-auto"></div>
                  <p className="text-[#A0A0A0]">アップロード中...</p>
                </div>
              ) : formData.avatar ? (
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar} alt="アバター" />
                    <AvatarFallback>VT</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <Upload className="h-12 w-12 text-[#20B2AA] mx-auto" />
                  <p className="text-[#A0A0A0]">
                    クリックまたは画像をドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-[#808080]">
                    PNG, JPG, GIF形式に対応
                  </p>
                </div>
              )}
            </div>
            {formData.avatar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData((prev) => ({ ...prev, avatar: "" }));
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
              >
                <X className="h-4 w-4 mr-2" />
                画像を削除
              </Button>
            )}
            {errors.avatar && <p className="text-sm text-red-400 mt-1">{errors.avatar[0]}</p>}
          </div>

          {/* 名前 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">名前</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-[#1A1A1A] border-[#3A3A3A] text-white placeholder:text-[#808080] focus:border-[#20B2AA]"
            />
            {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name[0]}</p>}
          </div>

          {/* 自己紹介 */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white">自己紹介</Label>
            <textarea
              id="bio"
              value={formData.bio || ""}
              onChange={handleInputChange}
              maxLength={160}
              className="flex min-h-[120px] w-full rounded-md border border-[#3A3A3A] bg-[#1A1A1A] px-3 py-2 text-sm text-white placeholder:text-[#808080] focus:outline-none focus:ring-2 focus:ring-[#20B2AA] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="あなたの自己紹介を入力してください..."
            />
            <div className="flex justify-between items-center">
              {errors.bio && <p className="text-sm text-red-400">{errors.bio[0]}</p>}
              <p className="text-xs text-[#808080] ml-auto">
                {(formData.bio || "").length}/160文字
              </p>
            </div>
          </div>

          {/* SNSリンク */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              SNSリンク
            </Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Twitter URL"
                  className="bg-[#1A1A1A] border-[#3A3A3A] text-white placeholder:text-[#808080]"
                />
                <Button variant="outline" size="icon" className="border-[#3A3A3A] hover:bg-[#20B2AA]/10">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="YouTube URL"
                  className="bg-[#1A1A1A] border-[#3A3A3A] text-white placeholder:text-[#808080]"
                />
                <Button variant="outline" size="icon" className="border-[#3A3A3A] hover:bg-[#20B2AA]/10">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-[#3A3A3A]">
          <Button 
            onClick={handleSaveProfile}
            className="bg-[#20B2AA] hover:bg-[#1a9b94] text-white"
          >
            プロフィールを保存
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}