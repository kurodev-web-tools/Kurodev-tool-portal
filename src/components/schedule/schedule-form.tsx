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
import { logger } from '@/lib/logger';
import { format } from 'date-fns';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from '@/app/tools/schedule-calendar/components/settings-tab';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Calendar, Clock, Bell, Repeat } from 'lucide-react';
import { generateRecurringSchedules, RepeatRule } from '@/lib/recurring-schedule';
import { ScheduleItem } from '@/types/schedule';

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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  // 繰り返し設定の状態
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [repeatEndOption, setRepeatEndOption] = useState<'never' | 'date' | 'count'>('never');
  const [repeatEndDate, setRepeatEndDate] = useState<string>('');
  const [repeatCount, setRepeatCount] = useState<number>(10);

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
        isCompleted: false,
      };
      
      if (editingSchedule) {
        // 編集中の予定は通常通り更新（繰り返し予定でも個別に更新）
        updateSchedule({ ...editingSchedule, ...scheduleData });
        toast.success("スケジュールを更新しました。");
      } else {
        // 新規作成
        if (isRecurring) {
          // 繰り返し予定を生成
          const repeatRule: RepeatRule = {
            type: repeatType,
            interval: 1,
            count: repeatEndOption === 'count' ? repeatCount : undefined,
            endDate: repeatEndOption === 'date' ? repeatEndDate : undefined,
          };
          
          // 一時的なIDを付与（generateRecurringSchedules内で新しいIDが生成される）
          const baseSchedule: ScheduleItem = {
            ...scheduleData,
            id: 'temp-id',
          } as ScheduleItem;
          
          const recurringSchedules = generateRecurringSchedules(baseSchedule, repeatRule);
          
          // 全ての予定を保存
          recurringSchedules.forEach(schedule => {
            addSchedule(schedule);
          });
          
          toast.success(`${recurringSchedules.length}件のスケジュールを作成しました。`);
        } else {
          // 通常の予定
          addSchedule(scheduleData);
          toast.success("スケジュールを保存しました。");
        }
      }
      refreshSchedules();
      setIsModalOpen(false);
      setEditingSchedule(null);
      setReminders([]);
      // 繰り返し設定をリセット
      setIsRecurring(false);
    } catch (error) {
      logger.error('スケジュール保存失敗', error, 'ScheduleForm');
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
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-${isDesktop ? '6' : '4'}`}>
        {/* 基本情報セクション */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className={`${isDesktop ? 'h-5 w-5' : 'h-4 w-4'} text-blue-500`} />
            <h3 className={`${isDesktop ? 'text-lg' : 'text-base'} font-semibold`}>基本情報</h3>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isDesktop ? '' : 'text-sm'}>タイトル</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="配信タイトル" 
                    className={isDesktop ? '' : 'h-10 text-sm'} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className={`grid gap-4 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isDesktop ? '' : 'text-sm'}>日付</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className={isDesktop ? '' : 'h-10 text-sm'} 
                      {...field} 
                    />
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
                  <FormLabel className={isDesktop ? '' : 'text-sm'}>時間</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className={isDesktop ? '' : 'h-10 text-sm'}>
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
                <FormLabel className={isDesktop ? '' : 'text-sm'}>予定時間（分）</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="60" 
                    className={isDesktop ? '' : 'h-10 text-sm'}
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
            <Clock className={`${isDesktop ? 'h-5 w-5' : 'h-4 w-4'} text-blue-500`} />
            <h3 className={`${isDesktop ? 'text-lg' : 'text-base'} font-semibold`}>詳細設定</h3>
          </div>

          <div className={`grid gap-4 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isDesktop ? '' : 'text-sm'}>カテゴリ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className={isDesktop ? '' : 'h-10 text-sm'}>
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
                  <FormLabel className={isDesktop ? '' : 'text-sm'}>プラットフォーム</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className={isDesktop ? '' : 'h-10 text-sm'}>
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
                <FormLabel className={isDesktop ? '' : 'text-sm'}>備考</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="メモ、詳細など" 
                    className={`${isDesktop ? '' : 'text-sm min-h-[80px]'}`}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 繰り返し設定セクション */}
        {!editingSchedule && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Repeat className={`${isDesktop ? 'h-5 w-5' : 'h-4 w-4'} text-purple-500`} />
              <h3 className={`${isDesktop ? 'text-lg' : 'text-base'} font-semibold`}>繰り返し設定</h3>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked === true)}
                className={isDesktop ? '' : 'h-4 w-4'}
              />
              <Label htmlFor="isRecurring" className={`${isDesktop ? 'text-sm' : 'text-xs'} font-medium cursor-pointer`}>
                繰り返し予定にする
              </Label>
            </div>

            {isRecurring && (
              <div className={`space-y-4 ml-6 pl-4 border-l-2 border-purple-500/30 ${isDesktop ? '' : 'space-y-3'}`}>
                {/* 繰り返しパターン */}
                <div>
                  <Label className={`${isDesktop ? 'text-sm' : 'text-xs'} font-medium mb-2 block`}>
                    繰り返しパターン
                  </Label>
                  <Select value={repeatType} onValueChange={(value: any) => setRepeatType(value)}>
                    <SelectTrigger className={isDesktop ? '' : 'h-10 text-sm'}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">毎日</SelectItem>
                      <SelectItem value="weekly">毎週</SelectItem>
                      <SelectItem value="monthly">毎月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 終了条件 */}
                <div className="space-y-2">
                  <Label className={`${isDesktop ? 'text-sm' : 'text-xs'} font-medium`}>
                    終了条件
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="never"
                        checked={repeatEndOption === 'never'}
                        onCheckedChange={() => setRepeatEndOption('never')}
                        className={isDesktop ? '' : 'h-4 w-4'}
                      />
                      <Label htmlFor="never" className={`${isDesktop ? 'text-sm' : 'text-xs'} cursor-pointer`}>
                        終了しない
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <Checkbox
                        id="date"
                        checked={repeatEndOption === 'date'}
                        onCheckedChange={() => setRepeatEndOption('date')}
                        className={isDesktop ? '' : 'h-4 w-4'}
                      />
                      <Label htmlFor="date" className={`${isDesktop ? 'text-sm' : 'text-xs'} cursor-pointer`}>
                        指定した日まで
                      </Label>
                      {repeatEndOption === 'date' && (
                        <Input
                          type="date"
                          value={repeatEndDate}
                          onChange={(e) => setRepeatEndDate(e.target.value)}
                          className={`ml-2 ${isDesktop ? 'w-40' : 'w-32 h-10 text-sm'}`}
                        />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <Checkbox
                        id="count"
                        checked={repeatEndOption === 'count'}
                        onCheckedChange={() => setRepeatEndOption('count')}
                        className={isDesktop ? '' : 'h-4 w-4'}
                      />
                      <Label htmlFor="count" className={`${isDesktop ? 'text-sm' : 'text-xs'} cursor-pointer`}>
                        回数指定
                      </Label>
                      {repeatEndOption === 'count' && (
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={repeatCount}
                          onChange={(e) => setRepeatCount(Number(e.target.value))}
                          className={`ml-2 ${isDesktop ? 'w-20' : 'w-16 h-10 text-sm'}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* リマインダー設定セクション */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className={`${isDesktop ? 'h-5 w-5' : 'h-4 w-4'} text-blue-500`} />
            <h3 className={`${isDesktop ? 'text-lg' : 'text-base'} font-semibold`}>リマインダー設定</h3>
          </div>

          <div className={`space-y-2 ${isDesktop ? '' : 'grid grid-cols-2 gap-2'}`}>
            {reminderOptions.map((option) => (
              <div key={option.value} className={`flex items-center space-x-2 ${isDesktop ? '' : 'p-2 bg-slate-100 dark:bg-slate-800 rounded-md h-12'}`}>
                <Checkbox
                  id={option.value}
                  checked={reminders.includes(option.value)}
                  onCheckedChange={(checked) => toggleReminder(option.value, checked as boolean)}
                  className={isDesktop ? '' : 'h-4 w-4'}
                />
                <Label htmlFor={option.value} className={`${isDesktop ? 'text-sm' : 'text-xs'} font-medium`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className={`flex gap-2 pt-4 ${isDesktop ? 'justify-end' : 'flex-col'}`}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsModalOpen(false)}
            className={isDesktop ? '' : 'w-full h-10'}
          >
            キャンセル
          </Button>
          <Button 
            type="submit"
            className={isDesktop ? '' : 'w-full h-10'}
          >
            {editingSchedule ? '更新' : '保存'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

        