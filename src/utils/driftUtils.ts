import { Connection, PublicKey } from '@hermis/solana-headless-core';
import {
  DriftClient,
  initialize,
  BulkAccountLoader,
  UserMap,
  PerpMarkets,
  //   MAINNET_CONFIG,
  OrderType,
  PositionDirection,
  OrderTriggerCondition,
  User,
  UserAccount,
  OrderParams,
  TxParams,
} from '@drift-labs/sdk';
import {
  DriftClientConfig,
  Subaccount,
  SubaccountBalances,
  PerpPosition,
  OrderType as OrderTypeModel,
  TransactionResponse,
  DepositFundPayload,
  WithdrawFundPayload
} from '@/types/drift';
import { TransactionInstruction } from '@solana/web3.js';
import { AnchorWallet, useAnchorWallet } from '@hermis/solana-headless-react';


const heliusRPC = "https://mainnet.helius-rpc.com/?api-key=6b972023-3a7c-4ded-ae5a-a0ccc390ea4c"
const MAX_SUBACCOUNTS = 8;

// Initialize Drift client
export const initializeDriftClient = async (publicKey: PublicKey): Promise<DriftClientConfig> => {
  try {
    // Create connection to preferred RPC endpoint
    const connection = new Connection(heliusRPC, 'confirmed');
    
    // Initialize the SDK with the mainnet environment
    const sdkConfig = initialize({ env: 'mainnet-beta' });
    
    // Create wallet instance using the connected user's public key
    const wallet = {
      publicKey: publicKey,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any) => txs,
    };

    // Create bulk account loader for efficient data fetching
    const accountLoader = new BulkAccountLoader(
      connection,
      'confirmed',
      10_000 // Reasonable timeout
    );

    // Initialize Drift client with the connected wallet
    const driftClient = new DriftClient({
      connection,
      wallet,
      programID: new PublicKey(sdkConfig.DRIFT_PROGRAM_ID),
      accountSubscription: {
        type: 'websocket',
        // accountLoader: accountLoader,
      },
    });

    // Initialize UserMap to track all subaccounts (up to 8)
    const userMap = new UserMap({
      driftClient,
      connection,
      // authority: publicKey,
      subscriptionConfig: {
        type: 'websocket',
        // frequency: 5000,
        commitment: 'confirmed',
      },
    });

    // Subscribe to users/subaccounts
    await userMap.subscribe();
    
    console.log('Drift client initialized successfully');
    console.log('UserMap subscribed successfully');

    return {
      driftClient,
      userMap,
      accountLoader,
      markets: PerpMarkets,
    };
  } catch (error) {
    console.error('Error initializing Drift client:', error);
    throw error;
  }
};

// Get user stats account
export const getUserStatsAccount = async (driftClient: DriftClient, publicKey: PublicKey): Promise<string> => {
  try {
    return driftClient.userStatsAccountPublicKey.toBase58()
    // return driftClient.getUserStatsAccountPublicKey(publicKey).toString();
  } catch (error) {
    console.error('Error getting user stats account:', error);
    throw error;
  }
};

export const getSubaccounts = async (userMap: UserMap): Promise<Subaccount[]> => {
  try {
    const subaccounts: Subaccount[] = [];
    
    // Get iterator of User objects from UserMap
    const users = userMap.values();
    const userCount = [...userMap.values()].length;
    console.log(`Found ${userCount} User objects in UserMap`);
    
    // Reset the iterator
    const usersIterator = userMap.values();
    let index = 0;
    
    // Iterate through User objects
    for (const userInstance of usersIterator) {
      if (userInstance) {
        try {
          // Get the user account data by calling getUserAccount()
          const userAccount = userInstance.getUserAccount();
          
          if (userAccount) {
            subaccounts.push({
              id: index,
              name: `Subaccount ${userAccount.subAccountId || index}`,
              authority: userAccount.authority.toString(),
              subAccountId: userAccount.subAccountId,
              delegate: userAccount.delegate.toString(),
            });
          }
        } catch (err) {
          console.warn(`Error processing User object at index ${index}:`, err);
        }
      }
      
      index++;
      if (index >= MAX_SUBACCOUNTS) break;
    }

    console.log('subaccounts', subaccounts);
    
    
    return subaccounts;
  } catch (error) {
    console.error('Error getting subaccounts:', error);
    throw error;
  }
};

