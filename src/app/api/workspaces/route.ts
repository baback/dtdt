import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  try {
    await initDB();
    const { rows } = await sql`SELECT * FROM workspaces ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET /api/workspaces error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const { name } = await request.json();
    const id = uuid();
    
    await sql`INSERT INTO workspaces (id, name) VALUES (${id}, ${name})`;
    
    const { rows } = await sql`SELECT * FROM workspaces WHERE id = ${id}`;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('POST /api/workspaces error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
