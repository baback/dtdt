import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id);
  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(workspace);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name } = await request.json();
  
  db.prepare('UPDATE workspaces SET name = ? WHERE id = ?').run(name, id);
  
  const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id);
  return NextResponse.json(workspace);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('DELETE FROM workspaces WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
