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
  if (!queue.some(p => p.taskId === proof.taskId)) {
    queue.push(proof);
    saveQueue(queue);
  }
  return queue;
}

export function removeProof(id: string): PendingProof[] {
  const queue = loadQueue().filter(p => p.id !== id);
  saveQueue(queue);
  return queue;
}

export function removeProofsForTask(taskId: string): PendingProof[] {
  const queue = loadQueue().filter(p => p.taskId !== taskId);
  saveQueue(queue);
  return queue;
}

export function hasPendingProof(taskId: string): boolean {
  return loadQueue().some(p => p.taskId === taskId);
}

export function clearQueue(): void {
  storage.delete(QUEUE_KEY);
}
