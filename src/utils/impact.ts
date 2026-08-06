import { TaskType, UserStats, ImpactContribution } from '../types';
import { IMPACT_BY_TASK_TYPE } from '../types';

export function computeImpact(taskType: TaskType): ImpactContribution {
  return { ...IMPACT_BY_TASK_TYPE[taskType] };
}

export function applyImpact(stats: UserStats, taskType: TaskType): UserStats {
  const impact = computeImpact(taskType);
  return {
    treesPlanted: stats.treesPlanted + (impact.treesPlanted || 0),
    plasticCollected: stats.plasticCollected + (impact.plasticCollected || 0),
    co2Reduced: stats.co2Reduced + (impact.co2Reduced || 0),
  };
}
