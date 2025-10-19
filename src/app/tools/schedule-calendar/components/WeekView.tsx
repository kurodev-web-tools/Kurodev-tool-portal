'use client';

import { Badge } from '@/components/ui/badge';
import { format, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ScheduleItem } from '@/types/schedule';
import {
  getScheduleForTimeSlot,
  getScheduleTimeSlots,
  getScheduleDuration
} from '../utils/scheduleHelpers';

interface WeekViewProps {
  weekDays: Date[];
  filteredSchedules: ScheduleItem[];
  setSelectedDate: (date: Date | undefined) => void;
  setIsModalOpen: (open: boolean) => void;
  isDesktop: boolean;
}

export function WeekView({
  weekDays,
  filteredSchedules,
  setSelectedDate,
  setIsModalOpen,
  isDesktop
}: WeekViewProps) {
  if (isDesktop) {
    return (
      <div className="space-y-4">
        {/* デスクトップ用：時間軸ヘッダー */}
        <div className="flex">
          <div className="w-16 text-sm text-gray-500">時間</div>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="text-center text-sm font-medium">
                <div>{format(day, 'M/d', { locale: ja })}</div>
                <div className="text-xs text-gray-500">
                  {format(day, 'E', { locale: ja })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* デスクトップ用：時間軸グリッド */}
        <div className="flex">
          <div className="w-16 space-y-1">
            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
              <div key={hour} className="text-xs text-gray-500 h-12 flex items-center justify-center">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="space-y-1">
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <div
                    key={hour}
                    className="h-12 border border-slate-600/30 rounded cursor-pointer hover:bg-slate-700/50 transition-colors bg-slate-800/20 backdrop-blur-sm relative"
                    onClick={() => {
                      setSelectedDate(day);
                      setIsModalOpen(true);
                    }}
                  >
                    {(() => {
                      const schedule = getScheduleForTimeSlot(filteredSchedules, day, hour);
                      if (!schedule) return null;
                      
                      const timeSlots = getScheduleTimeSlots(schedule);
                      const hourSlots = timeSlots.filter(slot => slot.hour === hour);
                      const isFirstHour = timeSlots[0].hour === hour;
                      const isLastHour = timeSlots[timeSlots.length - 1].hour === hour;
                      
                      // 30分刻みの内部処理で視覚的に調整
                      const topOffset = hourSlots[0]?.minute === 30 ? '50%' : '0%';
                      const height = hourSlots.length === 2 ? '100%' : '50%';
                      
                      return (
                        <div 
                          className={`absolute left-0 right-0 p-1 text-xs bg-blue-500/80 text-white rounded backdrop-blur-sm`}
                          style={{
                            top: topOffset,
                            height: height,
                            borderRadius: isFirstHour ? '0.375rem 0.375rem 0 0' : 
                                         isLastHour ? '0 0 0.375rem 0.375rem' : '0'
                          }}
                        >
                          {isFirstHour && (
                            <div className="font-medium truncate">
                              {schedule.title || '(タイトルなし)'}
                            </div>
                          )}
                          {isFirstHour && (
                            <div className="text-xs opacity-75">
                              {schedule.time} - {getScheduleDuration(schedule)}分
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // モバイル用：縦リスト表示
  return (
    <div className="space-y-1">
      {weekDays.map((day) => {
        const daySchedules = filteredSchedules.filter(schedule => 
          isSameDay(parseISO(schedule.date), day)
        ).sort((a, b) => {
          if (!a.time || !b.time) return 0;
          return a.time.localeCompare(b.time);
        });

        return (
          <div key={day.toISOString()} className="bg-slate-800/50 rounded-lg p-2">
            {/* 日付ヘッダー */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-base font-semibold text-white">
                {format(day, 'M/d', { locale: ja })}
              </div>
              <div className="text-xs text-gray-400">
                {format(day, 'E', { locale: ja })}
              </div>
            </div>

            {/* スケジュールリスト */}
            {daySchedules.length > 0 ? (
              <div className="space-y-0.5">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="bg-blue-500/15 border border-blue-500/20 rounded px-2 py-1.5 cursor-pointer hover:bg-blue-500/25 transition-colors"
                    onClick={() => {
                      setSelectedDate(day);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* 時間情報 */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs text-blue-300 font-mono">
                          {schedule.time}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getScheduleDuration(schedule)}分
                        </span>
                      </div>
                      
                      {/* タイトル */}
                      <div className="flex-1 min-w-0 text-center">
                        <span className="text-sm text-white font-medium truncate block">
                          {schedule.title || '(タイトルなし)'}
                        </span>
                      </div>
                      
                      {/* カテゴリ */}
                      <div className="flex-shrink-0">
                        {schedule.category && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {schedule.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-xs text-center py-1.5">
                スケジュールなし
              </div>
            )}

            {/* 新規追加ボタン */}
            <div className="mt-2">
              <button
                className="w-full text-center py-1.5 text-xs text-[#20B2AA] hover:text-[#20B2AA] border border-[#20B2AA]/30 rounded-md hover:bg-[#20B2AA]/10 transition-colors"
                onClick={() => {
                  setSelectedDate(day);
                  setIsModalOpen(true);
                }}
              >
                + 予定を追加
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


