'use client';

import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DayProps } from 'react-day-picker';
import { ScheduleItem } from '@/types/schedule';

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

    return (
      <td
        {...restOfProps}
        className={cn(
          originalClassName,
          "relative flex flex-col h-full p-1 !h-32",
          isSameDay(dateToUse, selectedDate || new Date()) && "bg-accent/50 dark:bg-accent"
        )}
        onClick={() => handleDesktopDayClick(dateToUse)}
      >
        <div className="relative flex flex-col h-full justify-between z-10">
          <div className="text-sm font-bold flex-shrink-0">
            {format(dateToUse, 'd')}
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

    return (
      <td
        {...restOfProps}
        className={cn(
          originalClassName,
          isSameDay(dateToUse, selectedDate || new Date()) && "bg-accent/50 dark:bg-accent"
        )}
        onClick={() => handleDaySelect(dateToUse)}
      >
        <div className="relative h-full flex flex-col items-center justify-center">
          <span>{format(dateToUse, 'd')}</span>
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
      className={`rounded-md border border-slate-700/50 w-full bg-slate-800/80 backdrop-blur-sm ${isDesktop ? '' : 'text-sm'}`}
    />
  );
}


