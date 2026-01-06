import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
