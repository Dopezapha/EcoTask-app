const __MMKV_STORE__: Record<string, string> = {};

jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => __MMKV_STORE__[key] ?? null,
      set: (key: string, value: string) => {
        __MMKV_STORE__[key] = value;
      },
      delete: (key: string) => {
        delete __MMKV_STORE__[key];
      },
    })),
  };
});

jest.mock('zustand/middleware', () => {
  // simple in-memory JSON storage adapter for tests
  return {
    persist: (config: any, options: any) => {
      // options may include name and storage
      const storage = options?.storage;
      const name = options?.name || 'zustand-test';

      // create a wrapped config that uses the provided set/get
      return (set: any, get: any, api: any) => {
        const getItem = async (k: string) => {
          try {
            const raw = storage.getItem(name);
            return raw;
          } catch {
            return null;
          }
        };

        const setItem = async (k: string, value: string) => {
          try {
            storage.setItem(name, value);
          } catch {}
        };

        const removeItem = async (k: string) => {
          try {
            storage.removeItem(name);
          } catch {}
        };

        // if storage has existing data, try to hydrate by calling set with parsed JSON
        const existing = storage.getItem(name);
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            // apply initial state by calling set
            set(() => parsed);
          } catch {}
        }

        return config(set, get, api);
      };
    },
    createJSONStorage: () => ({
      getItem: (name: string) => __MMKV_STORE__[name] ?? null,
      setItem: (name: string, value: string) => {
        __MMKV_STORE__[name] = value;
      },
      removeItem: (name: string) => {
        delete __MMKV_STORE__[name];
      },
    }),
  };
});
