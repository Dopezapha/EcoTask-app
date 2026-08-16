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
      capturedAt: string,
      lat?: number,
      lng?: number,
      existingPhotoCid?: string,
      existingMetadataCid?: string,
    ) => {
      const formData = new FormData();
      formData.append('taskId', taskId);
      if (lat !== undefined && lng !== undefined) {
        formData.append('lat', String(lat));
        formData.append('lng', String(lng));
      }
      // React Native FormData accepts a file-like object; TypeScript DOM types do not
      formData.append('photos', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'proof.jpg',
      } as any);

      let photoCid = existingPhotoCid;
      let metadataCid = existingMetadataCid;

      try {
        if (!photoCid) {
          const photoResult = await pinFile(
            photoUri,
            proofFileName(taskId, capturedAt),
          );
          photoCid = photoResult.cid;
        }
        if (photoCid) {
          formData.append('ipfsPhotoCid', photoCid);
        }

        if (!metadataCid && photoCid) {
          const metadataResult = await pinJSON(
            buildProofMetadata({
              taskId,
              photoCid,
              lat,
              lng,
              capturedAt,
            }),
            proofFileName(taskId, capturedAt, 'json'),
          );
          metadataCid = metadataResult.cid;
        }
        if (metadataCid) {
          formData.append('ipfsMetadataCid', metadataCid);
        }
      } catch {}

      try {
        return await submitProof(formData);
      } catch (err: any) {
        err.photoCid = photoCid;
        err.metadataCid = metadataCid;
        throw err;
      }
    },
    [],
  );

  const submit = useCallback(
    async (
      taskId: string,
      photoUri: string,
      capturedAt: string,
      lat?: number,
      lng?: number,
    ) => {
      setIsSubmitting(true);
      setProgress('uploading');
      setError(null);

      try {
        setProgress('verifying');
        const result = await submitProofAttempt(
          taskId,
          photoUri,
          capturedAt,
          lat,
          lng,
        );
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
          capturedAt,
          photoCid: err.photoCid,
          metadataCid: err.metadataCid,
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
          proof.capturedAt,
          proof.lat,
          proof.lng,
          proof.photoCid,
          proof.metadataCid,
        );
      } catch (err: any) {
        remaining.push({
          ...proof,
          photoCid: err.photoCid || proof.photoCid,
          metadataCid: err.metadataCid || proof.metadataCid,
        });
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
