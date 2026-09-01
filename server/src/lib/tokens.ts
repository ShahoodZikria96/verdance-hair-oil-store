import crypto from 'node:crypto';

/** A high-entropy opaque token (for refresh tokens, password resets). */
export const randomToken = (bytes = 48): string =>
  crypto.randomBytes(bytes).toString('hex');

/** Deterministic hash stored in the DB so raw tokens are never persisted. */
export const sha256 = (value: string): string =>
  crypto.createHash('sha256').update(value).digest('hex');
