'use client';

import { useAppStore } from '@/store/app-store';
import { useData } from '@/hooks/use-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export function PendingReviewModal() {
  const { showPendingReview, setShowPendingReview, pendingTasks, setPendingTasks } = useAppStore();
  const { updateTaskStatus, fetchTasks } = useData();

  const handleStatusUpdate = async (taskId: string, status: 'done' | 'extended' | 'missed') => {
    await updateTaskStatus(taskId, status);
    setPendingTasks(pendingTasks.filter((t) => t.id !== taskId));
    
    if (pendingTasks.length <= 1) {
      setShowPendingReview(false);
      await fetchTasks();
    }
  };

  const handleSkip = () => {
    setShowPendingReview(false);
  };

  if (pendingTasks.length === 0) return null;

  return (
    <Dialog open={showPendingReview} onOpenChange={setShowPendingReview}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Past Tasks</DialogTitle>
          <DialogDescription>
            You have {pendingTasks.length} task{pendingTasks.length > 1 ? 's' : ''} from the past that need your attention.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {(pendingTasks || []).map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    {task.scheduled_at && (
                      <p className="text-sm text-muted-foreground">
                        Scheduled: {format(new Date(task.scheduled_at), 'PPp')}
                      </p>
                    )}
                  </div>
                  {task.project && (
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: task.project.color,
                        color: task.project.color,
                      }}
                    >
                      {task.project.name}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleStatusUpdate(task.id, 'done')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                    Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleStatusUpdate(task.id, 'extended')}
                  >
                    <Clock className="w-4 h-4 mr-1 text-yellow-500" />
                    Extended
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleStatusUpdate(task.id, 'missed')}
                  >
                    <XCircle className="w-4 h-4 mr-1 text-red-500" />
                    Missed
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
