'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAppStore } from '@/store/app-store';
import { useData } from '@/hooks/use-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Trash2, Calendar } from 'lucide-react';
import type { Task } from '@/types';

export function TaskModal() {
  const {
    showTaskModal,
    setShowTaskModal,
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    projects,
  } = useAppStore();
  const { updateTaskStatus, deleteTask, updateTask } = useData();
  
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (selectedTaskId) {
      const found = tasks.find((t) => t.id === selectedTaskId);
      setTask(found || null);
    }
  }, [selectedTaskId, tasks]);

  const handleClose = () => {
    setShowTaskModal(false);
    setSelectedTaskId(null);
  };

  const handleStatusChange = async (status: 'done' | 'extended' | 'missed') => {
    if (!task) return;
    await updateTaskStatus(task.id, status);
  };

  const handleDelete = async () => {
    if (!task) return;
    await deleteTask(task.id);
    handleClose();
  };

  const handleProjectChange = async (projectId: string) => {
    if (!task) return;
    await updateTask(task.id, { project_id: projectId });
  };

  if (!task) return null;

  return (
    <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task.status === 'done' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {task.status === 'missed' && <XCircle className="w-5 h-5 text-red-500" />}
            {task.status === 'extended' && <Clock className="w-5 h-5 text-yellow-500" />}
            <span className={task.status === 'done' ? 'line-through' : ''}>
              {task.title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {task.description && (
            <p className="text-muted-foreground">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
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
            {task.tags?.map((tag) => (
              <Badge
                key={tag.id}
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {task.scheduled_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {format(new Date(task.scheduled_at), 'PPp')}
              </div>
            )}
            {task.duration_minutes && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {task.duration_minutes} minutes
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Project</label>
              <Select value={task.project_id} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(projects || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="flex gap-2">
                <Button
                  variant={task.status === 'done' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('done')}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Done
                </Button>
                <Button
                  variant={task.status === 'extended' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('extended')}
                  className="flex-1"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Extended
                </Button>
                <Button
                  variant={task.status === 'missed' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('missed')}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Missed
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
