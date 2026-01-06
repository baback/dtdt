import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace, Project, Tag, Task, CalendarView } from '@/types';

interface AppState {
  // Current selections
  currentWorkspaceId: string | null;
  currentView: CalendarView;
  selectedDate: Date;
  
  // Data
  workspaces: Workspace[];
  projects: Project[];
  tags: Tag[];
  tasks: Task[];
  pendingTasks: Task[];
  
  // UI state
  showPendingReview: boolean;
  selectedTaskId: string | null;
  showTaskModal: boolean;
  showCreateTask: boolean;
  
  // Timer
  timerDuration: number;
  timerRemaining: number;
  timerRunning: boolean;
  timerTaskId: string | null;
  
  // Actions
  setCurrentWorkspaceId: (id: string | null) => void;
  setCurrentView: (view: CalendarView) => void;
  setSelectedDate: (date: Date) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setProjects: (projects: Project[]) => void;
  setTags: (tags: Tag[]) => void;
  setTasks: (tasks: Task[]) => void;
  setPendingTasks: (tasks: Task[]) => void;
  setShowPendingReview: (show: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
  setShowTaskModal: (show: boolean) => void;
  setShowCreateTask: (show: boolean) => void;
  setTimerDuration: (seconds: number) => void;
  setTimerRemaining: (seconds: number) => void;
  setTimerRunning: (running: boolean) => void;
  setTimerTaskId: (id: string | null) => void;
  resetTimer: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentWorkspaceId: null,
      currentView: 'week',
      selectedDate: new Date(),
      workspaces: [],
      projects: [],
      tags: [],
      tasks: [],
      pendingTasks: [],
      showPendingReview: false,
      selectedTaskId: null,
      showTaskModal: false,
      showCreateTask: false,
      timerDuration: 25 * 60,
      timerRemaining: 25 * 60,
      timerRunning: false,
      timerTaskId: null,
      
      setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      setProjects: (projects) => set({ projects }),
      setTags: (tags) => set({ tags }),
      setTasks: (tasks) => set({ tasks }),
      setPendingTasks: (tasks) => set({ pendingTasks: tasks }),
      setShowPendingReview: (show) => set({ showPendingReview: show }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setShowTaskModal: (show) => set({ showTaskModal: show }),
      setShowCreateTask: (show) => set({ showCreateTask: show }),
      setTimerDuration: (seconds) => set({ timerDuration: seconds, timerRemaining: seconds }),
      setTimerRemaining: (seconds) => set({ timerRemaining: seconds }),
      setTimerRunning: (running) => set({ timerRunning: running }),
      setTimerTaskId: (id) => set({ timerTaskId: id }),
      resetTimer: () => set((state) => ({ timerRemaining: state.timerDuration, timerRunning: false })),
    }),
    {
      name: 'dtdt-storage',
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
        currentView: state.currentView,
        timerDuration: state.timerDuration,
      }),
    }
  )
);
