'use client';

import { useMemo, useEffect } from 'react';
// import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  //   BackpackWalletAdapter,
  CoinbaseWalletAdapter,
  //   SolletWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
// import '@solana/wallet-adapter-react-ui/styles.css';
// import { useHermitWalletAdapter } from '@hermis/solana-headless-adapter-react';
import useWalletStore from '@/store/walletStore';
import { SolanaProviderProps } from '@/types/ui';
import { HermisProvider } from '@hermis/solana-headless-react';

export function SolanaProvider({ children, network }: SolanaProviderProps) {
  // Initialize wallet store
  const {
    setWallet,
    setPublicKey,
    setConnected,
    setConnecting,
    setDisconnecting
  } = useWalletStore();

  // You can also customize the wallet adapter options
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      //   new BackpackWalletAdapter(),
      new CoinbaseWalletAdapter(),
      //   new SolletWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  // Set up the hermit wallet adapter for headless operations
  //   const hermitAdapter = useHermitWalletAdapter();

  //   // Subscribe to wallet changes
  //   useEffect(() => {
  //     if (hermitAdapter) {
  //       const walletSubscription = hermitAdapter.wallet.addListener('change', (wallet) => {
  //         setWallet(wallet);
  //         setPublicKey(wallet?.publicKey || null);
  //         setConnected(!!wallet?.connected);
  //       });

  //       return () => {
  //         walletSubscription?.remove();
  //       };
  //     }
  //   }, [hermitAdapter, setWallet, setPublicKey, setConnected]);

  //   <WalletModalProvider>
  //   </WalletModalProvider>
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