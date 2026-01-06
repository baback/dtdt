export interface Workspace {
  id: string;
  name: string;
  created_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Tag {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  status: 'pending' | 'done' | 'extended' | 'missed';
  created_at: string;
  completed_at: string | null;
  project?: Project;
  tags?: Tag[];
}

export interface TaskTag {
  task_id: string;
  tag_id: string;
}

export interface TimerSession {
  id: string;
  task_id: string | null;
  started_at: string;
  duration_seconds: number;
}

export type CalendarView = 'list' | 'day' | 'week' | 'month';
