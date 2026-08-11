import {
  dayKey,
  computeCurrentStreak,
  computeBestStreak,
  nextMilestone,
} from '../utils/streaks';

describe('dayKey', () => {
  it('formats Date objects in local time', () => {
    expect(dayKey(new Date(2026, 7, 11, 15, 30))).toBe('2026-08-11');
  });

  it('formats ISO strings without a timezone suffix as local time', () => {
    expect(dayKey('2026-01-05T08:00:00')).toBe('2026-01-05');
  });
});

describe('computeCurrentStreak', () => {
  const now = new Date(2026, 7, 11, 10);

  it('returns 0 with no activities', () => {
    expect(computeCurrentStreak([], now)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const dates = [
      '2026-08-11T08:00:00',
      '2026-08-10T08:00:00',
      '2026-08-09T08:00:00',
    ];
    expect(computeCurrentStreak(dates, now)).toBe(3);
  });

  it('counts a streak ending yesterday as still active', () => {
    const dates = ['2026-08-10T08:00:00', '2026-08-09T08:00:00'];
    expect(computeCurrentStreak(dates, now)).toBe(2);
  });

  it('returns 0 when the most recent day is not contiguous', () => {
    const dates = [
      '2026-08-09T08:00:00',
      '2026-08-08T08:00:00',
      '2026-08-06T08:00:00',
    ];
    expect(computeCurrentStreak(dates, now)).toBe(0);
  });

  it('ignores multiple completions on the same day', () => {
    const dates = [
      '2026-08-11T08:00:00',
      '2026-08-11T20:00:00',
      '2026-08-10T08:00:00',
    ];
    expect(computeCurrentStreak(dates, now)).toBe(2);
  });
});

describe('computeBestStreak', () => {
  it('returns 0 with no activities', () => {
    expect(computeBestStreak([])).toBe(0);
  });

  it('finds the longest historical run', () => {
    const dates = [
      '2026-08-01T08:00:00',
      '2026-08-02T08:00:00',
      '2026-08-03T08:00:00',
      '2026-08-05T08:00:00',
      '2026-08-06T08:00:00',
      '2026-08-07T08:00:00',
    ];
    expect(computeBestStreak(dates)).toBe(3);
  });

  it('deduplicates dates across timezones/multiple same-day entries', () => {
    const dates = [
      '2026-08-01T08:00:00',
      '2026-08-02T08:00:00',
      '2026-08-02T20:00:00',
    ];
    expect(computeBestStreak(dates)).toBe(2);
  });
});

describe('nextMilestone', () => {
  it('returns the first milestone above the current streak', () => {
    expect(nextMilestone(3)).toEqual({
      target: 7,
      remaining: 4,
      progress: 3 / 7,
    });
  });

  it('returns null when every milestone is passed', () => {
    expect(nextMilestone(150)).toBeNull();
  });

  it('respects custom targets', () => {
    expect(nextMilestone(2, [5, 10])?.target).toBe(5);
  });
});
