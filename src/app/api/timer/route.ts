import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  await initDB();
  const { rows } = await sql`SELECT * FROM timer_sessions ORDER BY started_at DESC LIMIT 50`;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  await initDB();
  const { task_id, duration_seconds } = await request.json();
  const id = uuid();
  
  await sql`
    INSERT INTO timer_sessions (id, task_id, started_at, duration_seconds)
    VALUES (${id}, ${task_id || null}, NOW(), ${duration_seconds})
  `;
  
  const { rows } = await sql`SELECT * FROM timer_sessions WHERE id = ${id}`;
  return NextResponse.json(rows[0]);
}
