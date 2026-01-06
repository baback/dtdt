import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  const workspaces = db.prepare('SELECT * FROM workspaces ORDER BY created_at DESC').all();
  return NextResponse.json(workspaces);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  const id = uuid();
  
  db.prepare('INSERT INTO workspaces (id, name) VALUES (?, ?)').run(id, name);
  
  const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id);
  return NextResponse.json(workspace);
}
