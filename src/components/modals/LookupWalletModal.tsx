'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiActivity, FiDollarSign, FiLayers, FiRefreshCw, FiAlertCircle, FiUser } from 'react-icons/fi';
import useDriftStore from '@/store/driftStore';
import useWalletStore from '@/store/walletStore';
import { PublicKey } from '@solana/web3.js';
import { formatLargeNumber } from '@/utils';
import { getSubaccounts, getBalances, getPerpPositions, getOpenOrders, initializeDriftClient } from '@/utils/driftUtils';
import { UserMap } from '@drift-labs/sdk';
import { OrderType, PerpPosition, Subaccount, SubaccountBalances } from '@/types/drift';
import { Transaction, VersionedTransaction } from '@hermis/solana-headless-core';
import { AnchorWallet, useConnection } from '@hermis/solana-headless-react';

export default function LookupWalletModal() {
  const { closeWalletLookupModal, isWalletLookupModalOpen } = useDriftStore();
  const { lookupWalletAddress, setLookupWalletAddress } = useWalletStore();
  
  const [loading, setLoading] = useState(true);
  const [hasDriftAccount, setHasDriftAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('balances');
  const [error, setError] = useState('');
  
  // Lookup wallet data
  const [lookupSubaccounts, setLookupSubaccounts] = useState<Subaccount[]>([]);
  const [selectedSubaccountIndex, setSelectedSubaccountIndex] = useState(0);
  const [lookupBalances, setLookupBalances] = useState<SubaccountBalances>({});
  const [lookupPositions, setLookupPositions] = useState<PerpPosition[]>([]);
  const [lookupOrders, setLookupOrders] = useState<OrderType[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { connection } = useConnection();
  const wallet = {
    publicKey: new PublicKey(lookupWalletAddress || ''),
    signTransaction: async (tx: Transaction | VersionedTransaction) => tx,
    signAllTransactions: async (txs: Transaction[] | VersionedTransaction[]) => txs,
  }

  
  // Initialize lookup wallet and fetch data
  useEffect(() => {
    const initLookupWallet = async () => {
      if (!lookupWalletAddress || !isWalletLookupModalOpen) return;
      
      try {
        setLoading(true);
        setError('');
        
        // First, initialize a temporary client for the lookup wallet
        const client = await initializeDriftClient(
          connection,
          wallet as AnchorWallet
        );
        
        if (!client || !client.userMap) {
          setHasDriftAccount(false);
          return;
        }
        
        // Get subaccounts
        const accounts = await getSubaccounts(client.userMap);
        
        if (accounts && accounts.length > 0) {
          setHasDriftAccount(true);
          setLookupSubaccounts(accounts);
          setSelectedSubaccountIndex(0);
          
          // Get data for the first subaccount
          await fetchSubaccountData(client.userMap, accounts[0].id);
        } else {
          setHasDriftAccount(false);
        }
      } catch (error) {
        console.error('Error initializing lookup wallet:', error);
        setError('Failed to fetch wallet data. Please try again.');
        setHasDriftAccount(false);
      } finally {
        setLoading(false);
      }
    };
    
    initLookupWallet();
    
    // Clean up function
    return () => {
      setLookupSubaccounts([]);
      setLookupBalances({});
      setLookupPositions([]);
      setLookupOrders([]);
    };
  }, [lookupWalletAddress, isWalletLookupModalOpen]);
  
  // Fetch data for a specific subaccount
  const fetchSubaccountData = async (userMap: UserMap, subaccountId: number) => {
    if (!userMap) return;
    
    // Fetch balances
    try {
      const accountBalances = await getBalances(userMap, subaccountId);
      setLookupBalances(accountBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
    
    // Fetch positions
    try {
      const perpPositions = await getPerpPositions(userMap, subaccountId);
      setLookupPositions(perpPositions);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
    
    // Fetch orders
    try {
      const openOrders = await getOpenOrders(userMap, subaccountId);
      setLookupOrders(openOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  
  const handleSelectSubaccount = async (index: number) => {
    if (index === selectedSubaccountIndex) return;
    
    setSelectedSubaccountIndex(index);
    
    // Re-initialize the client to get fresh data for the selected subaccount
    try {
      if (!lookupWalletAddress) return;
      setIsLoadingData(true);
      const publicKey = new PublicKey(lookupWalletAddress);
      const client = await initializeDriftClient(
        connection,
        wallet as AnchorWallet
      );
      
      if (client?.userMap) {
        const subaccountId = lookupSubaccounts[index]?.id;
        await fetchSubaccountData(client.userMap, subaccountId);
      }
    } catch (error) {
      console.error('Error fetching subaccount data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };
  
  const handleCloseModal = () => {
    closeWalletLookupModal();
    // Clear the lookup wallet address
    setLookupWalletAddress(null);
  };
  
  // Render content based on loading and account state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin mr-2">
            <FiRefreshCw size={24} />
          </div>
          <span>Loading wallet data...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FiAlertCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      );
    }
    
    if (!hasDriftAccount) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FiAlertCircle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Drift Account Found</h3>
          <p className="text-gray-400">
            This wallet doesn't have a Drift account or no subaccounts were found.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">
            Wallet: {lookupWalletAddress?.slice(0, 6)}...{lookupWalletAddress?.slice(-4)}
          </h3>
        </div>
        
        {/* Subaccounts List */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Subaccounts</h4>
          <div className="flex flex-wrap gap-2">
            {lookupSubaccounts.map((subaccount, index) => (
              <button
                key={subaccount.id}
                onClick={() => handleSelectSubaccount(index)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  selectedSubaccountIndex === index
                    ? 'bg-indigo-600 text-white'
                    : 'bg-card hover:bg-card-hover text-foreground'
                }`}
              >
                {subaccount.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('balances')}
              className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
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
              className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
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
              className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <FiActivity className="mr-2" />
              Orders
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="mt-4">
          {/* Balances Tab */}
          {activeTab === 'balances' && (
            <div className="space-y-4">
              {isLoadingData ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin">
                    <FiRefreshCw size={24} />
                  </div>
                </div>
              ) : Object.values(lookupBalances).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FiDollarSign className="mx-auto text-2xl mb-2" />
                  <p>No balances found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(lookupBalances).map((balance) => (
                    <div
                      key={balance.token}
                      className="bg-card rounded-lg p-3 border border-border"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Token #{balance.token}</span>
                        <span className="text-sm text-gray-400">
                          {formatLargeNumber(balance.balance)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <div className="space-y-4">
              {isLoadingData ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin">
                    <FiRefreshCw size={24} />
                  </div>
                </div>
              ) : lookupPositions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FiLayers className="mx-auto text-2xl mb-2" />
                  <p>No positions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lookupPositions.map((position) => (
                    <div
                      key={position.marketIndex}
                      className="bg-card rounded-lg p-3 border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Market #{position.marketIndex}</div>
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          position.direction === 'LONG'
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {position.direction}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-gray-400">Size</div>
                          <div>{parseFloat(position.baseAssetAmount).toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Entry Price</div>
                          <div>${parseFloat(position.entryPrice).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {isLoadingData ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin">
                    <FiRefreshCw size={24} />
                  </div>
                </div>
              ) : lookupOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FiActivity className="mx-auto text-2xl mb-2" />
                  <p>No open orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase">Market</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase">Side</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase">Size</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {lookupOrders.map((order) => (
                        <tr key={order.orderId}>
                          <td className="px-2 py-2 whitespace-nowrap">#{order.marketIndex}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{order.orderType}</td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              order.direction === 'LONG'
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-red-900/30 text-red-400'
                            }`}>
                              {order.direction}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">{parseFloat(order.baseAssetAmount).toFixed(4)}</td>
                          <td className="px-2 py-2 whitespace-nowrap">${parseFloat(order.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <AnimatePresence>
      {isWalletLookupModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={handleCloseModal}
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl z-10 relative max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Wallet Lookup</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white focus:outline-none"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}