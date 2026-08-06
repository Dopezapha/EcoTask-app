import { buildProofMetadata, proofFileName } from '../utils/proofMetadata';

describe('buildProofMetadata', () => {
  it('includes all provided fields', () => {
    const metadata = buildProofMetadata({
      taskId: 't1',
      photoCid: 'QmAbC123',
      lat: 51.5,
      lng: -0.1,
    });
    expect(metadata.taskId).toBe('t1');
    expect(metadata.photoCid).toBe('QmAbC123');
    expect(metadata.lat).toBe(51.5);
    expect(metadata.lng).toBe(-0.1);
    expect(metadata.source).toBe('ecotask-app');
  });

  it('defaults capturedAt to now and omits missing coordinates', () => {
    const metadata = buildProofMetadata({ taskId: 't2', photoCid: 'QmXyz' });
    expect(typeof metadata.capturedAt).toBe('string');
    expect(metadata.lat).toBeUndefined();
    expect(metadata.lng).toBeUndefined();
  });

  it('uses a provided capturedAt', () => {
    const metadata = buildProofMetadata({
      taskId: 't1',
      photoCid: 'QmAbC123',
      capturedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(metadata.capturedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('proofFileName', () => {
  it('includes the task id and extension', () => {
    const name = proofFileName('task-42');
    expect(name).toMatch(/^proof-task-42-\d+\.jpg$/);
  });

  it('uses a custom extension', () => {
    const name = proofFileName('task-42', 'json');
    expect(name).toMatch(/\.json$/);
  });
});
