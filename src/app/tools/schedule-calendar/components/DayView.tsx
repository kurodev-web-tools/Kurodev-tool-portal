'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ScheduleItem } from '@/types/schedule';

interface DayViewProps {
  selectedDate: Date | undefined;
  filteredSchedules: ScheduleItem[];
  isDesktop: boolean;
}

export function DayView({ selectedDate, filteredSchedules, isDesktop }: DayViewProps) {
  if (!selectedDate) {
    return (
      <div className={isDesktop ? '' : 'px-2'}>
        <p className={`${isDesktop ? 'text-base' : 'text-sm'} text-muted-foreground`}>
          日付を選択してください
        </p>
      </div>
    );
  }

  const daySchedules = filteredSchedules.filter(
    s => s.date === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className={isDesktop ? '' : 'px-2'}>
      <h2 className={`${isDesktop ? 'text-xl' : 'text-lg'} font-bold mb-4`}>
        日表示カレンダー
      </h2>
      <div className={`${isDesktop ? 'mt-4' : 'mt-2'}`}>
        <h3 className={`${isDesktop ? 'text-lg' : 'text-base'} font-semibold mb-3`}>
          {format(selectedDate, "yyyy年MM月dd日", { locale: ja })} のスケジュール
        </h3>
        {daySchedules.length > 0 ? (
          <ul className="space-y-2">
            {daySchedules.map((schedule) => (
              <li 
                key={schedule.id} 
                className={`${isDesktop ? 'p-3' : 'p-2'} border border-[#4A4A4A]/30 rounded-md bg-[#2D2D2D]/60 backdrop-blur-sm`}
              >
                <p className={`${isDesktop ? 'text-sm' : 'text-xs'} font-medium`}>
                  <strong>タイトル:</strong> {schedule.title}
                </p>
                <p className={`${isDesktop ? 'text-sm' : 'text-xs'}`}>
                  <strong>時間:</strong> {schedule.time}
                </p>
                <p className={`${isDesktop ? 'text-sm' : 'text-xs'}`}>
                  <strong>カテゴリ:</strong> {schedule.category}
                </p>
                <p className={`${isDesktop ? 'text-sm' : 'text-xs'}`}>
                  <strong>プラットフォーム:</strong> {schedule.platform}
                </p>
                {schedule.notes && (
                  <p className={`${isDesktop ? 'text-sm' : 'text-xs'}`}>
                    <strong>備考:</strong> {schedule.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${isDesktop ? 'text-base' : 'text-sm'} text-muted-foreground`}>
            この日のスケジュールはありません。
          </p>
        )}
      </div>
    </div>
  );
}


