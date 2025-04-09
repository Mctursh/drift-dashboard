import { PublicKey } from '@solana/web3.js';
import { Wallet } from '@hermis/solana-headless-react';

export interface WalletState {
  wallet: Wallet | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  lookupWalletAddress: string | null;
}

export interface WalletActions {
  setWallet: (wallet: Wallet | null) => void;
  setPublicKey: (publicKey: PublicKey | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setDisconnecting: (disconnecting: boolean) => void;
  setLookupWalletAddress: (address: string | null) => void;
  disconnect: () => void;
}

export type WalletStore = WalletState & WalletActions;