import { useState, useCallback } from 'react';
import { submitProof } from '../services/api';
import { PendingProof } from '../types';
import { enqueueProof, loadQueue, saveQueue } from '../services/proofQueue';

export function useProofSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<
    'idle' | 'uploading' | 'verifying' | 'confirmed' | 'failed'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const submitProofAttempt = useCallback(
    async (taskId: string, photoUri: string, lat?: number, lng?: number) => {
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
        );
      } catch {
        remaining.push(proof);
      }
    }
    saveQueue(remaining);
  }, [submitProofAttempt]);

  return { submit, syncPendingProofs, isSubmitting, progress, error };
}
