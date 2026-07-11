import { truncatePublicKey } from '../utils/validation';

describe('truncatePublicKey', () => {
  it('truncates a long key', () => {
    const key = 'GCXXYZ1234567890ABCDEF';
    const result = truncatePublicKey(key, 4);
    expect(result).toBe('GCXX...CDEF');
    expect(result.length).toBeLessThan(key.length);
  });

  it('returns original key if too short', () => {
    const short = 'GCXX';
    expect(truncatePublicKey(short, 4)).toBe('GCXX');
  });

  it('uses custom char count', () => {
    const key = 'GCXXYZ1234567890ABCDEF';
    const result = truncatePublicKey(key, 6);
    expect(result).toBe('GCXXYZ...ABCDEF');
  });
});
