import crypto from 'crypto';

// Generates a short random uppercase code like "A3FX9K"
// crypto is built into Node — no extra package needed
export const generateInviteCode = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};