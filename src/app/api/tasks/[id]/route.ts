import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  
  const { rows } = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = ${id}
  `;
  
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  const { rows: tags } = await sql`
    SELECT tg.* FROM tags tg
    JOIN task_tags tt ON tg.id = tt.tag_id
    WHERE tt.task_id = ${id}
  `;
  
  return NextResponse.json({
    ...rows[0],
    project: { id: rows[0].project_id, name: rows[0].project_name, color: rows[0].project_color },
    tags
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  const body = await request.json();
  const { title, description, scheduled_at, duration_minutes, status, project_id, tag_ids } = body;
  
  // Build dynamic update
  if (title !== undefined) {
    await sql`UPDATE tasks SET title = ${title} WHERE id = ${id}`;
  }
  if (description !== undefined) {
    await sql`UPDATE tasks SET description = ${description} WHERE id = ${id}`;
  }
  if (scheduled_at !== undefined) {
    await sql`UPDATE tasks SET scheduled_at = ${scheduled_at} WHERE id = ${id}`;
  }
  if (duration_minutes !== undefined) {
    await sql`UPDATE tasks SET duration_minutes = ${duration_minutes} WHERE id = ${id}`;
  }
  if (project_id !== undefined) {
    await sql`UPDATE tasks SET project_id = ${project_id} WHERE id = ${id}`;
  }
  if (status !== undefined) {
    await sql`UPDATE tasks SET status = ${status} WHERE id = ${id}`;
    if (status === 'done') {
      await sql`UPDATE tasks SET completed_at = NOW() WHERE id = ${id}`;
    }
  }
  
  // Update tags
  if (tag_ids !== undefined) {
    await sql`DELETE FROM task_tags WHERE task_id = ${id}`;
    for (const tagId of tag_ids) {
      await sql`INSERT INTO task_tags (task_id, tag_id) VALUES (${id}, ${tagId})`;
    }
  }
  
  const { rows } = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = ${id}
  `;
  
  const { rows: tags } = await sql`
    SELECT tg.* FROM tags tg
    JOIN task_tags tt ON tg.id = tt.tag_id
    WHERE tt.task_id = ${id}
  `;
  
  return NextResponse.json({
    ...rows[0],
    project: { id: rows[0].project_id, name: rows[0].project_name, color: rows[0].project_color },
    tags
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  await sql`DELETE FROM tasks WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
