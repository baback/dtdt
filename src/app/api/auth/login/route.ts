import { NextResponse } from 'next/server';
import { verifyPassword, createSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { password } = await request.json();
  
  const isValid = await verifyPassword(password);
  
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  
  const token = await createSession();
  const cookieStore = await cookies();
  
  cookieStore.set('dtdt-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  return NextResponse.json({ success: true });
}
