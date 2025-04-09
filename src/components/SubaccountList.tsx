'use client';

import { motion } from 'framer-motion';
import { FiPlus, FiRefreshCw, FiUser } from 'react-icons/fi';
import useDriftStore from '@/store/driftStore';
import { SubaccountListProps } from '@/types/ui';

export default function SubaccountList({ 
  subaccounts, 
  selectedIndex, 
  onSelect, 
  loading 
}: SubaccountListProps) {
  const { 
    openDepositModal, 
    openWithdrawModal, 
    openPerpOrderModal,
    openTpSlModal,
    openScaledOrdersModal,
  } = useDriftStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="card h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Subaccounts</h2>
        
        {loading ? (
          <div className="animate-spin">
            <FiRefreshCw size={18} />
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            {subaccounts.length} accounts
          </div>
        )}
      </div>
      
      <div className="space-y-2 mb-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin">
              <FiRefreshCw size={24} />
            </div>
          </div>
        ) : subaccounts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FiUser className="mx-auto text-2xl mb-2" />
            <p>No subaccounts found</p>
          </div>
        ) : (
          subaccounts.map((subaccount, index) => (
            <motion.button
              key={subaccount.id}
              onClick={() => onSelect(index)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`w-full flex items-center p-3 rounded-lg transition-all ${
                selectedIndex === index
                  ? 'bg-indigo-600 text-white'
                  : 'bg-card hover:bg-card-hover text-foreground'
              }`}
            >
              <div className="flex-1 text-left">
                <div className="font-medium">Subaccount {subaccount.id}</div>
                <div className="text-xs opacity-70 truncate">
                  {subaccount.authority.slice(0, 6)}...{subaccount.authority.slice(-4)}
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      <div className="space-y-2 mt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Actions</h3>
        
        <motion.button
          onClick={openDepositModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full btn btn-outline flex items-center justify-center"
          disabled={loading || subaccounts.length === 0}
        >
          <FiPlus className="mr-2" size={16} />
          Deposit
        </motion.button>
        
        <motion.button
          onClick={openWithdrawModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full btn btn-outline flex items-center justify-center"
          disabled={loading || subaccounts.length === 0}
        >
          <FiPlus className="mr-2" size={16} />
          Withdraw
        </motion.button>
        
        <motion.button
          onClick={openPerpOrderModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full btn btn-primary flex items-center justify-center"
          disabled={loading || subaccounts.length === 0}
        >
          <FiPlus className="mr-2" size={16} />
          New Order
        </motion.button>
        
        <motion.button
          onClick={openTpSlModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full btn btn-accent flex items-center justify-center"
          disabled={loading || subaccounts.length === 0}
        >
          <FiPlus className="mr-2" size={16} />
          TP/SL
        </motion.button>
        
        <motion.button
          onClick={openScaledOrdersModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full btn btn-secondary flex items-center justify-center"
          disabled={loading || subaccounts.length === 0}
        >
          <FiPlus className="mr-2" size={16} />
          Scaled Orders
        </motion.button>
      </div>
    </motion.div>
  );
}