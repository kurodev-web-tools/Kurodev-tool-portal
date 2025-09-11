'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(6, { message: "パスワードは6文字以上である必要があります。" }),
});

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      loginSchema.parse(formData);
      setErrors({}); // エラーをクリア
      login(formData.email, formData.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors);
        toast.error("入力内容にエラーがあります。");
      } else {
        toast.error("予期せぬエラーが発生しました。");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-background pt-24">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-foreground">ログイン</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1"
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email[0]}</p>}
          </div>
          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1"
            />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password[0]}</p>}
          </div>
          <Button type="submit" className="w-full">ログイン</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          アカウントをお持ちでないですか？{" "}
          <Link href="/register" className="text-primary hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}