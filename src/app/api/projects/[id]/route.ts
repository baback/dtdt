import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, color } = await request.json();
  
  db.prepare('UPDATE projects SET name = ?, color = ? WHERE id = ?').run(name, color, id);
  
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  return NextResponse.json(project);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
