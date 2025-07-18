import * as crypto from 'crypto';

export function hashTokenString(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function generateRandomString() {
  const plainTextToken = crypto.randomBytes(32).toString('hex');
  return hashTokenString(plainTextToken);
}
