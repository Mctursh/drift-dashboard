'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import useDriftStore from '../store/driftStore';
import useSubaccountStore from '../store/subaccountStore';
import { PerpPosition } from '@/types/drift';

export default function TakeProfitStopLossForm() {
  const {
    driftClient,
    userMap,
    closeTpSlModal,
    takeProfitPrice,
    setTakeProfitPrice,
    stopLossPrice,
    setStopLossPrice,
  } = useDriftStore();
  
  const { subaccounts, selectedSubaccountIndex, positions } = useSubaccountStore();
  
  const [marketIndex, setMarketIndex] = useState('0');
  const [size, setSize] = useState('');
  const [direction, setDirection] = useState('LONG');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Auto-populate fields if we have a position
  const position = positions.find(p => p.marketIndex === marketIndex);
  
  const handleSetPosition = (position: PerpPosition) => {
    if (position) {
      setMarketIndex(position.marketIndex);
      setSize(position.baseAssetAmount);
      setDirection(position.direction);
    }
  };
  
  const handlePlaceOrders = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!driftClient || !userMap) {
      setError('Drift client not initialized');
      return;
    }
    
    if (!size || isNaN(parseFloat(size)) || parseFloat(size) <= 0) {
      setError('Please enter a valid size');
      return;
    }
    
    if ((!takeProfitPrice || isNaN(parseFloat(takeProfitPrice))) && 
        (!stopLossPrice || isNaN(parseFloat(stopLossPrice)))) {
      setError('Please enter either a take profit or stop loss price');
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
      setTakeProfitPrice('');
      setStopLossPrice('');
      
      setTimeout(() => {
        closeTpSlModal();
      }, 2000);
    } catch (error: any) {
      console.error('Error placing TP/SL orders:', error);
      setError(error.message || 'Failed to place orders');
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
          onClick={closeTpSlModal}
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
              <h2 className="text-xl font-bold">Take Profit / Stop Loss</h2>
              <button
                onClick={closeTpSlModal}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handlePlaceOrders}>
              <div className="space-y-4 mb-6">
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
                    <option value="0">BTC-PERP</option>
                    <option value="1">ETH-PERP</option>
                    <option value="2">SOL-PERP</option>
                  </select>
                </div>
                
                {positions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Position
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {positions.map((pos) => (
                        <button
                          key={pos.marketIndex}
                          type="button"
                          onClick={() => handleSetPosition(pos)}
                          className="btn btn-outline flex justify-between items-center"
                        >
                          <span>Market #{pos.marketIndex}</span>
                          <span className={pos.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}>
                            {pos.direction} {parseFloat(pos.baseAssetAmount).toFixed(4)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="direction" className="block text-sm font-medium mb-1">
                    Position Direction
                  </label>
                  <select
                    id="direction"
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="input w-full"
                  >
                    <option value="LONG">Long</option>
                    <option value="SHORT">Short</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="size" className="block text-sm font-medium mb-1">
                    Position Size
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
                
                <div>
                  <label htmlFor="takeProfitPrice" className="block text-sm font-medium mb-1">
                    Take Profit Price
                  </label>
                  <input
                    id="takeProfitPrice"
                    type="number"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    placeholder={direction === 'LONG' ? "Price above entry" : "Price below entry"}
                    step="0.01"
                    min="0"
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="stopLossPrice" className="block text-sm font-medium mb-1">
                    Stop Loss Price
                  </label>
                  <input
                    id="stopLossPrice"
                    type="number"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    placeholder={direction === 'LONG' ? "Price below entry" : "Price above entry"}
                    step="0.01"
                    min="0"
                    className="input w-full"
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
                  onClick={closeTpSlModal}
                  className="btn btn-outline mr-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-accent"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <FiCheck className="animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    'Place TP/SL Orders'
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