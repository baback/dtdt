import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  await initDB();
  const { rows } = await sql`SELECT * FROM workspaces ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  await initDB();
  const { name } = await request.json();
  const id = uuid();
  
  await sql`INSERT INTO workspaces (id, name) VALUES (${id}, ${name})`;
  
  const { rows } = await sql`SELECT * FROM workspaces WHERE id = ${id}`;
  return NextResponse.json(rows[0]);
}
