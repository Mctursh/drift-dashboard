import { create } from 'zustand';
import { WalletState, WalletStore } from '@/types/wallet';
import { PublicKey } from '@hermis/solana-headless-core';
import { Wallet } from '@hermis/solana-headless-react';

const initialState: WalletState = {
  wallet: null,
  publicKey: null,
  connected: false,
  connecting: false,
  disconnecting: false,
  lookupWalletAddress: null
};

const useWalletStore = create<WalletStore>((set) => ({
  ...initialState,
  
  // Actions
  setWallet: (wallet: Wallet | null) => set({ wallet }),
  setPublicKey: (publicKey: PublicKey | null) => set({ publicKey }),
  setConnected: (connected: boolean) => set({ connected }),
  setConnecting: (connecting: boolean) => set({ connecting }),
  setDisconnecting: (disconnecting: boolean) => set({ disconnecting }),
  setLookupWalletAddress: (address: string | null) => set({ lookupWalletAddress: address }),
  
  // Reset wallet state
  disconnect: () => set({
    wallet: null,
    publicKey: null,
    connected: false,
  }),
}));

export default useWalletStore;