'use client';

import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  parseISO,
  isToday,
} from 'date-fns';
import { useAppStore } from '@/store/app-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function MonthView() {
  const { tasks, selectedDate, setSelectedDate, setCurrentView } = useAppStore();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
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

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1">
        {calendarDays.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                'border rounded-lg p-1 cursor-pointer hover:bg-muted/50 overflow-hidden',
                !isCurrentMonth && 'opacity-40',
                today && 'border-primary bg-primary/5'
              )}
            >
              <div
                className={cn(
                  'text-sm font-medium mb-1',
                  today && 'text-primary'
                )}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="text-xs truncate px-1 py-0.5 rounded"
                    style={{
                      backgroundColor: task.project?.color + '20',
                      color: task.project?.color,
                    }}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
