import {
  getAchievements,
  getEarnedCount,
  getNextAchievement,
  ACHIEVEMENT_DEFINITIONS,
} from '../utils/achievements';
import { UserStats } from '../types';

const zeroStats: UserStats = {
  treesPlanted: 0,
  plasticCollected: 0,
  co2Reduced: 0,
};

describe('getAchievements', () => {
  it('returns every definition with default values', () => {
    const achievements = getAchievements(zeroStats);
    expect(achievements).toHaveLength(ACHIEVEMENT_DEFINITIONS.length);
    expect(achievements.every(a => !a.earned)).toBe(true);
    expect(achievements[0]).toMatchObject({
      id: 'first-seedling',
      progress: 0,
      currentValue: 0,
    });
  });

  it('marks achievements as earned when thresholds are met', () => {
    const stats: UserStats = {
      treesPlanted: 12,
      plasticCollected: 60,
      co2Reduced: 999,
    };
    const achievements = getAchievements(stats);
    const earned = achievements.filter(a => a.earned);
    const ids = earned.map(a => a.id).sort();
    expect(ids).toEqual(
      [
        'first-seedling',
        'grove-keeper',
        'trash-buster',
        'cleanup-crew',
        'climate-helper',
        'carbon-crusher',
      ].sort(),
    );
  });

  it('caps progress at 1 for earned achievements', () => {
    const achievements = getAchievements({
      treesPlanted: 500,
      plasticCollected: 0,
      co2Reduced: 0,
    });
    const canopy = achievements.find(a => a.id === 'canopy-champion');
    expect(canopy?.earned).toBe(true);
    expect(canopy?.progress).toBe(1);
  });

  it('reports partial progress toward the next tier', () => {
    const achievements = getAchievements({
      treesPlanted: 5,
      plasticCollected: 0,
      co2Reduced: 0,
    });
    const grove = achievements.find(a => a.id === 'grove-keeper');
    expect(grove?.earned).toBe(false);
    expect(grove?.progress).toBe(0.5);
    expect(grove?.currentValue).toBe(5);
  });
});

describe('getEarnedCount', () => {
  it('counts earned badges', () => {
    expect(getEarnedCount(zeroStats)).toBe(0);
    expect(
      getEarnedCount({
        treesPlanted: 100,
        plasticCollected: 10,
        co2Reduced: 50,
      }),
    ).toBe(6);
  });
});

describe('getNextAchievement', () => {
  it('returns the easiest unearned achievement', () => {
    const next = getNextAchievement(zeroStats);
    expect(next?.id).toBe('first-seedling');
  });

  it('returns the next milestone once easier ones are earned', () => {
    const next = getNextAchievement({
      treesPlanted: 12,
      plasticCollected: 0,
      co2Reduced: 0,
    });
    expect(next?.id).toBe('trash-buster');
  });

  it('returns null when everything is earned', () => {
    const next = getNextAchievement({
      treesPlanted: 1000,
      plasticCollected: 1000,
      co2Reduced: 1000,
    });
    expect(next).toBeNull();
  });
});
