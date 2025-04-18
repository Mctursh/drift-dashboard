'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useWalletStore from '../store/walletStore';
import useDriftStore from '../store/driftStore';
import useSubaccountStore from '../store/subaccountStore';
import { 
  getSubaccounts, 
  getBalances, 
  getPerpPositions, 
  getOpenOrders 
} from '../utils/driftUtils';
import SubaccountList from './SubaccountList';
import BalanceView from './BalanceView';
import PositionsView from './PositionsView';
import OrdersView from './OrdersView';
import DepositModal from './modals/Deposit';
import WithdrawModal from './modals/Withdraw';
import PerpOrderForm from './PerpOrderForm';
import TakeProfitStopLossForm from './TakeProfitStopLossForm';
import ScaledOrdersForm from './ScaledOrdersForm';
import { FiActivity, FiDollarSign, FiGrid, FiLayers } from 'react-icons/fi';
import LookupWalletModal from './modals/LookupWalletModal';
import { useWallet } from '@hermis/solana-headless-react';
import AppLoadingState from './ui/AppLoadingState';

export default function Dashboard() {
  const { connected } = useWallet()
  const { lookupWalletAddress } = useWalletStore();
  const { isWalletLookupModalOpen, userMap, isDepositModalOpen, isWithdrawModalOpen, isPerpOrderModalOpen, isTpSlModalOpen, isScaledOrdersModalOpen } = useDriftStore();
  const { 
    subaccounts, 
    selectedSubaccountIndex, 
    balances, 
    positions, 
    orders,
    loading,
    balancesLoading,
    positionsLoading,
    ordersLoading,
    setSubaccounts,
    setSelectedSubaccountIndex,
    setBalances,
    setPositions,
    setOrders,
    setLoading,
  } = useSubaccountStore();
  
  const [activeTab, setActiveTab] = useState('balances');
  
  useEffect(() => {
    const fetchSubaccounts = async () => {
      if (!userMap) return;
      
      try {
        setLoading(true);
        const accounts = await getSubaccounts(userMap);
        console.log('accounts', accounts);
        setSubaccounts(accounts);
        if (accounts.length > 0) {
          setSelectedSubaccountIndex(0);
        }
      } catch (error) {
        console.error('Error fetching subaccounts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubaccounts();
  }, [userMap, setSubaccounts, setSelectedSubaccountIndex, setLoading]);
  
  useEffect(() => {
    const fetchSubaccountData = async () => {
      if (!userMap || subaccounts.length === 0) {
        setBalances({});
        setPositions([]);
        setOrders([]);
        return;
      }
      
      const subaccount = subaccounts[selectedSubaccountIndex];
      if (!subaccount) {
        console.warn("No valid subaccount at index", selectedSubaccountIndex);
        return;
      }
      
      const subaccountId = subaccount.id;
      
      setLoading(true);
      
      const fetchBalances = async () => {
        try {
          return await getBalances(userMap, subaccountId);
        } catch (error) {
          console.error('Error fetching balances:', error);
          return {};
        }
      };
      
      const fetchPositions = async () => {
        try {
          return await getPerpPositions(userMap, subaccountId);
        } catch (error) {
          console.error('Error fetching positions:', error);
          return [];
        }
      };
      
      const fetchOrders = async () => {
        try {
          return await getOpenOrders(userMap, subaccountId);
        } catch (error) {
          console.error('Error fetching orders:', error);
          return [];
        }
      };
      
      try {
        const [balancesData, positionsData, ordersData] = await Promise.all([
          fetchBalances(),
          fetchPositions(),
          fetchOrders()
        ]);
        
        // Update all state at once
        setBalances(balancesData);
        setPositions(positionsData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching subaccount data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubaccountData();
  }, [
    userMap, 
    subaccounts, 
    selectedSubaccountIndex, 
    setBalances, 
    setPositions, 
    setOrders,
    setLoading
  ]);

  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold gradient-text mb-4">Connect Your Solana Wallet</h2>
          <p className="text-lg text-gray-300 mb-8">Connect your wallet or lookup a wallet address to view Drift subaccounts and positions.</p>
        </div>
      </motion.div>
    );
  }

  if (connected && loading) {
    return <AppLoadingState />
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <div className="lg:col-span-1">
            <SubaccountList 
              subaccounts={subaccounts} 
              selectedIndex={selectedSubaccountIndex} 
              onSelect={setSelectedSubaccountIndex}
              loading={loading}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between mb-4"
              >
                <h2 className="text-2xl font-bold">
                  {lookupWalletAddress ? 'Viewing Wallet' : 'Your Account'}
                </h2>
                {lookupWalletAddress && (
                  <div className="text-sm text-gray-400 truncate max-w-[50%]">
                    {lookupWalletAddress}
                  </div>
                )}
              </motion.div>
              
              <div className="border-b border-border">
                <nav className="flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('balances')}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'balances'
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <FiDollarSign className="mr-2" />
                    Balances
                  </button>
                  <button
                    onClick={() => setActiveTab('positions')}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'positions'
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <FiLayers className="mr-2" />
                    Positions
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'orders'
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <FiActivity className="mr-2" />
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('trade')}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'trade'
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <FiGrid className="mr-2" />
                    Trade
                  </button>
                </nav>
              </div>
            </div>
            
            <div className="mt-6">
              {activeTab === 'balances' && (
                <BalanceView balances={balances} loading={balancesLoading} />
              )}
              
              {activeTab === 'positions' && (
                <PositionsView positions={positions} loading={positionsLoading} />
              )}
              
              {activeTab === 'orders' && (
                <OrdersView orders={orders} loading={ordersLoading} />
              )}
              
              {activeTab === 'trade' && (
                <PerpOrderForm />
              )}
            </div>
          </div>
        </div>
      </motion.div>
      
      {isDepositModalOpen && <DepositModal />}
      {isWithdrawModalOpen && <WithdrawModal />}
      {isPerpOrderModalOpen && <PerpOrderForm isModal />}
      {isTpSlModalOpen && <TakeProfitStopLossForm />}
      {isScaledOrdersModalOpen && <ScaledOrdersForm />}
      {isWalletLookupModalOpen && <LookupWalletModal />}
    </>
  );
}