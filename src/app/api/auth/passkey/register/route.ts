import { NextResponse } from 'next/server';
import { createRegistrationOptions, verifyRegistration } from '@/lib/passkey';
import { createSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const options = await createRegistrationOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error('Registration options error:', error);
    return NextResponse.json({ error: 'Failed to create registration options' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const verification = await verifyRegistration(body);
    
    if (verification.verified) {
      const token = await createSession();
      const cookieStore = await cookies();
      
      cookieStore.set('dtdt-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      
      return NextResponse.json({ verified: true });
    }
    
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  } catch (error) {
    console.error('Registration verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
