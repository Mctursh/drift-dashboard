'use client';

import { motion } from 'framer-motion';
import { FiArrowDown, FiArrowUp, FiLayers, FiRefreshCw } from 'react-icons/fi';

export default function PositionsView({ positions, loading }: { positions: any, loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Perpetual Positions</h2>
        
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
      ) : positions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiLayers className="mx-auto text-3xl mb-3" />
          <p className="text-lg">No positions found</p>
          <p className="text-sm">Open a position to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {positions.map((position: any, index: number) => (
            <motion.div
              key={position.marketIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="card card-hover"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">Market #{position.marketIndex}</div>
                  <div className={`flex items-center px-2 py-1 rounded text-sm font-medium ${
                    position.direction === 'LONG'
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {position.direction === 'LONG' ? (
                      <FiArrowUp className="mr-1" />
                    ) : (
                      <FiArrowDown className="mr-1" />
                    )}
                    {position.direction}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Size</div>
                    <div className="font-medium">{parseFloat(position.baseAssetAmount).toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Entry Price</div>
                    <div className="font-medium">${parseFloat(position.entryPrice).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Break-Even</div>
                    <div className="font-medium">${parseFloat(position.breakEvenPrice).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Unrealized PnL</div>
                    <div className={`font-medium ${
                      parseFloat(position.unrealizedPnl) >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      ${parseFloat(position.unrealizedPnl).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-1 w-full">
                <div 
                  className={`h-full ${position.direction === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, Math.abs(parseFloat(position.unrealizedPnl) / 100) * 100)}%` }}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}