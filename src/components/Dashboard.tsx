// app/components/Dashboard.js
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

export default function Dashboard() {
  const { publicKey, connected, lookupWalletAddress } = useWalletStore();
  const { driftClient, isWalletLookupModalOpen, userMap, isDepositModalOpen, isWithdrawModalOpen, isPerpOrderModalOpen, isTpSlModalOpen, isScaledOrdersModalOpen } = useDriftStore();
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
    setBalancesLoading,
    setPositionsLoading,
    setOrdersLoading,
  } = useSubaccountStore();
  
  const [activeTab, setActiveTab] = useState('balances');
  
  // Fetch subaccounts on wallet connection or lookup
  useEffect(() => {
    const fetchSubaccounts = async () => {
      console.log('userMap', userMap);
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
  
  // Fetch subaccount data when selected subaccount changes
  useEffect(() => {
    const fetchSubaccountData = async () => {
      if (!userMap || subaccounts.length === 0) return;
      
      const subaccountId = subaccounts[selectedSubaccountIndex]?.id;
      if (subaccountId === undefined) return;
      
      // Fetch balances
      try {
        setBalancesLoading(true);
        const accountBalances = await getBalances(userMap, subaccountId);
        setBalances(accountBalances);
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setBalancesLoading(false);
      }
      
      // Fetch positions
      try {
        setPositionsLoading(true);
        const perpPositions = await getPerpPositions(userMap, subaccountId);
        setPositions(perpPositions);
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setPositionsLoading(false);
      }
      
      // Fetch orders
      try {
        setOrdersLoading(true);
        const openOrders = await getOpenOrders(userMap, subaccountId);
        setOrders(openOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrdersLoading(false);
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
    setBalancesLoading,
    setPositionsLoading,
    setOrdersLoading,
  ]);
  
  // Render dashboard when wallet is connected or a lookup address is provided
  const shouldRenderDashboard = connected || lookupWalletAddress;

  if (!shouldRenderDashboard) {
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SubaccountList 
              subaccounts={subaccounts} 
              selectedIndex={selectedSubaccountIndex} 
              onSelect={setSelectedSubaccountIndex}
              loading={loading}
            />
          </div>
          
          {/* Main Content */}
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
              
              {/* Tabs */}
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
            
            {/* Tab Content */}
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
      
      {/* Modals */}
      {isDepositModalOpen && <DepositModal />}
      {isWithdrawModalOpen && <WithdrawModal />}
      {isPerpOrderModalOpen && <PerpOrderForm isModal />}
      {isTpSlModalOpen && <TakeProfitStopLossForm />}
      {isScaledOrdersModalOpen && <ScaledOrdersForm />}
      {isWalletLookupModalOpen && <LookupWalletModal />}
    </>
  );
}