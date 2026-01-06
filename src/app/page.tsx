'use client';

import { Sidebar } from '@/components/sidebar';
import { DayPlanner } from '@/components/day-planner';
import { Timer } from '@/components/timer';
import { TaskModal } from '@/components/task-modal';
import { CreateTaskModal } from '@/components/create-task-modal';
import { PendingReviewModal } from '@/components/pending-review-modal';
import { useAppStore } from '@/store/app-store';

export default function Home() {
  const { currentWorkspaceId } = useAppStore();

  return (
    <main className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentWorkspaceId ? (
          <DayPlanner />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select or create a workspace to get started
          </div>
        )}
      </div>

      <div className="w-80 border-l p-4 bg-muted/30 shrink-0 flex flex-col h-full">
        <Timer />
      </div>

      <TaskModal />
      <CreateTaskModal />
      <PendingReviewModal />
    </main>
  );
}
