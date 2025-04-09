// app/components/WithdrawModal.js
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import { withdrawFunds } from '@/utils/driftUtils';
import useDriftStore from '@/store/driftStore';
import useSubaccountStore from '@/store/subaccountStore';

export default function WithdrawModal() {
  const { driftClient, userMap, closeWithdrawModal } = useDriftStore();
  const { subaccounts, selectedSubaccountIndex, balances } = useSubaccountStore();
  
  const [marketIndex, setMarketIndex] = useState('0');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!driftClient || !userMap) {
      setError('Drift client not initialized');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    const subaccountId = subaccounts[selectedSubaccountIndex]?.id;
    if (subaccountId === undefined) {
      setError('No subaccount selected');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const txSig = await withdrawFunds(
        driftClient,
        userMap,
        subaccountId,
        parseInt(marketIndex),
        parseFloat(amount)
      );
      
      setSuccess(`Withdrawal successful! Transaction: ${txSig.slice(0, 8)}...`);
      setTimeout(() => {
        closeWithdrawModal();
      }, 2000);
    } catch (error: any) {
      console.error('Error withdrawing funds:', error);
      setError(error.message || 'Failed to withdraw funds');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const balancesList = Object.values(balances || {});
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black"
          onClick={closeWithdrawModal}
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md z-10 relative"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Withdraw Funds</h2>
              <button
                onClick={closeWithdrawModal}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleWithdraw}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Subaccount</label>
                  <div className="bg-card-hover rounded-lg p-3 border border-border">
                    {subaccounts[selectedSubaccountIndex]?.name || 'No subaccount selected'}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="marketIndex" className="block text-sm font-medium mb-1">
                    Token
                  </label>
                  <select
                    id="marketIndex"
                    value={marketIndex}
                    onChange={(e) => setMarketIndex(e.target.value)}
                    className="input w-full"
                  >
                    <option value="0">USDC (0)</option>
                    <option value="1">SOL (1)</option>
                    <option value="2">BTC (2)</option>
                    <option value="3">ETH (3)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-1">
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    step="0.000001"
                    min="0"
                    className="input w-full"
                    required
                  />
                  
                  {balancesList.length > 0 && (
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Available:</span>
                      <span>
                        {balancesList.find(b => b.token === marketIndex)?.balance || '0.0000'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 rounded-md bg-red-900/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 rounded-md bg-green-900/30 text-green-400 text-sm flex items-center">
                  <FiCheck className="mr-2 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeWithdrawModal}
                  className="btn btn-outline mr-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <FiCheck className="animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    'Withdraw'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}