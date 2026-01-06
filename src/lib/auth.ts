import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret-change-me');
const PASSWORD_HASH = process.env.AUTH_PASSWORD_HASH || '';

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = createHash('sha256').update(password).digest('hex');
  return hash === PASSWORD_HASH;
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
  
  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('dtdt-session')?.value;
  
  if (!token) return false;
  return verifySession(token);
}
