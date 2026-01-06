import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const { id } = await params;
    await sql`DELETE FROM task_templates WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/task-templates/[id] error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
