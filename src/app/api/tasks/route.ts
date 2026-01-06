import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(request: Request) {
  await initDB();
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspace_id');
  const pending = searchParams.get('pending');
  
  let tasks;
  
  if (pending === 'true' && workspaceId) {
    const result = await sql`
      SELECT t.*, p.name as project_name, p.color as project_color
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id = ${workspaceId}
        AND t.status = 'pending'
        AND t.scheduled_at < NOW()
      ORDER BY t.scheduled_at ASC
    `;
    tasks = result.rows;
  } else if (workspaceId) {
    const result = await sql`
      SELECT t.*, p.name as project_name, p.color as project_color
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id = ${workspaceId}
      ORDER BY t.scheduled_at ASC
    `;
    tasks = result.rows;
  } else {
    const result = await sql`
      SELECT t.*, p.name as project_name, p.color as project_color
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      ORDER BY t.scheduled_at ASC
    `;
    tasks = result.rows;
  }
  
  // Get tags for each task
  const tasksWithTags = await Promise.all(
    tasks.map(async (task) => {
      const { rows: tags } = await sql`
        SELECT tg.* FROM tags tg
        JOIN task_tags tt ON tg.id = tt.tag_id
        WHERE tt.task_id = ${task.id}
      `;
      return {
        ...task,
        project: { id: task.project_id, name: task.project_name, color: task.project_color },
        tags
      };
    })
  );
  
  return NextResponse.json(tasksWithTags);
}

export async function POST(request: Request) {
  await initDB();
  const { project_id, title, description, scheduled_at, duration_minutes, tag_ids } = await request.json();
  const id = uuid();
  
  await sql`
    INSERT INTO tasks (id, project_id, title, description, scheduled_at, duration_minutes)
    VALUES (${id}, ${project_id}, ${title}, ${description || null}, ${scheduled_at || null}, ${duration_minutes || null})
  `;
  
  // Add tags
  if (tag_ids && tag_ids.length > 0) {
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
