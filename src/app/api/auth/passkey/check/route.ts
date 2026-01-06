import { NextResponse } from 'next/server';
import { hasPasskeys } from '@/lib/passkey';

export async function GET() {
  try {
    const hasRegisteredPasskeys = await hasPasskeys();
    return NextResponse.json({ hasPasskeys: hasRegisteredPasskeys });
  } catch (error) {
    console.error('Check passkeys error:', error);
    return NextResponse.json({ hasPasskeys: false });
  }
}
