# DTDT - Do The Damn Thing

Personal task management app with time tracking and accountability.

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- SQLite (local database via better-sqlite3)
- Zustand (state management)

## Database Schema

```sql
-- Workspaces
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects (belong to workspace)
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

-- Tags (workspace-level)
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at DATETIME,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'pending', -- pending, done, extended, missed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Task-Tag junction
CREATE TABLE task_tags (
  task_id TEXT,
  tag_id TEXT,
  PRIMARY KEY (task_id, tag_id)
);

-- Timer sessions
CREATE TABLE timer_sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  started_at DATETIME,
  duration_seconds INTEGER,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

---

## Implementation TODO

### Phase 1: Project Setup
- [x] Initialize Next.js 16 with App Router
- [x] Install and configure Tailwind CSS v4
- [x] Install and configure shadcn/ui (latest)
- [x] Set up SQLite with better-sqlite3
- [x] Create database schema and migrations
- [x] Set up API routes structure

### Phase 2: Core Data Layer
- [x] Workspace CRUD API routes
- [x] Project CRUD API routes
- [x] Tag CRUD API routes
- [x] Task CRUD API routes
- [x] Timer session API routes

### Phase 3: UI Components
- [x] Layout with sidebar (workspace/project navigation)
- [x] Calendar view component
  - [x] List view
  - [x] Day view
  - [x] Week view
  - [x] Month view
- [x] Task card component
- [x] Task detail modal
- [x] Create/edit task form
- [x] Project selector
- [x] Tag selector/creator

### Phase 4: Timer Feature
- [x] Countdown timer component
- [x] Timer controls (start, pause, reset)
- [x] Timer state persistence
- [x] Sound notification on complete

### Phase 5: Task Status & Accountability
- [x] Task status update (done, extended, missed)
- [x] Pending tasks review modal (on app load)
- [x] Query for unresolved past tasks
- [x] Bulk status update UI

### Phase 6: Polish (Future)
- [x] Workspace switcher
- [ ] Keyboard shortcuts
- [ ] Dark mode support
- [ ] Mobile responsive
- [ ] Data export/import

---

## File Structure

```
dtdt/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   ├── workspaces/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── tags/
│   │   └── timer/
│   └── (dashboard)/
│       ├── layout.tsx
│       └── calendar/
├── components/
│   ├── ui/ (shadcn)
│   ├── calendar/
│   ├── task/
│   ├── timer/
│   └── sidebar/
├── lib/
│   ├── db.ts
│   ├── schema.ts
│   └── utils.ts
├── hooks/
├── store/
└── types/
```

---

## Notes
- SQLite is perfect for personal/local use - no server needed
- better-sqlite3 is synchronous and fast for this use case
- Data stays on your machine
- Can add sync later if needed (export/import JSON)
