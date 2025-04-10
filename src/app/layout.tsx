import './globals.css';
import { Inter } from 'next/font/google';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SolanaProvider } from '@/components/SolanaProvider';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  // Configure the network

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <SolanaProvider>
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}