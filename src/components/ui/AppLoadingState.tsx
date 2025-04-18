'use client';

import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';

export default function AppLoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="h-7 w-32 bg-card-hover rounded animate-pulse"></div>
              <div className="animate-spin">
                <FiRefreshCw size={18} />
              </div>
            </div>
            
            {/* Subaccount skeletons */}
            <div className="space-y-2 mb-4 min-h-[50px] max-h-[350px]">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="w-full h-16 bg-card-hover rounded-lg animate-pulse"
                  style={{ animationDelay: `${index * 150}ms` }}
                ></div>
              ))}
            </div>

            <div className="space-y-2 mt-6">
              <div className="h-5 w-24 bg-card-hover rounded animate-pulse mb-3"></div>
              
              {/* Action button skeletons */}
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="w-full h-10 bg-card-hover rounded-lg animate-pulse"
                  style={{ animationDelay: `${index * 100}ms` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-48 bg-card-hover rounded animate-pulse"></div>
            </div>
            
            {/* Tab skeleton */}
            <div className="border-b border-border pb-4">
              <div className="flex space-x-8">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="h-10 w-24 bg-card-hover rounded animate-pulse"
                    style={{ animationDelay: `${index * 100}ms` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tab content skeleton */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-7 w-36 bg-card-hover rounded animate-pulse"></div>
              <div className="animate-spin">
                <FiRefreshCw size={18} />
              </div>
            </div>
            
            {/* Content cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="card h-24 animate-pulse bg-card-hover"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600/30"></div>
                    <div className="flex-1">
                      <div className="h-5 w-20 bg-card rounded"></div>
                      <div className="h-4 w-24 bg-card rounded mt-2"></div>
                    </div>
                    <div className="h-6 w-16 bg-card rounded"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Alternative loader for positions */}
            <div className="hidden space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="card card-hover h-32 animate-pulse"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-6 w-28 bg-card rounded"></div>
                      <div className="h-6 w-20 bg-card rounded"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(4)].map((_, idx) => (
                        <div key={idx}>
                          <div className="h-4 w-16 bg-card rounded mb-2"></div>
                          <div className="h-5 w-20 bg-card rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-1 w-full">
                    <div className="h-full bg-indigo-500/30" style={{ width: `${Math.random() * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Alternative loader for orders table */}
            <div className="hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    {[...Array(7)].map((_, index) => (
                      <th key={index} className="px-4 py-3">
                        <div className="h-4 w-20 bg-card-hover rounded animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...Array(4)].map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {[...Array(7)].map((_, colIndex) => (
                        <td key={colIndex} className="px-4 py-4 whitespace-nowrap">
                          <div 
                            className="h-5 w-16 bg-card-hover rounded animate-pulse"
                            style={{ animationDelay: `${(rowIndex * 7 + colIndex) * 50}ms` }}
                          ></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated loading indicator in center */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center bg-card/80 backdrop-blur-md p-8 rounded-xl">
          <div className="animate-spin mb-4">
            <FiRefreshCw size={32} className="text-indigo-500" />
          </div>
          <div className="text-lg font-medium">Loading account data...</div>
        </div>
      </div>
    </motion.div>
  );
}