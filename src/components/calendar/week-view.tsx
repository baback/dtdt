'use client';

import { useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, isToday } from 'date-fns';
import { useAppStore } from '@/store/app-store';
import { TaskCard } from '@/components/task-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function WeekView() {
  const { tasks, selectedDate, setSelectedDate, setCurrentView } = useAppStore();

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const getTasksForDay = (day: Date) => {
    return (tasks || []).filter((task) => {
      if (!task.scheduled_at) return false;
      return isSameDay(parseISO(task.scheduled_at), day);
    });
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setCurrentView('day');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'p-2 text-center border-r last:border-r-0 cursor-pointer hover:bg-muted/50',
              isToday(day) && 'bg-primary/10'
            )}
            onClick={() => handleDayClick(day)}
          >
            <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
            <div
              className={cn(
                'text-lg font-semibold',
                isToday(day) && 'text-primary'
              )}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-7 overflow-hidden">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day);
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'border-r last:border-r-0 overflow-hidden',
                isToday(day) && 'bg-primary/5'
              )}
            >
              <ScrollArea className="h-full">
                <div className="p-2 space-y-2">
                  {dayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} compact />
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      No tasks
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