export const getUserBySubaccountId = (userMap: UserMap, subaccountId: number): User | null => {
  try {
    if (!userMap) {
      console.warn("UserMap is undefined or null");
      return null;
    }
    
    const users = [...userMap.values()];
    console.log(`Searching through ${users.length} users for subaccount ID ${subaccountId}`);
    
    for (const user of users) {
      try {
        const account = user.getUserAccount();
        if (account && account.subAccountId === subaccountId) {
          return user;
        }
      } catch (err) {
        console.warn("Error accessing user account:", err);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error in getUserBySubaccountId:", error);
    return null;
  }
};

export const getUserAccountBySubaccountId = (userMap: UserMap, subaccountId: number): any => {
  const user = getUserBySubaccountId(userMap, subaccountId);
  if (!user) {
    console.warn(`No user found for subaccount ID: ${subaccountId}`);
    return null;
  }
  
  try {
    return user.getUserAccount();
  } catch (err) {
    console.error("Error getting user account:", err);
    return null;
  }
};

// Get balances for a subaccount
export const getBalances = async (userMap: UserMap, subaccountId: number): Promise<SubaccountBalances> => {
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    const balances: SubaccountBalances = {};
    for (const token of user.spotPositions) {
      if (token.scaledBalance.gt(0)) {
        const tokenName = token.marketIndex.toString();
        balances[tokenName] = {
          token: tokenName,
          balance: token.scaledBalance.toString(),
          value: token.scaledBalance.toString(),
          // value: token.value.toString(),
        };
      }
    }

    return balances;
  } catch (error) {
    console.error('Error getting balances:', error);
    throw error;
  }
};

export const getPerpPositions = async (userMap: UserMap, subaccountId: number): Promise<PerpPosition[]> => {
  try {
    // First, log to verify the params we're receiving
    console.log(`Getting positions for subaccount ID: ${subaccountId}`);
    
    // Get the user instance first
    let userInstance = null;
    try {
      for (const user of userMap.values()) {
        const account = user.getUserAccount();
        if (account && account.subAccountId === subaccountId) {
          userInstance = user;
          break;
        }
      }
    } catch (err: any) {
      console.error("Error finding user in userMap:", err);
      throw new Error(`Failed to find user: ${err.message}`);
    }

    if (!userInstance) {
      console.warn(`No user found for subaccount ID: ${subaccountId}`);
      return []; // Return empty array instead of throwing
    }
    
    // Get the user account data
    let userAccount = null;
    try {
      userAccount = userInstance.getUserAccount();
      console.log("Found user account:", userAccount.subAccountId);
    } catch (err: any) {
      console.error("Error getting user account:", err);
      throw new Error(`Failed to get user account: ${err.message}`);
    }
    
    // Verify perpPositions exists and is iterable
    if (!userAccount.perpPositions || !Array.isArray(userAccount.perpPositions)) {
      console.warn("User account has no perpPositions array:", userAccount);
      return []; // Return empty array
    }
    
    console.log(`Found ${userAccount.perpPositions.length} perp positions`);
    
    // Process positions safely
    const positions: PerpPosition[] = [];
    
    for (const position of userAccount.perpPositions) {
      try {
        // Skip if position is not valid
        if (!position || !position.marketIndex) continue;
        
        // Skip empty positions
        const hasBaseAmount = position.baseAssetAmount && 
                             typeof position.baseAssetAmount.gt === 'function' && 
                             position.baseAssetAmount.gt(0);
                             
        const hasQuoteAmount = position.quoteAssetAmount && 
                              typeof position.quoteAssetAmount.gt === 'function' && 
                              position.quoteAssetAmount.gt(0);
        
        if (!hasBaseAmount && !hasQuoteAmount) continue;
        
        // Add the position with safe conversions
        positions.push({
          marketIndex: position.marketIndex.toString(),
          baseAssetAmount: position.baseAssetAmount ? position.baseAssetAmount.toString() : '0',
          quoteAssetAmount: position.quoteAssetAmount ? position.quoteAssetAmount.toString() : '0',
          entryPrice: position.quoteEntryAmount || '0',
          breakEvenPrice: position.quoteBreakEvenAmount || '0',
          pnl: position.settledPnl || '0',
          unrealizedPnl: position.remainderBaseAssetAmount ? 
                        position.remainderBaseAssetAmount.toString() : '0',
          direction: (hasBaseAmount && position.baseAssetAmount.gt(0)) ? 'LONG' : 'SHORT',
        });
      } catch (posErr) {
        console.warn(`Error processing position at market index ${position?.marketIndex}:`, posErr);
        // Continue to next position instead of failing
      }
    }

    console.log('positions', positions);
    

    return positions;
  } catch (error) {
    console.error('Error getting perp positions:', error);
    throw error;
  }
};

// Get open orders for a subaccount
export const getOpenOrders = async (userMap: UserMap, subaccountId: number): Promise<OrderTypeModel[]> => {
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    const orders: OrderTypeModel[] = [];
    for (const order of user.orders) {
      if (order.status === 'open') {
        orders.push({
          orderId: order.orderId.toString(),
          marketIndex: order.marketIndex.toString(),
          price: order.price.toString(),
          baseAssetAmount: order.baseAssetAmount.toString(),
          direction: order.direction === PositionDirection.LONG ? 'LONG' : 'SHORT',
          orderType: order.orderType as string,
          triggerPrice: order.triggerPrice?.toString() || null,
          triggerCondition: order.triggerCondition as string || null,
          timestamp: `${new Date().getTime() - order.auctionDuration}`,
        });
      }
    }

    return orders;
  } catch (error) {
    console.error('Error getting open orders:', error);
    throw error;
  }
};

