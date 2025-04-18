// app/components/PerpOrderForm.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowDown, FiArrowUp, FiCheck, FiX } from 'react-icons/fi';
import { placeLimitOrder, placeMarketOrder } from '../utils/driftUtils';
import useDriftStore from '../store/driftStore';
import useSubaccountStore from '../store/subaccountStore';
import { PlaceOrderPayload } from '@/types/drift';
import { BN, PerpMarketConfig } from '@drift-labs/sdk';

export default function PerpOrderForm({ isModal = false }) {
  const { 
    driftClient, 
    userMap, 
    markets,
    closePerpOrderModal,
    orderType,
    setOrderType,
    orderDirection,
    setOrderDirection,
  } = useDriftStore();
  
  const { subaccounts, selectedSubaccountIndex } = useSubaccountStore();
  
  const [marketIndex, setMarketIndex] = useState('0');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableMarkets, setAvailableMarkets] = useState<PerpMarketConfig[]>([]);
  
  useEffect(() => {
    if (markets) {
      const perpMarkets = markets['mainnet-beta'] || [];
      const sortedMarkets = [...perpMarkets].sort((a, b) => a.marketIndex - b.marketIndex);
      setAvailableMarkets(sortedMarkets);
      
      if (sortedMarkets.length > 0 && !marketIndex) {
        setMarketIndex(sortedMarkets[0].marketIndex.toString());
      }
    }
  }, [markets]);
  
  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!driftClient || !userMap) {
      setError('Drift client not initialized');
      return;
    }
    
    if (!size || isNaN(parseFloat(size)) || parseFloat(size) <= 0) {
      setError('Please enter a valid size');
      return;
    }
    
    if (orderType === 'LIMIT' && (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
      setError('Please enter a valid price');
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
      
      let txSig;
      let payload: PlaceOrderPayload = {
        driftClient,
        userMap,
        subaccountId,
        marketIndex: parseInt(marketIndex),
        size: new BN(parseFloat(size)),
        direction: orderDirection,
        orderType
      }
      
      if (orderType === 'MARKET') {
        payload.orderType = 'MARKET';

        console.log('payload', payload);
        txSig = await placeLimitOrder(payload);
      } else {
        payload.orderType = 'LIMIT';
        payload.price = new BN(price);

        console.log('payload', payload);
        txSig = await placeLimitOrder(payload);
      }
      
      setSuccess(`Order placed successfully! Transaction: ${txSig.slice(0, 8)}...`);
      
      // Reset form
      setSize('');
      setPrice('');
      
      if (isModal) {
        setTimeout(() => {
          closePerpOrderModal();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      setError(error.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const content = (
    <div className={isModal ? "p-6" : ""}>
      {isModal && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Place Order</h2>
          <button
            onClick={closePerpOrderModal}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
      )}
      
      <form onSubmit={handlePlaceOrder}>
        <div className="space-y-4 mb-6">
          {!isModal && (
            <div>
              <label className="block text-sm font-medium mb-1">Subaccount</label>
              <div className="bg-card-hover rounded-lg p-3 border border-border">
                {subaccounts[selectedSubaccountIndex]?.name || 'No subaccount selected'}
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="marketIndex" className="block text-sm font-medium mb-1">
              Market
            </label>
            <select
              id="marketIndex"
              value={marketIndex}
              onChange={(e) => setMarketIndex(e.target.value)}
              className="input w-full"
            >
              {availableMarkets.length === 0 ? (
                <option value="">Loading markets...</option>
              ) : (
                availableMarkets.map((market) => (
                  <option key={market.marketIndex} value={market.marketIndex.toString()}>
                    {market.symbol || `PERP-${market.marketIndex}`}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderDirection('LONG')}
                className={`btn flex items-center justify-center ${
                  orderDirection === 'LONG'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'btn-outline'
                }`}
              >
                <FiArrowUp className="mr-2" />
                Long
              </button>
              <button
                type="button"
                onClick={() => setOrderDirection('SHORT')}
                className={`btn flex items-center justify-center ${
                  orderDirection === 'SHORT'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'btn-outline'
                }`}
              >
                <FiArrowDown className="mr-2" />
                Short
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`btn ${
                  orderType === 'MARKET'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'btn-outline'
                }`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`btn ${
                  orderType === 'LIMIT'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'btn-outline'
                }`}
              >
                Limit
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="size" className="block text-sm font-medium mb-1">
              Size
            </label>
            <input
              id="size"
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Enter size"
              step="0.000001"
              min="0"
              className="input w-full"
              required
            />
          </div>
          
          {orderType === 'LIMIT' && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                step="0.01"
                min="0"
                className="input w-full"
                required
              />
            </div>
          )}
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
          {isModal && (
            <button
              type="button"
              onClick={closePerpOrderModal}
              className="btn btn-outline mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className={`btn ${
              orderDirection === 'LONG'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <FiCheck className="animate-spin mr-2" />
                Processing...
              </span>
            ) : (
              `Place ${orderDirection} ${orderType} Order`
            )}
          </button>
        </div>
      </form>
    </div>
  );
  
  if (isModal) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={closePerpOrderModal}
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md z-10 relative"
          >
            {content}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="card"
    >
      {content}
    </motion.div>
  );
}