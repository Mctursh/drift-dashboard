'use client';

import { useMemo, useEffect } from 'react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets';
import useWalletStore from '@/store/walletStore';
import { SolanaProviderProps } from '@/types/ui';
import { HermisProvider } from '@hermis/solana-headless-react';

export function SolanaProvider({ children }: SolanaProviderProps) {
  // Initialize wallet store
  const {
    setWallet,
    setPublicKey,
    setConnected,
    setConnecting,
    setDisconnecting
  } = useWalletStore();
  const network = "https://mainnet.helius-rpc.com/?api-key=6b972023-3a7c-4ded-ae5a-a0ccc390ea4c";
  const endpoint = useMemo(() => network, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <HermisProvider
      rpcEndpoint={endpoint}
      autoConnect={true}
      additionalAdapters={wallets}
      onError={(error, adapter) => {
        console.error(error);
        console.log(adapter);
      }}
    >
      {children}
    </HermisProvider>
  );
}