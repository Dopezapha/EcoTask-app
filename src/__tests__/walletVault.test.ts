import './__mocks__/setup';
import {
  saveInAppSecret,
  getInAppSecret,
  hasInAppSecret,
  clearInAppSecret,
} from '../services/walletVault';

describe('walletVault', () => {
  beforeEach(() => {
    clearInAppSecret('GCKEY');
  });

  it('starts with no secret for an unknown key', () => {
    expect(getInAppSecret('GCKEY')).toBeNull();
    expect(hasInAppSecret('GCKEY')).toBe(false);
  });

  it('saves and retrieves a secret per public key', () => {
    saveInAppSecret('GCKEY', 'Ssecret123');
    expect(getInAppSecret('GCKEY')).toBe('Ssecret123');
    expect(hasInAppSecret('GCKEY')).toBe(true);
  });

  it('isolates secrets between public keys', () => {
    saveInAppSecret('GCKEY', 'Ssecret123');
    saveInAppSecret('GCOTHER', 'Sother456');
    expect(getInAppSecret('GCKEY')).toBe('Ssecret123');
    expect(getInAppSecret('GCOTHER')).toBe('Sother456');
  });

  it('clears a secret', () => {
    saveInAppSecret('GCKEY', 'Ssecret123');
    clearInAppSecret('GCKEY');
    expect(hasInAppSecret('GCKEY')).toBe(false);
    expect(getInAppSecret('GCKEY')).toBeNull();
  });
});
