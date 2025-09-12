'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage, // 元に戻す
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: 'ユーザー名は2文字以上である必要があります。',
    })
    .max(30, {
      message: 'ユーザー名は30文字以下である必要があります。',
    }),
  email: z.string().email({
    message: '有効なメールアドレスを入力してください。',
  }),
  avatar: z.string().url({
    message: '有効なURLを入力してください。',
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  username: 'VTuber太郎',
  email: 'vtuber.taro@example.com',
  avatar: 'https://github.com/shadcn.png',
};

export default function ProfileSettings() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  function onSubmit(data: ProfileFormValues) {
    toast('プロフィールが更新されました。', {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">プロフィール</h3>
        <p className="text-sm text-muted-foreground">
          あなたの公開プロフィール情報を更新します。
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Controller
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ユーザー名</FormLabel>
                <FormControl>
                  <Input placeholder="あなたのユーザー名" {...field} />
                </FormControl>
                <FormDescription>
                  これはあなたの公開表示名です。他のユーザーに表示されます。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input placeholder="your@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  このメールアドレスは公開されません。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Controller
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>アバターURL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/avatar.png" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>
                  あなたの公開アバター画像へのURL。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">プロフィールを更新</Button>
        </form>
      </Form>
    </div>
  );
}