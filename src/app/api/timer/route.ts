import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  const sessions = db.prepare('SELECT * FROM timer_sessions ORDER BY started_at DESC LIMIT 50').all();
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const { task_id, duration_seconds } = await request.json();
  const id = uuid();
  
  db.prepare(`
    INSERT INTO timer_sessions (id, task_id, started_at, duration_seconds)
    VALUES (?, ?, datetime('now'), ?)
  `).run(id, task_id || null, duration_seconds);
  
  const session = db.prepare('SELECT * FROM timer_sessions WHERE id = ?').get(id);
  return NextResponse.json(session);
}
