import { formatTokenAmount, formatReward } from '../utils/formatTokens';

describe('formatTokenAmount', () => {
  it('formats small numbers with decimals', () => {
    expect(formatTokenAmount(42)).toBe('42.00');
  });

  it('formats thousands with K suffix', () => {
    expect(formatTokenAmount(1500)).toBe('1.50K');
  });

  it('formats millions with M suffix', () => {
    expect(formatTokenAmount(2500000)).toBe('2.50M');
  });

  it('handles string input', () => {
    expect(formatTokenAmount('99.5')).toBe('99.50');
  });

  it('returns 0 for NaN input', () => {
    expect(formatTokenAmount(NaN)).toBe('0');
    expect(formatTokenAmount('not-a-number')).toBe('0');
  });

  it('respects custom decimals', () => {
    expect(formatTokenAmount(1.23456, 4)).toBe('1.2346');
  });
});

describe('formatReward', () => {
  it('formats with default ECO token', () => {
    expect(formatReward(100)).toBe('100.00 ECO');
  });

  it('formats with custom token', () => {
    expect(formatReward(500, 'XLM')).toBe('500.00 XLM');
  });

  it('formats large amounts', () => {
    expect(formatReward(10000, 'ECO')).toBe('10.00K ECO');
  });
});
