'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import useDriftStore from '../store/driftStore';
import useSubaccountStore from '../store/subaccountStore';

export default function ScaledOrdersForm() {
  const {
    driftClient,
    userMap,
    closeScaledOrdersModal,
    scaledOrdersCount,
    setScaledOrdersCount,
    priceRangeStart,
    setPriceRangeStart,
    priceRangeEnd,
    setPriceRangeEnd,
    totalSize,
    setTotalSize,
  } = useDriftStore();
  
  const { subaccounts, selectedSubaccountIndex } = useSubaccountStore();
  
  const [marketIndex, setMarketIndex] = useState('0');
  const [direction, setDirection] = useState('LONG');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderSummary, setOrderSummary] = useState([]);
  
  useEffect(() => {
    if (
      priceRangeStart &&
      priceRangeEnd &&
      totalSize &&
      scaledOrdersCount > 1 &&
      !isNaN(parseFloat(priceRangeStart)) &&
      !isNaN(parseFloat(priceRangeEnd)) &&
      !isNaN(parseFloat(totalSize))
    ) {
      const start = parseFloat(priceRangeStart);
      const end = parseFloat(priceRangeEnd);
      const size = parseFloat(totalSize);
      const count = scaledOrdersCount;
      
      const sizePerOrder = size / count;
      const priceDelta = (end - start) / (count - 1);
      
      const summary = Array.from({ length: count }, (_, i) => {
        const price = start + (priceDelta * i);
        return {
          orderNum: i + 1,
          price: price.toFixed(2),
          size: sizePerOrder.toFixed(4),
        };
      });
      
      setOrderSummary(summary as any);
    } else {
      setOrderSummary([]);
    }
  }, [priceRangeStart, priceRangeEnd, totalSize, scaledOrdersCount]);
  
  const handlePlaceOrders = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!driftClient || !userMap) {
      setError('Drift client not initialized');
      return;
    }
    
    if (!totalSize || isNaN(parseFloat(totalSize)) || parseFloat(totalSize) <= 0) {
      setError('Please enter a valid total size');
      return;
    }
    
    if (!priceRangeStart || isNaN(parseFloat(priceRangeStart)) || parseFloat(priceRangeStart) <= 0) {
      setError('Please enter a valid start price');
      return;
    }
    
    if (!priceRangeEnd || isNaN(parseFloat(priceRangeEnd)) || parseFloat(priceRangeEnd) <= 0) {
      setError('Please enter a valid end price');
      return;
    }
    
    if (scaledOrdersCount < 2) {
      setError('Please set at least 2 orders');
      return;
    }
    
    if (parseFloat(priceRangeStart) === parseFloat(priceRangeEnd)) {
      setError('Start and end prices cannot be the same');
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

      setTotalSize('');
      setPriceRangeStart('');
      setPriceRangeEnd('');
      
      setTimeout(() => {
        closeScaledOrdersModal();
      }, 2000);
    } catch (error: any) {
      console.error('Error placing scaled orders:', error);
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
          onClick={closeScaledOrdersModal}
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md z-10 relative max-h-[90vh] overflow-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Scaled Orders</h2>
              <button
                onClick={closeScaledOrdersModal}
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
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDirection('LONG')}
                      className={`btn flex items-center justify-center ${
                        direction === 'LONG'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'btn-outline'
                      }`}
                    >
                      <FiArrowUp className="mr-2" />
                      Long
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('SHORT')}
                      className={`btn flex items-center justify-center ${
                        direction === 'SHORT'
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
                  <label htmlFor="totalSize" className="block text-sm font-medium mb-1">
                    Total Size
                  </label>
                  <input
                    id="totalSize"
                    type="number"
                    value={totalSize}
                    onChange={(e) => setTotalSize(e.target.value)}
                    placeholder="Enter total size"
                    step="0.000001"
                    min="0"
                    className="input w-full"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priceRangeStart" className="block text-sm font-medium mb-1">
                      Start Price
                    </label>
                    <input
                      id="priceRangeStart"
                      type="number"
                      value={priceRangeStart}
                      onChange={(e) => setPriceRangeStart(e.target.value)}
                      placeholder="Start price"
                      step="0.01"
                      min="0"
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priceRangeEnd" className="block text-sm font-medium mb-1">
                      End Price
                    </label>
                    <input
                      id="priceRangeEnd"
                      type="number"
                      value={priceRangeEnd}
                      onChange={(e) => setPriceRangeEnd(e.target.value)}
                      placeholder="End price"
                      step="0.01"
                      min="0"
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Number of Orders: {scaledOrdersCount}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={scaledOrdersCount}
                    onChange={(e) => setScaledOrdersCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-card-hover rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>2</span>
                    <span>10</span>
                  </div>
                </div>
                
                {orderSummary.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Order Summary</h3>
                    <div className="bg-card-hover rounded-lg border border-border p-2 max-h-32 overflow-y-auto">
                      <table className="min-w-full divide-y divide-border text-xs">
                        <thead>
                          <tr>
                            <th className="px-2 py-1 text-left">Order</th>
                            <th className="px-2 py-1 text-right">Price</th>
                            <th className="px-2 py-1 text-right">Size</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {orderSummary.map((order: any) => (
                            <tr key={order.orderNum}>
                              <td className="px-2 py-1">{order.orderNum}</td>
                              <td className="px-2 py-1 text-right">${order.price}</td>
                              <td className="px-2 py-1 text-right">{order.size}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                <button
                  type="button"
                  onClick={closeScaledOrdersModal}
                  className="btn btn-outline mr-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <FiCheck className="animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    'Place Scaled Orders'
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