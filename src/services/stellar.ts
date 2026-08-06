import {
  Keypair,
  Networks,
  Horizon,
  StrKey,
  TransactionBuilder,
} from '@stellar/stellar-sdk';
import Config from 'react-native-config';

const NETWORK =
  Config.STELLAR_NETWORK === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;
const HORIZON_URL =
  NETWORK === Networks.TESTNET
    ? 'https://horizon-testnet.stellar.org'
    : 'https://horizon.stellar.org';

const server = new Horizon.Server(HORIZON_URL);

export async function getBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(b => b.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : '0';
  } catch {
    return '0';
  }
}

export async function getTokenBalance(
  publicKey: string,
  assetCode: string,
  issuer: string,
): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const tokenBalance = account.balances.find(
      b =>
        'asset_code' in b &&
        b.asset_code === assetCode &&
        b.asset_issuer === issuer,
    );
    return tokenBalance ? tokenBalance.balance : '0';
  } catch {
    return '0';
  }
}

export async function createTestnetAccount(): Promise<{
  publicKey: string;
  secretKey: string;
}> {
  const keypair = Keypair.random();
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${keypair.publicKey()}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fund account via Friendbot');
  }
  return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
}

export function isValidPublicKey(key: string): boolean {
  return StrKey.isValidEd25519PublicKey(key);
}

export function isValidSecretKey(key: string): boolean {
  return StrKey.isValidEd25519SecretSeed(key);
}

export function getPublicKeyFromSecret(secretKey: string): string {
  return Keypair.fromSecret(secretKey).publicKey();
}

export function signChallengeXDR(
  challengeXDR: string,
  secretKey: string,
): string {
  const keypair = Keypair.fromSecret(secretKey);
  const transaction = TransactionBuilder.fromXDR(challengeXDR, NETWORK);
  transaction.sign(keypair);
  return transaction.toXDR();
}

export { Keypair, Networks, Horizon };
