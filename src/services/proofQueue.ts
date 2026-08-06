import { MMKV } from 'react-native-mmkv';
import { PendingProof } from '../types';

const storage = new MMKV({ id: 'proof-queue' });
const QUEUE_KEY = 'pending_proofs';

export function loadQueue(): PendingProof[] {
  try {
    const raw = storage.getString(QUEUE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQueue(proofs: PendingProof[]): void {
  storage.set(QUEUE_KEY, JSON.stringify(proofs));
}

export function enqueueProof(proof: PendingProof): PendingProof[] {
  const queue = loadQueue();
  queue.push(proof);
  saveQueue(queue);
  return queue;
}

export function clearQueue(): void {
  storage.delete(QUEUE_KEY);
}
