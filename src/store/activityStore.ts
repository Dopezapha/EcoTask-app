import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { Activity } from '../types';

const storage = new MMKV({ id: 'activity-storage' });
const zustandMMKVStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    set => ({
      activities: [],
      addActivity: activity =>
        set(s => ({ activities: [activity, ...s.activities].slice(0, 20) })),
      clearActivities: () => set({ activities: [] }),
    }),
    {
      name: 'activity-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
