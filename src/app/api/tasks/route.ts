import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const workspaceId = searchParams.get('workspace_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const pending = searchParams.get('pending');
  
  let query = `
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE 1=1
  `;
  const params: (string | null)[] = [];
  
  if (projectId) {
    query += ' AND t.project_id = ?';
    params.push(projectId);
  }
  
  if (workspaceId) {
    query += ' AND p.workspace_id = ?';
    params.push(workspaceId);
  }
  
  if (startDate && endDate) {
    query += ' AND t.scheduled_at >= ? AND t.scheduled_at <= ?';
    params.push(startDate, endDate);
  }
  
  if (pending === 'true') {
    query += " AND t.status = 'pending' AND t.scheduled_at < datetime('now')";
  }
  
  query += ' ORDER BY t.scheduled_at ASC';
  
  const tasks = db.prepare(query).all(...params) as Record<string, unknown>[];
  
  // Get tags for each task
  const tasksWithTags = tasks.map((task) => {
    const tags = db.prepare(`
      SELECT tg.* FROM tags tg
      JOIN task_tags tt ON tg.id = tt.tag_id
      WHERE tt.task_id = ?
    `).all(task.id);
    return {
      ...task,
      project: { id: task.project_id, name: task.project_name, color: task.project_color },
      tags
    };
  });
  
  return NextResponse.json(tasksWithTags);
}

export async function POST(request: Request) {
  const { project_id, title, description, scheduled_at, duration_minutes, tag_ids } = await request.json();
  const id = uuid();
  
  db.prepare(`
    INSERT INTO tasks (id, project_id, title, description, scheduled_at, duration_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, project_id, title, description || null, scheduled_at || null, duration_minutes || null);
  
  // Add tags
  if (tag_ids && tag_ids.length > 0) {
    const insertTag = db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)');
    for (const tagId of tag_ids) {
      insertTag.run(id, tagId);
    }
  }
  
  const task = db.prepare(`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `).get(id) as Record<string, unknown>;
  
  const tags = db.prepare(`
    SELECT tg.* FROM tags tg
    JOIN task_tags tt ON tg.id = tt.tag_id
    WHERE tt.task_id = ?
  `).all(id);
  
  return NextResponse.json({
    ...task,
    project: { id: task.project_id, name: task.project_name, color: task.project_color },
    tags
  });
}
