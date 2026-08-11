export type TaskSortMode = 'distance' | 'reward' | 'difficulty';

const DIFFICULTY_WEIGHT: Record<string, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export function filterTasksByQuery<
  T extends { title: string; description?: string },
>(tasks: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return tasks;
  }
  return tasks.filter(
    t =>
      t.title.toLowerCase().includes(q) ||
      (t.description?.toLowerCase().includes(q) ?? false),
  );
}

export function sortTasks<
  T extends {
    rewardAmount: number;
    distance?: number;
    difficulty?: string;
  },
>(tasks: T[], mode: TaskSortMode): T[] {
  const copy = [...tasks];
  switch (mode) {
    case 'reward':
      return copy.sort((a, b) => b.rewardAmount - a.rewardAmount);
    case 'difficulty':
      return copy.sort(
        (a, b) =>
          (DIFFICULTY_WEIGHT[a.difficulty ?? 'hard'] ?? 2) -
          (DIFFICULTY_WEIGHT[b.difficulty ?? 'hard'] ?? 2),
      );
    case 'distance':
    default:
      return copy.sort(
        (a, b) =>
          (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE),
      );
  }
}
