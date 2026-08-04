import { create } from 'zustand';
import { Activity } from '../types';

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
