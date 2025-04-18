'use client';

import { motion } from 'framer-motion';
import { FiActivity, FiArrowDown, FiArrowUp, FiRefreshCw, FiX } from 'react-icons/fi';
import useDriftStore from '../store/driftStore';
import useSubaccountStore from '../store/subaccountStore';

export default function OrdersView({ orders, loading }: { orders: any, loading: boolean }) {
  const { driftClient, userMap } = useDriftStore();
  const { subaccounts, selectedSubaccountIndex, setOrdersLoading, setOrders } = useSubaccountStore();

  const handleCancelOrder = async (orderId: string) => {
    if (!driftClient || !userMap || subaccounts.length === 0) return;
    
    const subaccountId = subaccounts[selectedSubaccountIndex]?.id;
    if (subaccountId === undefined) return;
    
    try {
      setOrdersLoading(true);
      
      await driftClient.cancelOrder(parseInt(orderId));
      
      const updatedOrders = orders.filter((order: any) => order.orderId !== orderId);
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error canceling order:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Open Orders</h2>
        
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
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiActivity className="mx-auto text-3xl mb-3" />
          <p className="text-lg">No open orders</p>
          <p className="text-sm">Place an order to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Side</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trigger</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order: any, index: number) => (
                <motion.tr
                  key={order.orderId}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">#{order.marketIndex}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">{order.orderType}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      order.direction === 'LONG'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {order.direction === 'LONG' ? (
                        <FiArrowUp className="mr-1" size={12} />
                      ) : (
                        <FiArrowDown className="mr-1" size={12} />
                      )}
                      {order.direction}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">{parseFloat(order.baseAssetAmount).toFixed(4)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">${parseFloat(order.price).toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {order.triggerPrice ? `$${parseFloat(order.triggerPrice).toFixed(2)}` : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleCancelOrder(order.orderId)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-400 hover:text-red-300 focus:outline-none"
                    >
                      <FiX className="mr-1" size={12} />
                      Cancel
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}