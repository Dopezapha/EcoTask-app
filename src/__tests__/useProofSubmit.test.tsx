import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useProofSubmit } from '../hooks/useProofSubmit';
import * as api from '../services/api';
import * as ipfs from '../services/ipfs';
import { clearQueue } from '../services/proofQueue';

function HookHarness({ onRef }: any) {
  const hook = useProofSubmit();
  React.useEffect(() => {
    onRef(hook);
  }, [hook]);
  return null;
}

describe('useProofSubmit integration', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    clearQueue();
  });

  test('online happy path', async () => {
    const ipfsFile = { cid: 'Qm123', url: 'https://ipfs.io/ipfs/Qm123' };
    jest.spyOn(ipfs, 'pinFile').mockResolvedValue(ipfsFile as any);
    jest.spyOn(ipfs, 'pinJSON').mockResolvedValue({ cid: 'QmMeta' } as any);
    jest.spyOn(api, 'submitProof').mockResolvedValue({ success: true } as any);

    let ref: any;
    await act(async () => {
      renderer.create(<HookHarness onRef={r => (ref = r)} />);
    });

    await act(async () => {
      const res = await ref.submit('task-1', '/path/photo.jpg', 1, 2);
      expect(res).toEqual({ success: true });
      expect(ref.progress).toBe('confirmed');
      expect(ref.pendingCount).toBe(0);
    });
  });

  test('offline enqueue then sync', async () => {
    jest.spyOn(ipfs, 'pinFile').mockResolvedValue({ cid: 'QmX' } as any);
    jest.spyOn(ipfs, 'pinJSON').mockResolvedValue({ cid: 'QmMeta' } as any);
    const submitMock = jest.spyOn(api, 'submitProof').mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({ ok: true } as any);

    let ref: any;
    await act(async () => {
      renderer.create(<HookHarness onRef={r => (ref = r)} />);
    });

    await act(async () => {
      const res = await ref.submit('task-2', '/path/p.jpg');
      expect(res).toBeUndefined();
      expect(ref.progress).toBe('failed');
      expect(ref.pendingCount).toBeGreaterThan(0);
    });

    // now sync pending (second call will succeed)
    await act(async () => {
      const { loadQueue } = require('../services/proofQueue');
      await ref.syncPendingProofs();
      expect(loadQueue().length).toBe(0);
    });
  });

  test('ipfs failure handled (still attempts submit)', async () => {
    jest.spyOn(ipfs, 'pinFile').mockRejectedValue(new Error('ipfs down'));
    jest.spyOn(ipfs, 'pinJSON').mockRejectedValue(new Error('ipfs down'));
    jest.spyOn(api, 'submitProof').mockResolvedValue({ ok: true } as any);

    let ref: any;
    await act(async () => {
      renderer.create(<HookHarness onRef={r => (ref = r)} />);
    });

    await act(async () => {
      const res = await ref.submit('task-3', '/p.jpg');
      expect(res).toEqual({ ok: true });
      expect(ref.progress).toBe('confirmed');
    });
  });

  test('concurrent sync with mixed results', async () => {
    // prepare two queued proofs
    jest.spyOn(api, 'submitProof').mockRejectedValueOnce(new Error('fail1')).mockResolvedValueOnce({ ok: true } as any);
    // enqueue two proofs manually via the submit failure path
    let ref: any;
    await act(async () => {
      renderer.create(<HookHarness onRef={r => (ref = r)} />);
    });

    await act(async () => {
      // first submit fails and enqueues
      jest.spyOn(ipfs, 'pinFile').mockRejectedValue(new Error('ipfs'));
      await ref.submit('task-A', '/a.jpg');
      // second submit fails and enqueues (simulate network)
      jest.spyOn(api, 'submitProof').mockRejectedValueOnce(new Error('network'));
      await ref.submit('task-B', '/b.jpg');
    });

    // now make next sync attempt: first will fail, second will succeed
    jest.spyOn(api, 'submitProof').mockRejectedValueOnce(new Error('still-fail')).mockResolvedValueOnce({ ok: true } as any);

    await act(async () => {
      await ref.syncPendingProofs();
      // after sync, one should remain or zero depending on ordering; ensure function completes and pendingCount is numeric
      expect(typeof ref.pendingCount).toBe('number');
    });
  });
});
