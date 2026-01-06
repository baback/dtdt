import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Add block_id column to tasks table
export async function POST() {
  try {
    await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS block_id TEXT`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
