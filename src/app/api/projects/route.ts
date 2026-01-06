import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspace_id');
  
  if (workspaceId) {
    const projects = db.prepare('SELECT * FROM projects WHERE workspace_id = ? ORDER BY created_at DESC').all(workspaceId);
    return NextResponse.json(projects);
  }
  
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { workspace_id, name, color } = await request.json();
  const id = uuid();
  
  db.prepare('INSERT INTO projects (id, workspace_id, name, color) VALUES (?, ?, ?, ?)').run(id, workspace_id, name, color || '#6366f1');
  
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  return NextResponse.json(project);
}
