'use client';

import { useMemo } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { useAppStore } from '@/store/app-store';
import { TaskCard } from '@/components/task-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function DayView() {
  const { tasks, selectedDate } = useAppStore();

  const dayTasks = useMemo(() => {
    return (tasks || []).filter((task) => {
      if (!task.scheduled_at) return false;
      return isSameDay(parseISO(task.scheduled_at), selectedDate);
    });
  }, [tasks, selectedDate]);

  const getTasksForHour = (hour: number) => {
    return dayTasks.filter((task) => {
      if (!task.scheduled_at) return false;
      const taskHour = parseISO(task.scheduled_at).getHours();
      return taskHour === hour;
    });
  };

  const currentHour = new Date().getHours();
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <ScrollArea className="flex-1">
      <div className="p-4">
        {HOURS.map((hour) => {
          const hourTasks = getTasksForHour(hour);
          const isCurrentHour = isToday && hour === currentHour;

          return (
            <div
              key={hour}
              className={cn(
                'flex border-t min-h-[60px]',
                isCurrentHour && 'bg-primary/5'
              )}
            >
              <div className="w-16 py-2 text-sm text-muted-foreground text-right pr-3 flex-shrink-0">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
              <div className="flex-1 py-1 pl-3 space-y-1">
                {hourTasks.map((task) => (
                  <TaskCard key={task.id} task={task} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