// Place a market order
export const placeMarketOrder = async (
  driftClient: DriftClient,
  userMap: UserMap,
  subaccountId: number,
  // marketIndex: number,
  // size: number,
  direction: 'LONG' | 'SHORT',
  optionalIxs: TransactionInstruction[],
  params: OrderParams[],
  txParams: TxParams,
): Promise<string> => {
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    // userMap.setActiveUser(subaccountId);

    const txSig = await driftClient.placeOrders(
      params,
      txParams,
      subaccountId,
      optionalIxs
    );

    return txSig;
  } catch (error) {
    console.error('Error placing market order:', error);
    throw error;
  }
};

// Place a limit order
// export const placeLimitOrder = async (
//   driftClient: DriftClient,
//   userMap: UserMap,
//   subaccountId: number,
//   marketIndex: number,
//   size: number,
//   price: number,
//   direction: 'LONG' | 'SHORT'
// ): Promise<string> => {
//   try {
//     const user = getUserAccountBySubaccountId(userMap, subaccountId);
//     if (!user) {
//       throw new Error('Subaccount not found');
//     }

//     // userMap.setActiveUser(subaccountId);

//     const txSig = await driftClient.placeOrder({
//       marketIndex,
//       direction: direction === 'LONG' ? PositionDirection.LONG : PositionDirection.SHORT,
//       orderType: OrderType.LIMIT,
//       baseAssetAmount: size,
//       price,
//       reduceOnly: false,
//     });

//     return txSig;
//   } catch (error) {
//     console.error('Error placing limit order:', error);
//     throw error;
//   }
// };

// Place a take profit order
// export const placeTakeProfitOrder = async (
//   driftClient: DriftClient,
//   userMap: UserMap,
//   subaccountId: number,
//   marketIndex: number,
//   size: number,
//   triggerPrice: number,
//   direction: 'LONG' | 'SHORT'
// ): Promise<string> => {
//   try {
//     const user = getUserAccountBySubaccountId(userMap, subaccountId);
//     if (!user) {
//       throw new Error('Subaccount not found');
//     }

//     // userMap.setActiveUser(subaccountId);

//     // Take profit is in the opposite direction of the position
//     const oppositeDirection = direction === 'LONG' ? PositionDirection.SHORT : PositionDirection.LONG;

