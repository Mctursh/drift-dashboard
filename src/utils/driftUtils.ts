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

const heliusRPC = ""
const MAX_SUBACCOUNTS = 8;

// Initialize Drift client
export const initializeDriftClient = async (publicKey: PublicKey): Promise<DriftClientConfig> => {
  try {
    // Create a connection to Solana
    const connection = new Connection(heliusRPC, 'confirmed');

    // Create a wallet instance
    const wallet = {
      publicKey,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any) => txs,
    };

    // Create a bulk account loader
    const accountLoader = new BulkAccountLoader(
      connection,
      'confirmed',
      10_000
    );

    // Initialize the Drift client
    const driftPublicKey = "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH";
    // const driftPublicKey = MAINNET_CONFIG.DRIFT_PROGRAM_ID;

    const driftClient = new DriftClient({
      // const driftClient = initialize({
      env: 'mainnet-beta',
      connection,
      wallet: wallet,
      programID: new PublicKey(driftPublicKey),
      activeSubAccountId: 0,
      subAccountIds: [0, 1, 2, 3, 4, 5, 6, 7],
      authority: publicKey,
      accountSubscription: {
        type: 'polling',
        accountLoader,
      },
    });

    // Initialize the UserMap to track users
    const userMap = new UserMap({
      driftClient,
      connection,
      subscriptionConfig: {
        type: 'polling',
        frequency: 5000,
        commitment: 'confirmed',
      },
      //   activeSubAccountId: 0,
      //   subAccountIds: [0, 1, 2, 3, 4, 5, 6, 7],
      //   authority: publicKey,
    });

    await userMap.subscribe();

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

// Get subaccounts for a wallet
export const getSubaccounts = async (userMap: UserMap): Promise<Subaccount[]> => {
  try {
    const subaccounts: Subaccount[] = [];
    const users = userMap.values()
    for (let i = 0; i < MAX_SUBACCOUNTS; i++) {
      const user = users.next().value
      // const user = await userMap.mustGetUserAccount(i);
      if (user) {
        subaccounts.push({
          id: i,
          name: `Subaccount ${i}`,
          authority: user.authority.toString(),
          subAccountId: user.subAccountId,
          delegate: user.delegate.toString(),
        });
      }
    }
    return subaccounts;
  } catch (error) {
    console.error('Error getting subaccounts:', error);
    throw error;
  }
};

export const getUserBySubaccountId = (userMap: UserMap, subaccountId: number): User | undefined => {
  for (const user of userMap.values()) {
    if (user.getUserAccount().subAccountId === subaccountId) {
      return user;
    }
  }
  return undefined;
}

export const getUserAccountBySubaccountId = (userMap: UserMap, subaccountId: number): UserAccount | undefined => {
  const user = getUserBySubaccountId(userMap, subaccountId);
  return user ? user.getUserAccount() : undefined;
}

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

// Get perp positions for a subaccount
export const getPerpPositions = async (userMap: UserMap, subaccountId: number): Promise<PerpPosition[]> => {
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    const positions: PerpPosition[] = [];
    for (const position of user.perpPositions) {
      if (position.baseAssetAmount.gt(0) || position.quoteAssetAmount.gt(0)) {
        positions.push({
          marketIndex: position.marketIndex.toString(),
          baseAssetAmount: position.baseAssetAmount.toString(),
          quoteAssetAmount: position.quoteAssetAmount.toString(),
          entryPrice: position.quoteEntryAmount,
          // entryPrice: position.entryPrice?.toString() || '0',
          breakEvenPrice: position.quoteBreakEvenAmount,
          // breakEvenPrice: position.breakEvenPrice?.toString() || '0',
          pnl: position.settledPnl,
          // pnl: position.pnl?.toString() || '0',
          unrealizedPnl: position.remainderBaseAssetAmount.toString(),
          // unrealizedPnl: position.unrealizedPnl?.toString() || '0',
          direction: position.baseAssetAmount.gt(0) ? 'LONG' : 'SHORT',
        });
      }
    }

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
export const withdrawFunds = async({
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