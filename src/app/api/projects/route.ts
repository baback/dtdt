import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(request: Request) {
  await initDB();
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspace_id');
  
  if (workspaceId) {
    const { rows } = await sql`SELECT * FROM projects WHERE workspace_id = ${workspaceId} ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  }
  
  const { rows } = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  await initDB();
  const { workspace_id, name, color } = await request.json();
  const id = uuid();
  const projectColor = color || '#6366f1';
  
  await sql`INSERT INTO projects (id, workspace_id, name, color) VALUES (${id}, ${workspace_id}, ${name}, ${projectColor})`;
  
  const { rows } = await sql`SELECT * FROM projects WHERE id = ${id}`;
  return NextResponse.json(rows[0]);
}
