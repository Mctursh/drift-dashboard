// app/components/BalanceView.js
'use client';

import { formatLargeNumber } from '@/utils';
import { motion } from 'framer-motion';
import { FiDollarSign, FiRefreshCw } from 'react-icons/fi';

export default function BalanceView({ balances, loading }: { balances: any, loading: boolean }) {
  const balancesList = Object.values(balances || {});
  console.log('balancesList', balancesList);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Token Balances</h2>
        
        {loading && (
          <div className="animate-spin">
            <FiRefreshCw size={18} />
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin">
            <FiRefreshCw size={24} />
          </div>
        </div>
      ) : balancesList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiDollarSign className="mx-auto text-3xl mb-3" />
          <p className="text-lg">No balances found</p>
          <p className="text-sm">Deposit funds to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balancesList.map((balance: any, index: number) => (
            <motion.div
              key={balance.token}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="card card-hover p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <FiDollarSign size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{balance.token}</h3>
                  <div className="text-sm text-gray-400">
                    Balance: {formatLargeNumber(balance.balance)}
                    {/* Balance: {formatLargeNumber(balance.balance).toFixed(4)} */}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    ${formatLargeNumber(balance.value)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}