import { StrKey } from '@stellar/stellar-sdk';

export function isValidPublicKey(key: string): boolean {
  return StrKey.isValidEd25519PublicKey(key);
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function truncatePublicKey(key: string, chars = 4): string {
  if (key.length <= chars * 2 + 3) {
    return key;
  }
  return `${key.slice(0, chars)}...${key.slice(-chars)}`;
}
