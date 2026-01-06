import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

// Initialize task_templates table
async function initTaskTemplatesTable() {
  await initDB();
  await sql`
    CREATE TABLE IF NOT EXISTS task_templates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function GET(request: Request) {
  try {
    await initTaskTemplatesTable();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (projectId) {
      const { rows } = await sql`
        SELECT * FROM task_templates WHERE project_id = ${projectId} ORDER BY created_at ASC
      `;
      return NextResponse.json(rows);
    }

    const { rows } = await sql`SELECT * FROM task_templates ORDER BY created_at ASC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET /api/task-templates error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initTaskTemplatesTable();
    const { project_id, title } = await request.json();
    const id = uuid();

    await sql`
      INSERT INTO task_templates (id, project_id, title)
      VALUES (${id}, ${project_id}, ${title})
    `;

    const { rows } = await sql`SELECT * FROM task_templates WHERE id = ${id}`;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('POST /api/task-templates error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
