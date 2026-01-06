import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS passkeys (
        id TEXT PRIMARY KEY,
        credential_id TEXT UNIQUE NOT NULL,
        public_key TEXT NOT NULL,
        counter INTEGER DEFAULT 0,
        device_type TEXT,
        backed_up BOOLEAN DEFAULT false,
        transports TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Init passkeys table error:', error);
    return NextResponse.json({ error: 'Failed to init' }, { status: 500 });
  }
}
