const CREDENTIAL_STORAGE_KEY = 'mirex_admin_credential_v2';
const LEGACY_AUTH_KEY = 'mirex_admin_auth';
const LOCKOUT_STORAGE_KEY = 'mirex_admin_lockout';

const INITIAL_SALT_PREFIX = 'mirex-init-v1:';
const INITIAL_DIGEST_HEX = '9d8fe18b38499ed7f32b9575c83473b9d22f057272d12a7b6f5c70a785eeeaeb';
const PBKDF2_ITERATIONS = 100_000;

export const ADMIN_HASH_ROUTE = '#/atelier-portal';

interface StoredCredential {
  salt: string;
  hash: string;
  iterations: number;
  updatedAt: string;
}

interface LockoutState {
  attempts: number;
  lockedUntil: number;
}

export function clearLegacyAuthFlag(): void {
  try {
    localStorage.removeItem(LEGACY_AUTH_KEY);
  } catch {
    // ignore storage errors
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest('SHA-256', encoded);
  return bytesToHex(new Uint8Array(digest));
}

async function derivePbkdf2Hex(
  password: string,
  saltHex: string,
  iterations: number
): Promise<string> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const saltBytes = hexToBytes(saltHex);
  const saltBuffer = new Uint8Array(saltBytes).buffer;

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bytesToHex(new Uint8Array(derivedBits));
}

export function getStoredCredential(): StoredCredential | null {
  try {
    const raw = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCredential;
    if (parsed && parsed.salt && parsed.hash && parsed.iterations) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function hasCustomAdminPassword(): boolean {
  return getStoredCredential() !== null;
}

export function validateNewPasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Include at least one letter and one number.';
  }
  return null;
}

export async function verifyAdminPassword(candidate: string): Promise<boolean> {
  const trimmed = candidate.trim();
  if (!trimmed) return false;

  const stored = getStoredCredential();
  if (stored) {
    const derived = await derivePbkdf2Hex(trimmed, stored.salt, stored.iterations);
    return constantTimeEqual(derived, stored.hash);
  }

  const initialCandidateHash = await sha256Hex(INITIAL_SALT_PREFIX + trimmed);
  return constantTimeEqual(initialCandidateHash, INITIAL_DIGEST_HEX);
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const isCurrentValid = await verifyAdminPassword(currentPassword);
  if (!isCurrentValid) {
    return { ok: false, error: 'Current password is incorrect.' };
  }

  const strengthError = validateNewPasswordStrength(newPassword);
  if (strengthError) {
    return { ok: false, error: strengthError };
  }

  const isDefaultReuse = constantTimeEqual(
    await sha256Hex(INITIAL_SALT_PREFIX + newPassword.trim()),
    INITIAL_DIGEST_HEX
  );
  if (isDefaultReuse) {
    return { ok: false, error: 'Please choose a password different from the default.' };
  }

  const saltBytes = new Uint8Array(16);
  window.crypto.getRandomValues(saltBytes);
  const saltHex = bytesToHex(saltBytes);
  const hashHex = await derivePbkdf2Hex(newPassword.trim(), saltHex, PBKDF2_ITERATIONS);

  const record: StoredCredential = {
    salt: saltHex,
    hash: hashHex,
    iterations: PBKDF2_ITERATIONS,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(record));
    resetLockout();
    return { ok: true };
  } catch {
    return { ok: false, error: 'Unable to save password in browser storage.' };
  }
}

export function getLockoutRemainingSeconds(): number {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!raw) return 0;
    const state = JSON.parse(raw) as LockoutState;
    if (!state.lockedUntil) return 0;
    const remainingMs = state.lockedUntil - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  } catch {
    return 0;
  }
}

export function recordFailedAttempt(): number {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_STORAGE_KEY);
    const prev: LockoutState = raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: 0 };
    const nextAttempts = prev.attempts + 1;
    let lockedUntil = 0;

    if (nextAttempts >= 5) {
      lockedUntil = Date.now() + 30_000; // 30s cooldown after 5 failed attempts
    }

    const next: LockoutState = {
      attempts: nextAttempts >= 5 ? 0 : nextAttempts,
      lockedUntil,
    };
    sessionStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(next));
    return lockedUntil ? 30 : 0;
  } catch {
    return 0;
  }
}

export function resetLockout(): void {
  try {
    sessionStorage.removeItem(LOCKOUT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
