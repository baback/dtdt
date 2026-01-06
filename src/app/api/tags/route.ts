import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(request: Request) {
  await initDB();
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspace_id');
  
  if (workspaceId) {
    const { rows } = await sql`SELECT * FROM tags WHERE workspace_id = ${workspaceId}`;
    return NextResponse.json(rows);
  }
  
  const { rows } = await sql`SELECT * FROM tags`;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  await initDB();
  const { workspace_id, name, color, icon } = await request.json();
  const id = uuid();
  const tagColor = color || '#8b5cf6';
  const tagIcon = icon || 'tag';
  
  await sql`INSERT INTO tags (id, workspace_id, name, color, icon) VALUES (${id}, ${workspace_id}, ${name}, ${tagColor}, ${tagIcon})`;
  
  const { rows } = await sql`SELECT * FROM tags WHERE id = ${id}`;
  return NextResponse.json(rows[0]);
}
