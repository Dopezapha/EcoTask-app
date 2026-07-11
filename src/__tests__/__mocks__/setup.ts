jest.mock('react-native-mmkv', () => {
  const store: Record<string, string> = {};
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store[key] ?? null,
      set: (key: string, value: string) => {
        store[key] = value;
      },
      delete: (key: string) => {
        delete store[key];
      },
    })),
  };
});

jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  createJSONStorage: () => ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }),
}));
