import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  const { rows } = await sql`SELECT * FROM projects WHERE id = ${id}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  const { name, color } = await request.json();
  
  await sql`UPDATE projects SET name = ${name}, color = ${color} WHERE id = ${id}`;
  
  const { rows } = await sql`SELECT * FROM projects WHERE id = ${id}`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  await sql`DELETE FROM projects WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
