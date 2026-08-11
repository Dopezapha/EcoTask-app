const MS_PER_DAY = 86400000;

export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isConsecutive(a: string, b: string): boolean {
  const da = new Date(`${a}T12:00:00`);
  const db = new Date(`${b}T12:00:00`);
  return (db.getTime() - da.getTime()) / MS_PER_DAY === 1;
}

export function computeCurrentStreak(
  completedDates: string[],
  now: Date = new Date(),
): number {
  if (completedDates.length === 0) {
    return 0;
  }
  const days = new Set(completedDates.map(dayKey));
  let streak = 0;
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeBestStreak(completedDates: string[]): number {
  const days = [...new Set(completedDates.map(dayKey))].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of days) {
    if (prev === null || isConsecutive(prev, day)) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

export interface StreakMilestone {
  target: number;
  remaining: number;
  progress: number;
}

export function nextMilestone(
  streak: number,
  targets: number[] = [7, 14, 30, 60, 100],
): StreakMilestone | null {
  const next = targets.find(t => t > streak);
  if (next === undefined) {
    return null;
  }
  return {
    target: next,
    remaining: next - streak,
    progress: Math.min(1, streak / next),
  };
}
