import { useState, useCallback } from 'react';
import { submitProof } from '../services/api';
import { pinFile, pinJSON } from '../services/ipfs';
import { PendingProof } from '../types';
import { buildProofMetadata, proofFileName } from '../utils/proofMetadata';
import {
  enqueueProof,
  loadQueue,
  saveQueue,
  removeProofsForTask,
} from '../services/proofQueue';

export function useProofSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<
    'idle' | 'uploading' | 'verifying' | 'confirmed' | 'failed'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(() => loadQueue().length);

  const submitProofAttempt = useCallback(
    async (
      taskId: string,
      photoUri: string,
      opts?: { lat?: number; lng?: number; photoCid?: string; metadataCid?: string },
    ) => {
      const formData = new FormData();
      formData.append('taskId', taskId);
      if (opts?.lat !== undefined) formData.append('lat', String(opts.lat));
      if (opts?.lng !== undefined) formData.append('lng', String(opts.lng));

      formData.append(
        'photos',
        ({ uri: photoUri, type: 'image/jpeg', name: 'proof.jpg' } as any),
      );

      // reuse provided CIDs when available
      let photoCid = opts?.photoCid;
      let metadataCid = opts?.metadataCid;

      if (!photoCid || !metadataCid) {
        try {
          if (!photoCid) {
            const photoRes = await pinFile(photoUri, proofFileName(taskId));
            photoCid = photoRes.cid;
          }
          if (photoCid && !metadataCid) {
            const metadataRes = await pinJSON(
              buildProofMetadata({ taskId, photoCid, lat: opts?.lat, lng: opts?.lng }),
              proofFileName(taskId, 'json'),
            );
            metadataCid = metadataRes.cid;
          }
        } catch {
          // best-effort pinning; proceed to submit without cids if necessary
        }
      }

      if (photoCid) formData.append('ipfsPhotoCid', photoCid);
      if (metadataCid) formData.append('ipfsMetadataCid', metadataCid);

      try {
        return await submitProof(formData);
      } catch (err: any) {
        // attach the generated cids so callers can persist them
        err.photoCid = photoCid;
        err.metadataCid = metadataCid;
        throw err;
      }
    },
    [],
  );

  const submit = useCallback(
    async (taskId: string, photoUri: string, lat?: number, lng?: number) => {
      setIsSubmitting(true);
      setProgress('uploading');
      setError(null);

      try {
        setProgress('verifying');
        const result = await submitProofAttempt(taskId, photoUri, { lat, lng });
        removeProofsForTask(taskId);
        setPendingCount(loadQueue().length);
        setProgress('confirmed');
        return result;
      } catch (err: any) {
        enqueueProof({
          id: `${Date.now()}`,
          taskId,
          photoPath: photoUri,
          lat,
          lng,
          createdAt: new Date().toISOString(),
          photoCid: err?.photoCid,
          metadataCid: err?.metadataCid,
        });
        setPendingCount(loadQueue().length);
        setError(err.message || 'Upload failed, saved for later');
        setProgress('failed');
        return undefined;
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitProofAttempt],
  );

  const syncPendingProofs = useCallback(async () => {
    const pending = loadQueue();
    if (pending.length === 0) return;

    const remaining: PendingProof[] = [];
    for (const proof of pending) {
      try {
        await submitProofAttempt(proof.taskId, proof.photoPath, {
          lat: (proof as any).lat,
          lng: (proof as any).lng,
          photoCid: (proof as any).photoCid,
          metadataCid: (proof as any).metadataCid,
        });
      } catch (err: any) {
        remaining.push({
          ...proof,
          photoCid: err?.photoCid || (proof as any).photoCid,
          metadataCid: err?.metadataCid || (proof as any).metadataCid,
        } as PendingProof);
      }
    }
    saveQueue(remaining);
    setPendingCount(remaining.length);
  }, [submitProofAttempt]);

  return { submit, syncPendingProofs, pendingCount, isSubmitting, progress, error };
}
