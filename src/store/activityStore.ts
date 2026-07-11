import { create } from 'zustand';

export interface Activity {
  id: string;
  taskId: string;
  taskTitle: string;
  taskType: string;
  rewardAmount: number;
  rewardToken: string;
  completedAt: string;
  status: 'confirmed' | 'pending' | 'failed';
}

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>(set => ({
  activities: [],
  addActivity: activity =>
    set(s => ({ activities: [activity, ...s.activities].slice(0, 20) })),
  clearActivities: () => set({ activities: [] }),
}));
