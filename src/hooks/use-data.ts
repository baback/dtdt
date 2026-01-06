'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import type { Workspace, Project, Tag, Task } from '@/types';

export function useData() {
  const {
    currentWorkspaceId,
    setWorkspaces,
    setProjects,
    setTags,
    setTasks,
    setPendingTasks,
    setShowPendingReview,
  } = useAppStore();

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch('/api/workspaces');
      if (!res.ok) throw new Error('Failed to fetch workspaces');
      const data: Workspace[] = await res.json();
      setWorkspaces(data);
      return data;
    } catch (error) {
      console.error('fetchWorkspaces error:', error);
      return [];
    }
  }, [setWorkspaces]);

  const createWorkspace = useCallback(async (name: string) => {
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create workspace');
      const workspace: Workspace = await res.json();
      await fetchWorkspaces();
      return workspace;
    } catch (error) {
      console.error('createWorkspace error:', error);
      return null;
    }
  }, [fetchWorkspaces]);

  const updateWorkspace = useCallback(async (id: string, name: string) => {
    const res = await fetch(`/api/workspaces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const workspace: Workspace = await res.json();
    await fetchWorkspaces();
    return workspace;
  }, [fetchWorkspaces]);

  const deleteWorkspace = useCallback(async (id: string) => {
    await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
    await fetchWorkspaces();
  }, [fetchWorkspaces]);

  const fetchProjects = useCallback(async (workspaceId?: string) => {
    const id = workspaceId || currentWorkspaceId;
    if (!id) return [];
    const res = await fetch(`/api/projects?workspace_id=${id}`);
    const data: Project[] = await res.json();
    setProjects(data);
    return data;
  }, [currentWorkspaceId, setProjects]);

  const createProject = useCallback(async (name: string, color?: string) => {
    if (!currentWorkspaceId) return null;
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: currentWorkspaceId, name, color }),
    });
    const project: Project = await res.json();
    await fetchProjects();
    return project;
  }, [currentWorkspaceId, fetchProjects]);

  const updateProject = useCallback(async (id: string, name: string, color: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    const project: Project = await res.json();
    await fetchProjects();
    return project;
  }, [fetchProjects]);

  const deleteProject = useCallback(async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    await fetchProjects();
  }, [fetchProjects]);

  const fetchTags = useCallback(async (workspaceId?: string) => {
    const id = workspaceId || currentWorkspaceId;
    if (!id) return [];
    const res = await fetch(`/api/tags?workspace_id=${id}`);
    const data: Tag[] = await res.json();
    setTags(data);
    return data;
  }, [currentWorkspaceId, setTags]);

  const createTag = useCallback(async (name: string, color?: string, icon?: string) => {
    if (!currentWorkspaceId) return null;
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: currentWorkspaceId, name, color, icon }),
    });
    const tag: Tag = await res.json();
    await fetchTags();
    return tag;
  }, [currentWorkspaceId, fetchTags]);

  const updateTag = useCallback(async (id: string, name: string, color: string, icon: string) => {
    const res = await fetch(`/api/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color, icon }),
    });
    const tag: Tag = await res.json();
    await fetchTags();
    return tag;
  }, [fetchTags]);

  const deleteTag = useCallback(async (id: string) => {
    await fetch(`/api/tags/${id}`, { method: 'DELETE' });
    await fetchTags();
  }, [fetchTags]);

  const fetchTasks = useCallback(async (startDate?: string, endDate?: string) => {
    if (!currentWorkspaceId) return [];
    let url = `/api/tasks?workspace_id=${currentWorkspaceId}`;
    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    const res = await fetch(url);
    const data: Task[] = await res.json();
    setTasks(data);
    return data;
  }, [currentWorkspaceId, setTasks]);

  const fetchPendingTasks = useCallback(async () => {
    if (!currentWorkspaceId) return [];
    const res = await fetch(`/api/tasks?workspace_id=${currentWorkspaceId}&pending=true`);
    const data: Task[] = await res.json();
    setPendingTasks(data);
    if (data.length > 0) {
      setShowPendingReview(true);
    }
    return data;
  }, [currentWorkspaceId, setPendingTasks, setShowPendingReview]);

  const createTask = useCallback(async (task: {
    project_id: string;
    title: string;
    description?: string;
    scheduled_at?: string;
    duration_minutes?: number;
    tag_ids?: string[];
  }) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const newTask: Task = await res.json();
    await fetchTasks();
    return newTask;
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task> & { tag_ids?: string[] }) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const task: Task = await res.json();
    await fetchTasks();
    return task;
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    await fetchTasks();
  }, [fetchTasks]);

  const updateTaskStatus = useCallback(async (id: string, status: 'done' | 'extended' | 'missed') => {
    return updateTask(id, { status });
  }, [updateTask]);

  return {
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    fetchTasks,
    fetchPendingTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  };
}
