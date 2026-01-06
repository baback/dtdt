import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { sql, initDB } from './db';
import { v4 as uuid } from 'uuid';

const rpName = 'DTDT';
const rpID = process.env.PASSKEY_RP_ID || 'localhost';
const origin = process.env.PASSKEY_ORIGIN || 'http://localhost:3000';

// In-memory challenge store (in production, use Redis or DB)
const challenges = new Map<string, string>();

export interface StoredPasskey {
  id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_type: string | null;
  backed_up: boolean;
  transports: string | null;
}

export async function getPasskeys(): Promise<StoredPasskey[]> {
  await initDB();
  const { rows } = await sql`SELECT * FROM passkeys`;
  return rows as StoredPasskey[];
}

export async function getPasskeyByCredentialId(credentialId: string): Promise<StoredPasskey | null> {
  await initDB();
  const { rows } = await sql`SELECT * FROM passkeys WHERE credential_id = ${credentialId}`;
  return (rows[0] as StoredPasskey) || null;
}

export async function createRegistrationOptions() {
  const passkeys = await getPasskeys();
  
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: 'dtdt-user',
    userDisplayName: 'DTDT User',
    attestationType: 'none',
    excludeCredentials: passkeys.map((pk) => ({
      id: pk.credential_id,
      transports: pk.transports ? (JSON.parse(pk.transports) as AuthenticatorTransportFuture[]) : undefined,
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  challenges.set('registration', options.challenge);
  return options;
}


export async function verifyRegistration(response: RegistrationResponseJSON) {
  const expectedChallenge = challenges.get('registration');
  if (!expectedChallenge) {
    throw new Error('No challenge found');
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (verification.verified && verification.registrationInfo) {
    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    
    await initDB();
    const id = uuid();
    
    await sql`
      INSERT INTO passkeys (id, credential_id, public_key, counter, device_type, backed_up, transports)
      VALUES (
        ${id},
        ${credential.id},
        ${Buffer.from(credential.publicKey).toString('base64')},
        ${credential.counter},
        ${credentialDeviceType},
        ${credentialBackedUp},
        ${JSON.stringify(credential.transports || [])}
      )
    `;
    
    challenges.delete('registration');
  }

  return verification;
}

export async function createAuthenticationOptions() {
  const passkeys = await getPasskeys();
  
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: passkeys.map((pk) => ({
      id: pk.credential_id,
      transports: pk.transports ? (JSON.parse(pk.transports) as AuthenticatorTransportFuture[]) : undefined,
    })),
    userVerification: 'preferred',
  });

  challenges.set('authentication', options.challenge);
  return options;
}

export async function verifyAuthentication(response: AuthenticationResponseJSON) {
  const expectedChallenge = challenges.get('authentication');
  if (!expectedChallenge) {
    throw new Error('No challenge found');
  }

  const passkey = await getPasskeyByCredentialId(response.id);
  if (!passkey) {
    throw new Error('Passkey not found');
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: passkey.credential_id,
      publicKey: Buffer.from(passkey.public_key, 'base64'),
      counter: passkey.counter,
      transports: passkey.transports ? JSON.parse(passkey.transports) : undefined,
    },
  });

  if (verification.verified) {
    // Update counter
    await sql`
      UPDATE passkeys SET counter = ${verification.authenticationInfo.newCounter}
      WHERE credential_id = ${passkey.credential_id}
    `;
    challenges.delete('authentication');
  }

  return verification;
}

export async function hasPasskeys(): Promise<boolean> {
  const passkeys = await getPasskeys();
  return passkeys.length > 0;
}

export async function deletePasskey(id: string) {
  await initDB();
  await sql`DELETE FROM passkeys WHERE id = ${id}`;
}
