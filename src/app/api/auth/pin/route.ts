import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

// Initialize PIN table
async function initPinTable() {
  await initDB();
  await sql`
    CREATE TABLE IF NOT EXISTS auth_pin (
      id INTEGER PRIMARY KEY,
      pin_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

// GET - check if PIN is set
export async function GET() {
  try {
    await initPinTable();
    const { rows } = await sql`SELECT 1 FROM auth_pin LIMIT 1`;
    return NextResponse.json({ hasPin: rows.length > 0 });
  } catch {
    return NextResponse.json({ hasPin: false });
  }
}

// POST - set or verify PIN
export async function POST(request: Request) {
  try {
    await initPinTable();
    const { pin, action } = await request.json();
    
    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 });
    }

    const pinHash = hashPin(pin);
    const { rows } = await sql`SELECT pin_hash FROM auth_pin LIMIT 1`;

    if (action === 'setup' || rows.length === 0) {
      // Setting up new PIN
      if (rows.length > 0) {
        await sql`UPDATE auth_pin SET pin_hash = ${pinHash}`;
      } else {
        await sql`INSERT INTO auth_pin (id, pin_hash) VALUES (1, ${pinHash})`;
      }
      
      // Create session
      const token = await createSession();
      const cookieStore = await cookies();
      cookieStore.set('dtdt-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
      
      return NextResponse.json({ success: true, action: 'setup' });
    }

    // Verifying PIN
    if (rows[0].pin_hash === pinHash) {
      const token = await createSession();
      const cookieStore = await cookies();
      cookieStore.set('dtdt-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      
      return NextResponse.json({ success: true, action: 'login' });
    }

    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  } catch (error) {
    console.error('PIN auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
