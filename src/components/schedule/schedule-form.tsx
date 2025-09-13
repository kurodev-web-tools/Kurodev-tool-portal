'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { addSchedule, updateSchedule } from '@/lib/schedule-storage';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from '@/app/tools/schedule-calendar/components/settings-tab';

const scheduleSchema = z.object({
  title: z.string().max(50, { message: "タイトルは50文字までです。" }).optional(),
  date: z.string().min(1, { message: "日付は必須です。" }),
  time: z.string().optional(),
  category: z.string().optional(),
  platform: z.string().optional(),
  notes: z.string().max(200, { message: "備考は200文字までです。" }).optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export function ScheduleForm() {
  const { selectedDate, setIsModalOpen, refreshSchedules, editingSchedule, setEditingSchedule } = useSchedule();
  const { settings } = useSettings();

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: '',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: '',
      category: '',
      platform: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editingSchedule) {
      form.reset(editingSchedule);
    } else if (selectedDate) {
      form.reset({
        ...form.getValues(),
        date: format(selectedDate, 'yyyy-MM-dd'),
        title: '', // 新規作成時はタイトルなどをクリア
        time: '',
        category: '',
        platform: '',
        notes: '',
      });
    }
  }, [editingSchedule, selectedDate, form]);

  const onSubmit = (data: ScheduleFormData) => {
    try {
      if (editingSchedule) {
        updateSchedule({ ...editingSchedule, ...data });
        toast.success("スケジュールを更新しました。");
      } else {
        addSchedule(data);
        toast.success("スケジュールを保存しました。");
      }
      refreshSchedules();
      setIsModalOpen(false);
      setEditingSchedule(null); // 編集状態をリセット
    } catch (error) {
      console.error("Failed to save schedule", error);
      toast.error("処理に失敗しました。");
    }
  };

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ... form fields ... */}
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
              <Select onValueChange={field.onChange} value={field.value || ''}>
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
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {settings.categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="プラットフォームを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {settings.platforms.map(platform => (
                    <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        <Button type="submit">{editingSchedule ? '更新' : '保存'}</Button>
      </form>
    </Form>
  );
}

        