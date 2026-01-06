'use client';

import { format } from 'date-fns';
import { useAppStore } from '@/store/app-store';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const { setSelectedTaskId, setShowTaskModal } = useAppStore();

  const handleClick = () => {
    setSelectedTaskId(task.id);
    setShowTaskModal(true);
  };

  const statusIcon = {
    pending: null,
    done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    extended: <Timer className="w-4 h-4 text-yellow-500" />,
    missed: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors',
        task.status === 'done' && 'opacity-60',
        compact && 'p-2'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {statusIcon[task.status]}
            <h4 className={cn(
              'font-medium truncate',
              task.status === 'done' && 'line-through',
              compact && 'text-sm'
            )}>
              {task.title}
            </h4>
          </div>
          
          {!compact && task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.project && (
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: task.project.color,
                  color: task.project.color,
                }}
              >
                {task.project.name}
              </Badge>
            )}
            
            {task.tags?.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            
            {task.duration_minutes && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.duration_minutes}m
              </span>
            )}
          </div>
        </div>
        
        {task.scheduled_at && !compact && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(task.scheduled_at), 'HH:mm')}
          </span>
        )}
      </div>
    </div>
  );
}
