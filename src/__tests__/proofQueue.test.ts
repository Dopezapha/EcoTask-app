import './__mocks__/setup';
import {
  loadQueue,
  saveQueue,
  enqueueProof,
  clearQueue,
} from '../services/proofQueue';
import { PendingProof } from '../types';

describe('proofQueue', () => {
  const baseProof: PendingProof = {
    id: '1',
    taskId: 't1',
    photoPath: 'file:///tmp/proof.jpg',
    lat: 51.5,
    lng: -0.1,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    clearQueue();
  });

  it('loads an empty queue', () => {
    expect(loadQueue()).toEqual([]);
  });

  it('enqueues and persists a proof', () => {
    enqueueProof(baseProof);
    const queue = loadQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ id: '1', taskId: 't1' });
  });

  it('enqueues multiple proofs', () => {
    enqueueProof(baseProof);
    enqueueProof({ ...baseProof, id: '2' });
    expect(loadQueue()).toHaveLength(2);
  });

  it('clears the queue', () => {
    enqueueProof(baseProof);
    clearQueue();
    expect(loadQueue()).toEqual([]);
  });

  it('round-trips the full queue via saveQueue', () => {
    saveQueue([
      baseProof,
      { ...baseProof, id: '2', photoPath: 'file:///x.jpg' },
    ]);
    const queue = loadQueue();
    expect(queue).toHaveLength(2);
    expect(queue[1].id).toBe('2');
  });

  it('returns an empty array when storage is corrupted', () => {
    const { MMKV } = require('react-native-mmkv');
    const instance = new MMKV();
    instance.set('pending_proofs', 'not-json{');
    expect(loadQueue()).toEqual([]);
  });
});
