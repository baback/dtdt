import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  await sql`DELETE FROM tags WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
