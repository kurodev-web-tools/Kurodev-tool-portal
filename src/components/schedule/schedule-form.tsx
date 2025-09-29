'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { Plus, Calendar, Clock, Bell } from 'lucide-react';

const scheduleSchema = z.object({
  title: z.string().max(50, { message: "タイトルは50文字までです。" }).optional(),
  date: z.string().min(1, { message: "日付は必須です。" }),
  time: z.string().optional(),
  category: z.string().optional(),
  platform: z.string().optional(),
  notes: z.string().max(200, { message: "備考は200文字までです。" }).optional(),
  duration: z.number().optional(),
  reminders: z.array(z.string()).optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export function ScheduleForm() {
  const { selectedDate, setIsModalOpen, refreshSchedules, editingSchedule, setEditingSchedule } = useSchedule();
  const { settings } = useSettings();
  const [reminders, setReminders] = useState<string[]>([]);

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: '',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: '',
      category: '',
      platform: '',
      notes: '',
      duration: 60,
      reminders: [],
    },
  });

  const reminderOptions = [
    { value: '15min', label: '15分前' },
    { value: '30min', label: '30分前' },
    { value: '1hour', label: '1時間前' },
    { value: '1day', label: '1日前' },
  ];

  const toggleReminder = (value: string, checked: boolean) => {
    if (checked) {
      setReminders(prev => [...prev, value]);
    } else {
      setReminders(prev => prev.filter(r => r !== value));
    }
  };

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
      const scheduleData = {
        ...data,
        reminders: reminders,
      };
      
      if (editingSchedule) {
        updateSchedule({ ...editingSchedule, ...scheduleData });
        toast.success("スケジュールを更新しました。");
      } else {
        addSchedule(scheduleData);
        toast.success("スケジュールを保存しました。");
      }
      refreshSchedules();
      setIsModalOpen(false);
      setEditingSchedule(null);
      setReminders([]);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本情報セクション */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">基本情報</h3>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>予定時間（分）</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="60" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 詳細設定セクション */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">詳細設定</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

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
        </div>

        {/* リマインダー設定セクション */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">リマインダー設定</h3>
          </div>

          <div className="space-y-2">
            {reminderOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={reminders.includes(option.value)}
                  onCheckedChange={(checked) => toggleReminder(option.value, checked as boolean)}
                />
                <Label htmlFor={option.value} className="text-sm font-medium">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
            キャンセル
          </Button>
          <Button type="submit">
            {editingSchedule ? '更新' : '保存'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

        