//     const txSig = await driftClient.placeOrder({
//       marketIndex,
//       direction: oppositeDirection,
//       orderType: OrderType.TRIGGER_MARKET,
//       baseAssetAmount: size,
//       triggerPrice,
//       triggerCondition: direction === 'LONG' ? OrderTriggerCondition.ABOVE : OrderTriggerCondition.BELOW,
//       reduceOnly: true,
//     });

//     return txSig;
//   } catch (error) {
//     console.error('Error placing take profit order:', error);
//     throw error;
//   }
// };

// // Place a stop loss order
// export const placeStopLossOrder = async (
//   driftClient: DriftClient,
//   userMap: UserMap,
//   subaccountId: number,
//   marketIndex: number,
//   size: number,
//   triggerPrice: number,
//   direction: 'LONG' | 'SHORT'
// ): Promise<string> => {
//   try {
//     const user = userMap.getUserAccount(subaccountId);
//     if (!user) {
//       throw new Error('Subaccount not found');
//     }

//     userMap.setActiveUser(subaccountId);

//     // Stop loss is in the opposite direction of the position
//     const oppositeDirection = direction === 'LONG' ? PositionDirection.SHORT : PositionDirection.LONG;

//     const txSig = await driftClient.placeOrder({
//       marketIndex,
//       direction: oppositeDirection,
//       orderType: OrderType.TRIGGER_MARKET,
//       baseAssetAmount: size,
//       triggerPrice,
//       triggerCondition: direction === 'LONG' ? OrderTriggerCondition.BELOW : OrderTriggerCondition.ABOVE,
//       reduceOnly: true,
//     });

//     return txSig;
//   } catch (error) {
//     console.error('Error placing stop loss order:', error);
//     throw error;
//   }
// };

// // Place scaled orders
// export const placeScaledOrders = async (
//   driftClient: DriftClient,
//   userMap: UserMap,
//   subaccountId: number,
//   marketIndex: number,
//   totalSize: number,
//   startPrice: number,
//   endPrice: number,
//   orderCount: number,
//   direction: 'LONG' | 'SHORT'
// ): Promise<string[]> => {
//   try {
//     const user = userMap.getUserAccount(subaccountId);
//     if (!user) {
//       throw new Error('Subaccount not found');
//     }

//     userMap.setActiveUser(subaccountId);

//     const sizePerOrder = totalSize / orderCount;
//     const priceDelta = (endPrice - startPrice) / (orderCount - 1);

//     const txSigs: string[] = [];

//     for (let i = 0; i < orderCount; i++) {
//       const price = startPrice + (priceDelta * i);

//       const txSig = await driftClient.placeOrder({
//         marketIndex,
//         direction: direction === 'LONG' ? PositionDirection.LONG : PositionDirection.SHORT,
//         orderType: OrderType.LIMIT,
//         baseAssetAmount: sizePerOrder,
//         price,
//         reduceOnly: false,
//       });

//       txSigs.push(txSig);
//     }

//     return txSigs;
//   } catch (error) {
//     console.error('Error placing scaled orders:', error);
//     throw error;
//   }
// };

// Deposit funds to a subaccount
export const depositFunds = async ({
  driftClient,
  userMap,
  subaccountId,
  marketIndex,
  amount,
  associatedTokenAccount,
  subAccountId,
  reduceOnly = false,
  txParams
}: DepositFundPayload
): Promise<string> => {
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    // userMap.setActiveUser(subaccountId);

    const txSig = await driftClient.deposit(
      marketIndex,
      amount,
      associatedTokenAccount,
      subAccountId,
      reduceOnly,
      txParams
    );

    return txSig;
  } catch (error) {
    console.error('Error depositing funds:', error);
    throw error;
  }
};

// Withdraw funds from a subaccount
export const withdrawFunds = async ({
  driftClient,
  userMap,
  subaccountId,
  marketIndex,
  amount,
  associatedTokenAddress,
  reduceOnly = false,
  subAccountId,
  txParams,
  updateFuel = false
}: WithdrawFundPayload
): Promise<string> => {
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    // userMap.setActiveUser(subaccountId);

    const txSig = await driftClient.withdraw(
      amount,
      marketIndex,
      associatedTokenAddress,
      reduceOnly,
      subAccountId,
      txParams,
      updateFuel
    );

    return txSig;
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    throw error;
  }
};