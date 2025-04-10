'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import useWalletStore from '../store/walletStore';
import useDriftStore from '../store/driftStore';

export default function WalletLookup() {
  const [inputValue, setInputValue] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const { setLookupWalletAddress } = useWalletStore();
  const { openWalletLookupModal } = useDriftStore();

  const validateAndSetAddress = (address: string) => {
    if (!address.trim()) {
      setIsValidAddress(true);
      return;
    }

    try {
      // Validate Solana address
      new PublicKey(address);
      setIsValidAddress(true);
      
      // Set the lookup wallet address and open the modal
      setLookupWalletAddress(address);
      openWalletLookupModal();
      
      // Clear the input field
      setInputValue('');
    } catch (error) {
      setIsValidAddress(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateAndSetAddress(inputValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex-1"
    >
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative w-full">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsValidAddress(true);
            }}
            placeholder="Lookup wallet address..."
            className={`input w-full pr-10 ${!isValidAddress ? 'border-danger focus:ring-danger' : ''}`}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-md text-foreground hover:text-white focus:outline-none"
          >
            <FiSearch size={18} />
          </button>
        </div>
      </form>
      
      {!isValidAddress && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-danger text-xs mt-1"
        >
          Please enter a valid Solana address
        </motion.p>
      )}
    </motion.div>
  );
}