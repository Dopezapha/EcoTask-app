export interface ProofMetadataInput {
  taskId: string;
  photoCid: string;
  lat?: number;
  lng?: number;
  capturedAt?: string;
}

export function buildProofMetadata(
  input: ProofMetadataInput,
): Record<string, unknown> {
  return {
    taskId: input.taskId,
    photoCid: input.photoCid,
    lat: input.lat,
    lng: input.lng,
    capturedAt: input.capturedAt || new Date().toISOString(),
    source: 'ecotask-app',
  };
}

export function proofFileName(taskId: string, extension = 'jpg'): string {
  return `proof-${taskId}-${Date.now()}.${extension}`;
}
