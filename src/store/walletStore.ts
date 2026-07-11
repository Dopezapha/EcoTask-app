import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const zustandMMKVStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  balance: string | null;
  ecoBalance: string | null;
  connect: (publicKey: string) => void;
  disconnect: () => void;
  setBalance: (balance: string) => void;
  setEcoBalance: (ecoBalance: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    set => ({
      isConnected: false,
      publicKey: null,
      balance: null,
      ecoBalance: null,
      connect: publicKey => set({ isConnected: true, publicKey }),
      disconnect: () =>
        set({
          isConnected: false,
          publicKey: null,
          balance: null,
          ecoBalance: null,
        }),
      setBalance: balance => set({ balance }),
      setEcoBalance: ecoBalance => set({ ecoBalance }),
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
