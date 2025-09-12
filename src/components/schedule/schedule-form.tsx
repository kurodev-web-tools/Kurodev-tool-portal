'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { addSchedule } from '@/lib/schedule-storage'; // addScheduleをインポート
import { toast } from 'sonner'; // toastをインポート
import { format } from 'date-fns'; // date-fnsをインポート

// スケジュール項目のスキーマ定義
const scheduleSchema = z.object({
  title: z.string().max(50, { message: "タイトルは50文字までです。" }).optional(),
  date: z.string().min(1, { message: "日付は必須です。" }), // DatePickerを使う場合はDate型にする
  time: z.string().optional(), // 30分刻みの選択式
  category: z.string().optional(),
  platform: z.string().optional(),
  notes: z.string().max(200, { message: "備考は200文字までです。" }).optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export function ScheduleForm() {
  const today = format(new Date(), 'yyyy-MM-dd'); // 今日の日付を取得

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: '',
      date: today, // デフォルト値を今日の日付に設定
      time: '',
      category: '',
      platform: '',
      notes: '',
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    try {
      // isCompletedはフォームにはないので、falseで固定
      addSchedule(data);
      toast.success("スケジュールを保存しました。");
      form.reset({ date: today }); // フォームをリセットし、日付は今日に戻す
    } catch (error) {
      console.error("Failed to save schedule", error);
      toast.error("スケジュールの保存に失敗しました。");
    }
  };

  // 30分刻みの時間オプションを生成
  const generateTimeOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = String(i).padStart(2, '0');
        const minute = String(j).padStart(2, '0');
        options.push(`${hour}:${minute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>新規スケジュール登録</AccordionTrigger>
        <AccordionContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input placeholder="配信タイトル" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>日付</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>時間</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="時間を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリ</FormLabel>
                    <FormControl>
                      <Input placeholder="雑談、ゲームなど" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>プラットフォーム</FormLabel>
                    <FormControl>
                      <Input placeholder="YouTube, Twitchなど" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>備考</FormLabel>
                    <FormControl>
                      <Textarea placeholder="メモ、詳細など" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">スケジュールを保存</Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}