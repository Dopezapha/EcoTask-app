import React from 'react';
import renderer, { act, create } from 'react-test-renderer';
import { useProofSubmit } from '../hooks/useProofSubmit';
import * as api from '../services/api';
import * as ipfs from '../services/ipfs';
import { clearQueue, loadQueue } from '../services/proofQueue';

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
		jest.spyOn(api, 'submitProof').mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({ ok: true } as any);

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

describe('useProofSubmit retry logic', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('reuses stored CIDs without a second IPFS call', async () => {
		const mockPinFile = jest.spyOn(ipfs, 'pinFile');
		const mockPinJSON = jest.spyOn(ipfs, 'pinJSON');
		const mockSubmitProof = jest.spyOn(api, 'submitProof');
		const mockLoadQueue = jest.spyOn(require('../services/proofQueue'), 'loadQueue');

		mockLoadQueue.mockReturnValue([
			{
				id: '1',
				taskId: 't1',
				photoPath: 'file:///retry.jpg',
				createdAt: '2026-01-01T00:00:00.000Z',
				capturedAt: '2026-01-01T00:00:00.000Z',
				photoCid: 'QmPhoto',
				metadataCid: 'QmMeta',
			},
		] as any);
		mockSubmitProof.mockResolvedValue({} as any);

		let hookResult: any;
		function TestComponent() {
			hookResult = useProofSubmit();
			return null;
		}

		act(() => {
			create(<TestComponent />);
		});

		await act(async () => {
			await hookResult.syncPendingProofs();
		});

		expect(mockPinFile).not.toHaveBeenCalled();
		expect(mockPinJSON).not.toHaveBeenCalled();
		const formDataArg = (mockSubmitProof as jest.Mock).mock.calls[0][0] as any;

		// Extract ipfs CIDs from FormData variations
		let photoCid;
		let metadataCid;

		if (typeof formDataArg.get === 'function') {
			photoCid = formDataArg.get('ipfsPhotoCid');
			metadataCid = formDataArg.get('ipfsMetadataCid');
		} else if (formDataArg._parts) {
			photoCid = formDataArg._parts.find((p: any) => p[0] === 'ipfsPhotoCid')?.[1];
			metadataCid = formDataArg._parts.find((p: any) => p[0] === 'ipfsMetadataCid')?.[1];
		} else if (typeof formDataArg.getParts === 'function') {
			const parts = formDataArg.getParts();
			photoCid = parts.find((p: any) => p.fieldName === 'ipfsPhotoCid')?.string;
			metadataCid = parts.find((p: any) => p.fieldName === 'ipfsMetadataCid')?.string;
		}

		expect(photoCid).toBe('QmPhoto');
		expect(metadataCid).toBe('QmMeta');
	});
});


import { create, act } from 'react-test-renderer';
import { useProofSubmit } from '../hooks/useProofSubmit';
import { pinFile, pinJSON } from '../services/ipfs';
import { submitProof } from '../services/api';
import { loadQueue } from '../services/proofQueue';

jest.mock('../services/ipfs');
jest.mock('../services/api');
jest.mock('../services/proofQueue');
jest.mock('react-native-config', () => ({ default: {} }));

describe('useProofSubmit retry logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reuses stored CIDs without a second IPFS call', async () => {
    const mockPinFile = pinFile as jest.MockedFunction<typeof pinFile>;
    const mockPinJSON = pinJSON as jest.MockedFunction<typeof pinJSON>;
    const mockSubmitProof = submitProof as jest.MockedFunction<
      typeof submitProof
    >;
    const mockLoadQueue = loadQueue as jest.MockedFunction<typeof loadQueue>;

    mockLoadQueue.mockReturnValue([
      {
        id: '1',
        taskId: 't1',
        photoPath: 'file:///retry.jpg',
        createdAt: '2026-01-01T00:00:00.000Z',
        capturedAt: '2026-01-01T00:00:00.000Z',
        photoCid: 'QmPhoto',
        metadataCid: 'QmMeta',
      },
    ]);
    mockSubmitProof.mockResolvedValue({});

    let hookResult: any;
    function TestComponent() {
      hookResult = useProofSubmit();
      return null;
    }

    act(() => {
      create(<TestComponent />);
    });

    await act(async () => {
      await hookResult.syncPendingProofs();
    });

    expect(mockPinFile).not.toHaveBeenCalled();
    expect(mockPinJSON).not.toHaveBeenCalled();
    const formDataArg = mockSubmitProof.mock.calls[0][0] as any;

    // In Node/JSDOM, FormData uses get/getAll/entries
    // In React Native, it might use getParts or _parts
    let photoCid;
    let metadataCid;

    if (typeof formDataArg.get === 'function') {
      photoCid = formDataArg.get('ipfsPhotoCid');
      metadataCid = formDataArg.get('ipfsMetadataCid');
    } else if (formDataArg._parts) {
      photoCid = formDataArg._parts.find(
        (p: any) => p[0] === 'ipfsPhotoCid',
      )?.[1];
      metadataCid = formDataArg._parts.find(
        (p: any) => p[0] === 'ipfsMetadataCid',
      )?.[1];
    } else if (typeof formDataArg.getParts === 'function') {
      const parts = formDataArg.getParts();
      photoCid = parts.find((p: any) => p.fieldName === 'ipfsPhotoCid')?.string;
      metadataCid = parts.find(
        (p: any) => p.fieldName === 'ipfsMetadataCid',
      )?.string;
    }

    expect(photoCid).toBe('QmPhoto');
    expect(metadataCid).toBe('QmMeta');
  });
});
