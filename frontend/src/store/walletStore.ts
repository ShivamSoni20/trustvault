import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletStore {
  address: string | null;
  isConnected: boolean;
  balance: number;
  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  setBalance: (balance: number) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      balance: 0,
      setAddress: (address) => set({ address }),
      setConnected: (connected) => set({ isConnected: connected }),
      setBalance: (balance) => set({ balance }),
      disconnect: () => set({ address: null, isConnected: false, balance: 0 }),
    }),
    {
      name: 'trustvault-wallet',
    }
  )
);
