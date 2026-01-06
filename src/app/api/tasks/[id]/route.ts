import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const task = db.prepare(`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `).get(id) as Record<string, unknown> | undefined;
  
  if (!task) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, description, scheduled_at, duration_minutes, status, project_id, tag_ids } = await request.json();
  
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  
  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (scheduled_at !== undefined) { updates.push('scheduled_at = ?'); values.push(scheduled_at); }
  if (duration_minutes !== undefined) { updates.push('duration_minutes = ?'); values.push(duration_minutes); }
  if (project_id !== undefined) { updates.push('project_id = ?'); values.push(project_id); }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
    if (status === 'done') {
      updates.push('completed_at = datetime("now")');
    }
  }
  
  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  
  // Update tags
  if (tag_ids !== undefined) {
    db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(id);
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
