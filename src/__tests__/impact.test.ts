import { computeImpact, applyImpact } from '../utils/impact';
import { UserStats } from '../types';

describe('computeImpact', () => {
  it('returns tree and CO2 credit for planting', () => {
    expect(computeImpact('TREE_PLANTING')).toEqual({
      treesPlanted: 1,
      co2Reduced: 2,
    });
  });

  it('returns plastic credit for collection tasks', () => {
    expect(computeImpact('TRASH_COLLECTION').plasticCollected).toBe(2);
    expect(computeImpact('OCEAN_CLEANUP').plasticCollected).toBe(3);
  });

  it('returns CO2 credit for all task types', () => {
    for (const type of [
      'TREE_PLANTING',
      'TRASH_COLLECTION',
      'OCEAN_CLEANUP',
      'GARDENING',
      'EDUCATION',
      'OTHER',
    ] as const) {
      expect(computeImpact(type).co2Reduced).toBeGreaterThan(0);
    }
  });

  it('returns a copy so callers cannot mutate the config', () => {
    const impact = computeImpact('TREE_PLANTING');
    impact.treesPlanted = 99;
    expect(computeImpact('TREE_PLANTING').treesPlanted).toBe(1);
  });
});

describe('applyImpact', () => {
  const stats: UserStats = {
    treesPlanted: 3,
    plasticCollected: 5,
    co2Reduced: 10,
  };

  it('adds impact to existing stats', () => {
    const result = applyImpact(stats, 'TRASH_COLLECTION');
    expect(result).toEqual({
      treesPlanted: 3,
      plasticCollected: 7,
      co2Reduced: 11,
    });
  });

  it('does not mutate the input stats', () => {
    applyImpact(stats, 'OCEAN_CLEANUP');
    expect(stats.plasticCollected).toBe(5);
  });
});
