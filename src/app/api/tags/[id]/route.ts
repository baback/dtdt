import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  const { name, color, icon } = await request.json();
  
  await sql`UPDATE tags SET name = ${name}, color = ${color}, icon = ${icon} WHERE id = ${id}`;
  
  const { rows } = await sql`SELECT * FROM tags WHERE id = ${id}`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  await sql`DELETE FROM tags WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
