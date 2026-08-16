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
      lat?: number,
      lng?: number,
      opts?: { photoCid?: string; metadataCid?: string },
    ) => {
      const formData = new FormData();
      formData.append('taskId', taskId);
      if (lat !== undefined && lng !== undefined) {
        formData.append('lat', String(lat));
        formData.append('lng', String(lng));
      }
      formData.append('photos', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'proof.jpg',
      } as any);

      // If queued proof already has cids, reuse them and skip pinning
      if (opts?.photoCid && opts?.metadataCid) {
        formData.append('ipfsPhotoCid', opts.photoCid);
        formData.append('ipfsMetadataCid', opts.metadataCid);
      } else {
        try {
          const photoResult = await pinFile(photoUri, proofFileName(taskId));
          formData.append('ipfsPhotoCid', photoResult.cid);
          const metadataResult = await pinJSON(
            buildProofMetadata({
              taskId,
              photoCid: photoResult.cid,
              lat,
              lng,
            }),
            proofFileName(taskId, 'json'),
          );
          formData.append('ipfsMetadataCid', metadataResult.cid);
        } catch {}
      }

      return await submitProof(formData);
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
        const result = await submitProofAttempt(taskId, photoUri, lat, lng);
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
    if (pending.length === 0) {
      return;
    }

    const remaining: PendingProof[] = [];
    for (const proof of pending) {
      try {
        await submitProofAttempt(
          proof.taskId,
          proof.photoPath,
          proof.lat,
          proof.lng,
          { photoCid: (proof as any).photoCid, metadataCid: (proof as any).metadataCid },
        );
      } catch {
        remaining.push(proof);
      }
    }
    saveQueue(remaining);
    setPendingCount(remaining.length);
  }, [submitProofAttempt]);

  return {
    submit,
    syncPendingProofs,
    pendingCount,
    isSubmitting,
    progress,
    error,
  };
}
