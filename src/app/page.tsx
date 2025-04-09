// 'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import useWalletStore from '@/store/walletStore';
import { useWallet } from '@hermis/solana-headless-react';

export default function Home() {
  // const { publicKey, connected } = useWallet();
  // const { setPublicKey, setConnected } = useWalletStore();
  
  // // Sync wallet state with our store
  // useEffect(() => {
  //   if (publicKey) {
  //     setPublicKey(publicKey);
  //     setConnected(connected);
  //   }
  // }, [publicKey, connected, setPublicKey, setConnected]);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <Dashboard />
      
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-auto py-6 bg-card/30 border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-400">
            <p>Drift Subaccount Dashboard • Built with Next.js, Tailwind CSS, and Drift SDK</p>
          </div>
        </div>
      </motion.footer>
    </main>
  );
}