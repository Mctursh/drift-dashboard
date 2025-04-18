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
  
  setWallet: (wallet: Wallet | null) => set({ wallet, publicKey: wallet?.adapter.publicKey }),
  setPublicKey: (publicKey: PublicKey | null) => {
    console.log("Setting public key in store:", publicKey?.toBase58());
    set({ publicKey });
  },
  setConnected: (connected: boolean) => set({ connected }),
  setConnecting: (connecting: boolean) => set({ connecting }),
  setDisconnecting: (disconnecting: boolean) => set({ disconnecting }),
  setLookupWalletAddress: (address: string | null) => set({ lookupWalletAddress: address }),
  
  disconnect: () => set({
    wallet: null,
    publicKey: null,
    connected: false,
  }),
}));

export default useWalletStore;