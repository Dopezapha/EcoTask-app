import { Activity, TaskType, TASK_TYPE_CONFIG } from '../types';

export interface EarningsBreakdown {
  total: number;
  confirmed: number;
  pending: number;
}

export function sumRewards(activities: Activity[]): EarningsBreakdown {
  let confirmed = 0;
  let pending = 0;
  for (const activity of activities) {
    if (activity.status === 'confirmed') {
      confirmed += activity.rewardAmount;
    } else if (activity.status === 'pending') {
      pending += activity.rewardAmount;
    }
  }
  return { total: confirmed + pending, confirmed, pending };
}

export interface TaskTypeEarnings {
  type: TaskType;
  label: string;
  icon: string;
  count: number;
  total: number;
  share: number;
}

export function groupByTaskType(activities: Activity[]): TaskTypeEarnings[] {
  const { confirmed: confirmedTotal } = sumRewards(activities);
  const byType = new Map<TaskType, { count: number; total: number }>();

  for (const activity of activities) {
    if (activity.status !== 'confirmed') {
      continue;
    }
    const entry = byType.get(activity.taskType) || { count: 0, total: 0 };
    entry.count += 1;
    entry.total += activity.rewardAmount;
    byType.set(activity.taskType, entry);
  }

  return [...byType.entries()]
    .map(([type, value]) => ({
      type,
      label: TASK_TYPE_CONFIG[type]?.label ?? type,
      icon: TASK_TYPE_CONFIG[type]?.icon ?? '📍',
      count: value.count,
      total: value.total,
      share: confirmedTotal > 0 ? value.total / confirmedTotal : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export interface WeeklyEarnings {
  label: string;
  earned: number;
}

function formatWeekLabel(start: Date): string {
  const startLabel = start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endLabel = end.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `${startLabel}–${endLabel}`;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const daysSinceMonday = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysSinceMonday);
  return d;
}

export function computeWeeklySeries(
  activities: Activity[],
  weeks = 4,
  now: Date = new Date(),
): WeeklyEarnings[] {
  const monday = startOfWeek(now);
  const series: WeeklyEarnings[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const start = new Date(monday);
    start.setDate(start.getDate() - w * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    let earned = 0;
    for (const activity of activities) {
      if (activity.status !== 'confirmed') {
        continue;
      }
      const time = new Date(activity.completedAt).getTime();
      if (time >= start.getTime() && time < end.getTime()) {
        earned += activity.rewardAmount;
      }
    }
    series.push({ label: formatWeekLabel(start), earned });
  }
  return series;
}
