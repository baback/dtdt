'use client';

import { useMemo } from 'react';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { useAppStore } from '@/store/app-store';
import { TaskCard } from '@/components/task-card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ListView() {
  const { tasks } = useAppStore();

  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof tasks> = {};
    
    (tasks || []).forEach((task) => {
      const dateKey = task.scheduled_at
        ? format(parseISO(task.scheduled_at), 'yyyy-MM-dd')
        : 'unscheduled';
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });

    // Sort by date
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'unscheduled') return 1;
      if (b === 'unscheduled') return -1;
      return a.localeCompare(b);
    });
  }, [tasks]);

  const getDateLabel = (dateKey: string) => {
    if (dateKey === 'unscheduled') return 'Unscheduled';
    
    const date = parseISO(dateKey);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {groupedTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No tasks yet. Create your first task to get started!
          </div>
        ) : (
          groupedTasks.map(([dateKey, dateTasks]) => (
            <div key={dateKey}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {getDateLabel(dateKey)}
              </h3>
              <div className="space-y-2">
                {dateTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
