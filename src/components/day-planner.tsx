'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Check, Pencil, Clock, Loader2, Tag } from 'lucide-react';
import { ProjectSelectModal } from './project-select-modal';
import { TimeBlockModal } from './time-block-modal';
import { TaskTagModal } from './task-tag-modal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import type { DayBlock, Task } from '@/types';

function formatHour(hour: number): string {
  if (hour === 12) return '12';
  if (hour > 12) return `${hour - 12}`;
  return `${hour}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeekDays(centerDate: Date): Date[] {
  const days: Date[] = [];
  // Get 3 days before and 3 days after the center date
  for (let i = -3; i <= 3; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

// Skeleton component
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

export function DayPlanner() {
  const { currentWorkspaceId, projects } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blocks, setBlocks] = useState<DayBlock[]>([]);
  const [blockTasks, setBlockTasks] = useState<Record<string, Task[]>>({});
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  
  const [editingBlockProject, setEditingBlockProject] = useState<DayBlock | null>(null);
  const [editingBlockTime, setEditingBlockTime] = useState<DayBlock | null>(null);
  const [addingTaskToBlock, setAddingTaskToBlock] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const [togglingTask, setTogglingTask] = useState<string | null>(null);
  const [editingTaskTags, setEditingTaskTags] = useState<Task | null>(null);
  const [quickTasks, setQuickTasks] = useState<{id: string; title: string}[]>([]);
  const [popoverBlockId, setPopoverBlockId] = useState<string | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];

  const fetchBlocks = useCallback(async () => {
    if (!currentWorkspaceId) return;
    setLoadingBlocks(true);
    try {
      const res = await fetch(`/api/day-blocks?workspace_id=${currentWorkspaceId}&date=${dateStr}`);
      const data = await res.json();
      setBlocks(data);
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoadingBlocks(false);
    }
  }, [currentWorkspaceId, dateStr]);

  const fetchTasksForBlocks = useCallback(async (blocksData: DayBlock[]) => {
    if (!currentWorkspaceId || blocksData.length === 0) return;
    
    // Set all blocks to loading
    const loadingState: Record<string, boolean> = {};
    blocksData.forEach(b => loadingState[b.id] = true);
    setLoadingTasks(loadingState);
    
    try {
      const grouped: Record<string, Task[]> = {};
      
      await Promise.all(blocksData.map(async (block) => {
        const res = await fetch(`/api/tasks?block_id=${block.id}`);
        const tasks: Task[] = await res.json();
        grouped[block.id] = tasks;
        setLoadingTasks(prev => ({ ...prev, [block.id]: false }));
      }));
      
      setBlockTasks(grouped);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoadingTasks({});
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  useEffect(() => {
    if (blocks.length > 0) {
      fetchTasksForBlocks(blocks);
    }
  }, [blocks, fetchTasksForBlocks]);

  const navigateDay = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    setSelectedDate(newDate);
  };

  const updateBlockProject = async (blockId: string, projectId: string | null) => {
    try {
      const res = await fetch(`/api/day-blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });
      const updated = await res.json();
      setBlocks(blocks.map(b => b.id === blockId ? updated : b));
      toast.success('Project assigned');
    } catch (error) {
      console.error('Failed to update block:', error);
      toast.error('Failed to assign project');
    }
  };

  const updateBlockTimes = async (updatedBlocks: DayBlock[]) => {
    if (!currentWorkspaceId) return;
    try {
      const res = await fetch('/api/day-blocks/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: updatedBlocks, workspace_id: currentWorkspaceId, date: dateStr }),
      });
      if (res.ok) {
        const data = await res.json();
        setBlocks(data);
        toast.success('Schedule updated');
      }
    } catch (error) {
      console.error('Failed to update blocks:', error);
      toast.error('Failed to update schedule');
    }
  };

  const addTask = async (blockId: string, title?: string) => {
    const taskTitle = title || newTaskTitle.trim();
    if (!taskTitle) return;
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.project_id) return;

    setSavingTask(true);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: block.project_id,
          block_id: blockId,
          title: taskTitle,
        }),
      });
      setNewTaskTitle('');
      setAddingTaskToBlock(null);
      setQuickTasks([]);
      toast.success('Task created');
      
      // Refresh just this block's tasks
      const res = await fetch(`/api/tasks?block_id=${blockId}`);
      const tasks: Task[] = await res.json();
      setBlockTasks(prev => ({ ...prev, [blockId]: tasks }));
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error('Failed to create task');
    } finally {
      setSavingTask(false);
    }
  };

  const fetchQuickTasks = async (projectId: string) => {
    try {
      const res = await fetch(`/api/task-templates?project_id=${projectId}`);
      const data = await res.json();
      setQuickTasks(data);
      return data;
    } catch {
      setQuickTasks([]);
      return [];
    }
  };

  const startAddingTask = async (blockId: string, projectId: string | null) => {
    setAddingTaskToBlock(blockId);
    if (projectId) {
      const templates = await fetchQuickTasks(projectId);
      if (templates.length > 0) {
        setPopoverBlockId(blockId);
      }
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string, blockId: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    setTogglingTask(taskId);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(newStatus === 'done' ? 'Task completed' : 'Task reopened');
      
      // Refresh just this block's tasks
      const res = await fetch(`/api/tasks?block_id=${blockId}`);
      const tasks: Task[] = await res.json();
      setBlockTasks(prev => ({ ...prev, [blockId]: tasks }));
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    } finally {
      setTogglingTask(null);
    }
  };

  const prevDate = new Date(selectedDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(selectedDate);
  nextDate.setDate(nextDate.getDate() + 1);
  
  const weekDays = getWeekDays(selectedDate);

  return (
    <div className="flex flex-col h-full">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-center gap-1 px-4 py-3 border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateDay(-7)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {weekDays.map((day, index) => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const isToday = day.toDateString() === new Date().toDateString();
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = day.getDate();
            const monthName = day.toLocaleDateString('en-US', { month: 'short' });
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors min-w-[52px] ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : isToday 
                      ? 'bg-muted' 
                      : 'hover:bg-muted'
                }`}
              >
                <span className={`text-[10px] uppercase ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {monthName}
                </span>
                <span className={`text-xl font-bold ${isSelected ? '' : ''}`}>
                  {dayNum}
                </span>
                <span className={`text-[10px] uppercase ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {dayName}
                </span>
              </button>
            );
          })}
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateDay(7)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loadingBlocks ? (
          // Skeleton loading for blocks
          <div className="space-y-6 max-w-2xl">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-4" />
                  <Skeleton className="w-24 h-4" />
                </div>
                <div className="pl-16 space-y-1">
                  <Skeleton className="w-48 h-4" />
                  <Skeleton className="w-36 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl">
            {blocks.map((block) => {
              const project = projects.find(p => p.id === block.project_id);
              const tasks = blockTasks[block.id] || [];
              const isLoadingTasks = loadingTasks[block.id];
              
              return (
                <div key={block.id} className="group">
                  {/* Block Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-muted-foreground w-12 font-mono">
                      {formatHour(block.start_hour)}-{formatHour(block.end_hour)}
                    </span>
                    <button
                      onClick={() => setEditingBlockProject(block)}
                      className="flex items-center gap-2 hover:opacity-80"
                    >
                      {project ? (
                        <>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                          <span className="font-medium">{project.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">+ assign project</span>
                      )}
                    </button>
                    <button
                      onClick={() => setEditingBlockTime(block)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                      title="Edit time block"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingBlockTime(block)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                      title="Edit time"
                    >
                      <Clock className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Tasks */}
                  <div className="pl-16 space-y-1">
                    {isLoadingTasks ? (
                      // Skeleton for tasks
                      <>
                        <Skeleton className="w-40 h-4" />
                        <Skeleton className="w-32 h-4" />
                      </>
                    ) : (
                      <>
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-2 py-0.5 group/task">
                            <button
                              onClick={() => toggleTaskStatus(task.id, task.status, block.id)}
                              disabled={togglingTask === task.id}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                task.status === 'done'
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground/40 hover:border-primary'
                              }`}
                            >
                              {togglingTask === task.id ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : task.status === 'done' ? (
                                <Check className="w-2.5 h-2.5" />
                              ) : null}
                            </button>
                            <span className={`text-sm flex-1 ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </span>
                            {/* Show existing tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                {task.tags.map(tag => (
                                  <span
                                    key={tag.id}
                                    className="text-xs px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Tag button */}
                            <button
                              onClick={() => setEditingTaskTags(task)}
                              className="opacity-0 group-hover/task:opacity-100 text-muted-foreground hover:text-foreground"
                              title="Add tags"
                            >
                              <Tag className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {/* Add Task */}
                        {block.project_id && (
                          addingTaskToBlock === block.id ? (
                            <Popover 
                              open={popoverBlockId === block.id && quickTasks.length > 0} 
                              onOpenChange={(open) => {
                                if (!open) {
                                  setPopoverBlockId(null);
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !savingTask) addTask(block.id);
                                      if (e.key === 'Escape') {
                                        setAddingTaskToBlock(null);
                                        setPopoverBlockId(null);
                                        setNewTaskTitle('');
                                        setQuickTasks([]);
                                      }
                                    }}
                                    placeholder="New task..."
                                    className="text-sm bg-transparent outline-none flex-1 py-0.5"
                                    autoFocus
                                    disabled={savingTask}
                                  />
                                  {savingTask && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-56 p-1" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                                <div className="text-xs text-muted-foreground px-2 py-1.5 font-medium">
                                  Quick Tasks
                                </div>
                                {quickTasks.map((qt) => (
                                  <button
                                    key={qt.id}
                                    type="button"
                                    onClick={() => {
                                      addTask(block.id, qt.title);
                                      setPopoverBlockId(null);
                                    }}
                                    disabled={savingTask}
                                    className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted transition-colors"
                                  >
                                    {qt.title}
                                  </button>
                                ))}
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startAddingTask(block.id, block.project_id)}
                              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground py-0.5"
                            >
                              <Plus className="w-3 h-3" />
                              <span>add task</span>
                            </button>
                          )
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectSelectModal
        open={!!editingBlockProject}
        onOpenChange={(open: boolean) => !open && setEditingBlockProject(null)}
        currentProjectId={editingBlockProject?.project_id || null}
        onSelect={(projectId: string | null) => {
          if (editingBlockProject) {
            updateBlockProject(editingBlockProject.id, projectId);
            setEditingBlockProject(null);
          }
        }}
      />

      <TimeBlockModal
        open={!!editingBlockTime}
        onOpenChange={(open: boolean) => !open && setEditingBlockTime(null)}
        block={editingBlockTime}
        allBlocks={blocks}
        onSave={(updatedBlocks: DayBlock[]) => {
          updateBlockTimes(updatedBlocks);
          setEditingBlockTime(null);
        }}
      />

      <TaskTagModal
        task={editingTaskTags}
        open={!!editingTaskTags}
        onOpenChange={(open: boolean) => !open && setEditingTaskTags(null)}
        onUpdate={() => {
          if (editingTaskTags) {
            // Find which block this task belongs to and refresh it
            const blockId = blocks.find(b => 
              (blockTasks[b.id] || []).some(t => t.id === editingTaskTags.id)
            )?.id;
            if (blockId) {
              fetch(`/api/tasks?block_id=${blockId}`)
                .then(res => res.json())
                .then(tasks => setBlockTasks(prev => ({ ...prev, [blockId]: tasks })));
            }
          }
        }}
      />
    </div>
  );
}
