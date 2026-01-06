import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspace_id');
  
  if (workspaceId) {
    const tags = db.prepare('SELECT * FROM tags WHERE workspace_id = ?').all(workspaceId);
    return NextResponse.json(tags);
  }
  
  const tags = db.prepare('SELECT * FROM tags').all();
  return NextResponse.json(tags);
}

export async function POST(request: Request) {
  const { workspace_id, name, color } = await request.json();
  const id = uuid();
  
  db.prepare('INSERT INTO tags (id, workspace_id, name, color) VALUES (?, ?, ?, ?)').run(id, workspace_id, name, color || '#8b5cf6');
  
  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
  return NextResponse.json(tag);
}
