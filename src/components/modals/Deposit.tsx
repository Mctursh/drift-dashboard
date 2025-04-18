'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import { depositFunds } from '@/utils/driftUtils';
import useDriftStore from '@/store/driftStore';
import useSubaccountStore from '@/store/subaccountStore';
import { BN, QUOTE_PRECISION, SpotMarkets } from '@drift-labs/sdk';

export default function DepositModal() {
  const { driftClient, userMap, closeDepositModal } = useDriftStore();
  const { subaccounts, selectedSubaccountIndex } = useSubaccountStore();

  const [marketIndex, setMarketIndex] = useState('0'); 
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      if (!driftClient || !driftClient.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const marketIndexNum = parseInt(marketIndex);
      const amountBN = new BN(amount).mul(QUOTE_PRECISION);


      try {
        let userAccountExists = false;
        try {
          const userAccount = await driftClient.getUserAccount();
          if (userAccount) {
            userAccountExists = true;
            console.log('User account exists:', userAccount.subAccountId);
          }
        } catch (userError) {
          console.log('User account does not exist yet. Will initialize.');
        }

        if (!userAccountExists) {
          console.log('Initializing user account...');

          try {
            let userStatsAccountExists = false;
            try {
              const userStatsAccountPk = driftClient.getUserStatsAccountPublicKey();
              const userStatsAccountInfo = await driftClient.connection.getAccountInfo(userStatsAccountPk);
              userStatsAccountExists = userStatsAccountInfo !== null;
              console.log('User stats account exists:', userStatsAccountExists);
            } catch (statsCheckError) {
              console.log('Error checking user stats account, assuming it does not exist:', statsCheckError);
            }

            if (!userStatsAccountExists) {
              console.log('Initializing user stats account...');

              const [userStatsTxSig, userStatsAccountPublicKey] = await driftClient.initializeUserAccount(
                0,
                'John Doe'
              );

            }

            await driftClient.subscribe();

          } catch (initError: any) {
            console.error('Error initializing accounts:', initError);
            setError(`Failed to initialize user account: ${initError.message}`);
            setIsSubmitting(false);
            return;
          }
        }

        const marketMint = SpotMarkets['mainnet-beta'].find(market => market.marketIndex === marketIndexNum)?.mint;
        
        if (!marketMint) {
          throw new Error('Invalid market selected');
        }

        const payload = {
          driftClient,
          userMap,
          subaccountId,
          marketIndex: marketIndexNum,
          amount: amountBN,
        }

        const txSig = await depositFunds(payload);


        console.log('Deposit transaction successful:', txSig);
        setSuccess(`Deposit successful! Transaction: ${txSig.slice(0, 8)}...`);
        setTimeout(() => {
          closeDepositModal();
        }, 2000);
      } catch (txError: any) {
        console.error('Transaction error:', txError);

        if (txError.name === 'SendTransactionError' && typeof txError.getLogs === 'function') {
          const logs = txError.getLogs();
          console.error('Transaction logs:', logs);
          setError(`Transaction failed: ${logs?.slice(0, 100) || txError.message}`);
        } else {
          setError(`Transaction failed: ${txError.message}`);
        }
      }

      setTimeout(() => {
        closeDepositModal();
      }, 2000);
    } catch (error: any) {
      console.error('Error depositing funds:', error);
      setError(error.message || 'Failed to deposit funds');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black"
          onClick={closeDepositModal}
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
              <h2 className="text-xl font-bold">Deposit Funds</h2>
              <button
                onClick={closeDepositModal}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleDeposit}>
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
                    <option value="0">USDC</option>
                    <option value="1">SOL</option>
                  </select>
                  <div className="text-xs text-gray-400 mt-1">
                    {marketIndex === '0' ?
                      'USDC will be deposited from your wallet' :
                      'SOL will be deposited from your wallet'
                    }
                  </div>
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
                  onClick={closeDepositModal}
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
                    'Deposit'
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