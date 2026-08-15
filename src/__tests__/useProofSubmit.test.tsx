import React from 'react';
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
    const mockSubmitProof = submitProof as jest.MockedFunction<typeof submitProof>;
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
      }
    ]);
    mockSubmitProof.mockResolvedValue({});

    let hookResult: any;
    function TestComponent() {
      hookResult = useProofSubmit();
      return null;
    }
    
    let root: any;
    act(() => {
      root = create(<TestComponent />);
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
