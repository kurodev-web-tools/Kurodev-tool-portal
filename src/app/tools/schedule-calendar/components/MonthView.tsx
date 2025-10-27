'use client';

import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, isSameDay, parseISO, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DayProps } from 'react-day-picker';
import { ScheduleItem } from '@/types/schedule';
import { Badge } from '@/components/ui/badge';

interface MonthViewProps {
  selectedDate: Date | undefined;
  filteredSchedules: ScheduleItem[];
  handleDesktopDayClick: (day: Date) => void;
  handleDaySelect: (day: Date) => void;
  isDesktop: boolean;
  ScheduleTooltipContent: React.ComponentType<{ schedule: ScheduleItem }>;
}

export function MonthView({
  selectedDate,
  filteredSchedules,
  handleDesktopDayClick,
  handleDaySelect,
  isDesktop,
  ScheduleTooltipContent
}: MonthViewProps) {
  // PC用: 予定が表示されるリッチな日付セル
  const RichCustomDay = (props: DayProps) => {
    const dateToUse = props.day.date;
    const daySchedules = filteredSchedules.filter(s => isSameDay(parseISO(s.date), dateToUse));
    const { className: originalClassName = "", ...restOfProps } = props;
    const isSelectedDate = selectedDate && isSameDay(dateToUse, selectedDate);
    const isTodayDate = isToday(dateToUse);

    return (
      <td
        {...restOfProps}
        className={cn(
          originalClassName,
          "relative flex flex-col h-full p-1 !h-32",
          isTodayDate && "bg-[#20B2AA]/20 border-2 border-[#20B2AA]",
          isSelectedDate && !isTodayDate && "bg-[#20B2AA]/10 border border-[#20B2AA]/30"
        )}
        onClick={() => handleDesktopDayClick(dateToUse)}
      >
        <div className="relative flex flex-col h-full justify-between z-10">
          <div className="flex items-center justify-between flex-shrink-0">
            <div className={cn(
              "text-sm font-bold",
              isTodayDate && "text-[#20B2AA]",
              isSelectedDate && !isTodayDate && "text-[#20B2AA]"
            )}>
              {format(dateToUse, 'd')}
            </div>
            {isTodayDate && (
              <Badge className="text-[8px] px-1 py-0 bg-[#20B2AA] text-white border-0">
                今日
              </Badge>
            )}
          </div>
          <div className="flex-grow space-y-0.5 overflow-hidden">
            {daySchedules.slice(0, 3).map(schedule => (
              <Tooltip key={schedule.id} delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className="truncate text-[10px] leading-tight bg-secondary rounded-sm px-0.5 cursor-default">
                    {schedule.time || '未定'} {schedule.category || '未定'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <ScheduleTooltipContent schedule={schedule} />
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </td>
    );
  };

  // モバイル用: 日付の数字とドットだけのシンプルなセル
  const SimpleCustomDay = (props: DayProps) => {
    const dateToUse = props.day.date;
    const daySchedules = filteredSchedules.filter(s => isSameDay(parseISO(s.date), dateToUse));
    const { className: originalClassName = "", ...restOfProps } = props;
    const isSelectedDate = selectedDate && isSameDay(dateToUse, selectedDate);
    const isTodayDate = isToday(dateToUse);

    return (
      <td
        {...restOfProps}
        className={cn(
          originalClassName,
          isTodayDate && "bg-[#20B2AA]/20 border-2 border-[#20B2AA]",
          isSelectedDate && !isTodayDate && "bg-[#20B2AA]/10 border border-[#20B2AA]/30"
        )}
        onClick={() => handleDaySelect(dateToUse)}
      >
        <div className="relative h-full flex flex-col items-center justify-center">
          <span className={cn(
            isTodayDate && "font-bold text-[#20B2AA]",
            isSelectedDate && !isTodayDate && "font-semibold text-[#20B2AA]"
          )}>
            {format(dateToUse, 'd')}
          </span>
          {daySchedules.length > 0 && (
            <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
          )}
        </div>
      </td>
    );
  };

  const DayComponent = isDesktop ? RichCustomDay : SimpleCustomDay;

  return (
    <Calendar
      numberOfMonths={1}
      mode="single"
      selected={selectedDate}
      components={{ Day: DayComponent }}
      locale={ja}
      className={`rounded-md border border-[#4A4A4A]/50 w-full bg-[#2D2D2D]/50 backdrop-blur-sm ${isDesktop ? '' : 'text-sm'}`}
    />
  );
}


