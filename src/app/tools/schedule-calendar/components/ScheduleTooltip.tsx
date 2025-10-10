import { ScheduleItem } from '@/types/schedule';

interface ScheduleTooltipContentProps {
  schedule: ScheduleItem;
}

export function ScheduleTooltipContent({ schedule }: ScheduleTooltipContentProps) {
  return (
    <div className="p-2 text-sm">
      <p className="font-bold">{schedule.title || '(タイトルなし)'}</p>
      <p>{schedule.time}</p>
      <p className="text-xs text-muted-foreground">
        {schedule.category} / {schedule.platform}
      </p>
      {schedule.notes && (
        <p className="mt-1 border-t pt-1 text-xs">{schedule.notes}</p>
      )}
    </div>
  );
}


