'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useData } from '@/hooks/use-data';
import { Toaster } from '@/components/ui/sonner';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { currentWorkspaceId, setCurrentWorkspaceId } = useAppStore();
  const { fetchWorkspaces, fetchProjects, fetchTags, fetchTasks, fetchPendingTasks, createWorkspace } = useData();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const init = async () => {
      const workspaces = await fetchWorkspaces();
      
      // Create default workspace if none exists
      if (workspaces.length === 0) {
        const ws = await createWorkspace('My Workspace');
        if (ws) {
          setCurrentWorkspaceId(ws.id);
        }
      } else {
        // Validate current workspace ID exists, otherwise use first workspace
        const validWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);
        if (!validWorkspace) {
          setCurrentWorkspaceId(workspaces[0].id);
        }
      }
    };

    init();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !currentWorkspaceId) return;

    const loadData = async () => {
      await Promise.all([
        fetchProjects(currentWorkspaceId),
        fetchTags(currentWorkspaceId),
        fetchTasks(),
      ]);
      
      // Check for pending tasks on load
      await fetchPendingTasks();
    };

    loadData();
  }, [mounted, currentWorkspaceId]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
