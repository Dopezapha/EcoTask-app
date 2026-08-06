import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'wallet-vault' });

function secretKey(publicKey: string): string {
  return `secret:${publicKey}`;
}

export function saveInAppSecret(
  publicKey: string,
  secretKeyValue: string,
): void {
  storage.set(secretKey(publicKey), secretKeyValue);
}

export function getInAppSecret(publicKey: string): string | null {
  return storage.getString(secretKey(publicKey)) ?? null;
}

export function hasInAppSecret(publicKey: string): boolean {
  return getInAppSecret(publicKey) !== null;
}

export function clearInAppSecret(publicKey: string): void {
  storage.delete(secretKey(publicKey));
}
