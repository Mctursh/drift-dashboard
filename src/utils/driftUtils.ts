import { Connection, PublicKey } from '@hermis/solana-headless-core';
import {
  DriftClient,
  initialize,
  BulkAccountLoader,
  UserMap,
  PerpMarkets,
  OrderType,
  PositionDirection,
  User,
  UserAccount,
  OrderParams,
  TxParams,
  BN,
  PerpMarketConfig,
  OrderStatus,
  BASE_PRECISION,
  decodeName,
  convertToNumber,
  PRICE_PRECISION,
  getVariant,
  getOrderParams,
} from '@drift-labs/sdk';
import {
  DriftClientConfig,
  Subaccount,
  SubaccountBalances,
  PerpPosition,
  OrderType as OrderTypeModel,
  DepositFundPayload,
  WithdrawFundPayload,
  PlaceOrderPayload
} from '@/types/drift';
import { TransactionInstruction } from '@solana/web3.js';
import { AnchorWallet } from '@hermis/solana-headless-react';

const MAX_SUBACCOUNTS = 8;

export const initializeDriftClient = async (
  connection: Connection,
  wallet: AnchorWallet
): Promise<DriftClientConfig> => {
  try {

    const sdkConfig = initialize({ env: 'mainnet-beta' });

    const accountLoader = new BulkAccountLoader(
      connection,
      'confirmed',
      10_000 
    );

    const driftClient = new DriftClient({
      connection,
      wallet,
      programID: new PublicKey(sdkConfig.DRIFT_PROGRAM_ID),
      accountSubscription: {
        type: 'websocket',
      },
    });

    const userMap = new UserMap({
      driftClient,
      connection,
      includeIdle: true,
      subscriptionConfig: {
        type: 'websocket',
        commitment: 'confirmed',
      },
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

export const getUserStatsAccount = async (driftClient: DriftClient, publicKey: PublicKey): Promise<string> => {
  
  try {
    const statAccount = driftClient.userStatsAccountPublicKey.toBase58()
    return statAccount;
  } catch (error) {
    console.error('Error getting user stats account:', error);
    throw error;
  }
};

export const getSubaccounts = async (userMap: UserMap): Promise<Subaccount[]> => {
  try {
    const subaccounts: Subaccount[] = [];
    

    const usersIterator = userMap.values();
    
    let index = 0;
    

    for (const userInstance of usersIterator) {
      if (userInstance) {
        try {
      
          const userAccount = userInstance.getUserAccount();
          
      
      
          if (userAccount && 
              userAccount.authority && 
              !userAccount.authority.equals(PublicKey.default) &&
              userAccount.name) {
            
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
    
    for (const user of users) {
      try {
        const account = user.getUserAccount();
        if (account && 
            account.subAccountId === subaccountId && 
            account.authority && 
            !account.authority.equals(PublicKey.default)) {
          return user;
        }
      } catch (err) {
        console.warn("Error accessing user account:", err);
      }
    }
    
    console.warn(`No valid user found for subaccount ID: ${subaccountId}`);
    return null;
  } catch (error) {
    console.error("Error in getUserBySubaccountId:", error);
    return null;
  }
};



export const getUserAccountBySubaccountId = (userMap: UserMap, subaccountId: number): UserAccount | null => {
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

export const getBalances = async (userMap: UserMap, subaccountId: number): Promise<SubaccountBalances> => {
  const tempUser = userMap.driftClient.getUser()
  
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    const balances: SubaccountBalances = {};
    console.log('user', user);
    for (const token of user.spotPositions) {
      if (token.scaledBalance.gt(0)) {
        const tokenName = getMarketInfoByMarketIndex(token.marketIndex)?.symbol;
        balances[tokenName || token.marketIndex.toString()] = {
          token: tokenName || token.marketIndex.toString(),
          balance: token.scaledBalance.toString(),
          value: token.scaledBalance.toString(),
        };
      }
    }

    return balances;
  } catch (error) {
    console.error('Error getting balances:', error);
    throw error;
  }
};

const getMarketInfoByMarketIndex = (marketIndex: number, env: 'mainnet-beta' | 'devnet' = 'mainnet-beta') => {
  return PerpMarkets[env].find(
    (market: PerpMarketConfig) => market.marketIndex === marketIndex
  );
}

export const getPerpPositions = async (userMap: UserMap, subaccountId: number): Promise<PerpPosition[]> => {
  try {

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
      return [];
    }

    let userAccount = null;
    try {
      userAccount = userInstance.getUserAccount();
      console.log("Found user account:", userAccount.subAccountId);
    } catch (err: any) {
      console.error("Error getting user account:", err);
      throw new Error(`Failed to get user account: ${err.message}`);
    }

    if (!userAccount.perpPositions || !Array.isArray(userAccount.perpPositions)) {
      console.warn("User account has no perpPositions array:", userAccount);
      return [];
    }


    const positions: PerpPosition[] = [];

    for (const position of userAccount.perpPositions) {
      try {
        if (!position || !position.marketIndex) continue;

        const hasQuoteAmount = position.quoteAssetAmount &&
          typeof position.quoteAssetAmount.gt === 'function' &&
          position.quoteAssetAmount.gt(0);

        if (!hasQuoteAmount) continue;

        positions.push({
          marketIndex: position.marketIndex.toString(),
          baseAssetAmount: position.baseAssetAmount ? position.baseAssetAmount.toString() : '0',
          quoteAssetAmount: position.quoteAssetAmount ? position.quoteAssetAmount.toString() : '0',
          entryPrice: position.quoteEntryAmount || '0',
          breakEvenPrice: position.quoteBreakEvenAmount || '0',
          pnl: position.settledPnl || '0',
          unrealizedPnl: position.remainderBaseAssetAmount ?
            position.remainderBaseAssetAmount.toString() : '0',
          direction: (position.baseAssetAmount.gt(0)) ? 'LONG' : 'SHORT',
        });
      } catch (posErr) {
        console.warn(`Error processing position at market index ${position?.marketIndex}:`, posErr);
      }
    }

    console.log('positions', positions);


    return positions;
  } catch (error) {
    console.error('Error getting perp positions:', error);
    throw error;
  }
};

export const getOpenOrders = async (userMap: UserMap, subaccountId: number): Promise<OrderTypeModel[]> => {
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    const orders: OrderTypeModel[] = [];
    for (const order of user.orders) {
      if (order.status === OrderStatus.OPEN) {
        orders.push({
          orderId: order.orderId.toString(),
          marketIndex: order.marketIndex.toString(),
          price: order.price.toString(),
          baseAssetAmount: order.baseAssetAmount.toString(),
          direction: order.direction === PositionDirection.LONG ? 'LONG' : 'SHORT',
          orderType: Object.keys(order.orderType)[0] as string,
          triggerPrice: order.triggerPrice?.toString() || null,
          triggerCondition: Object.keys(order.triggerCondition)[0] as string || null,
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

export const placeMarketOrder = async (
  driftClient: DriftClient,
  userMap: UserMap,
  subaccountId: number,
  optionalIxs: TransactionInstruction[],
  params: OrderParams[],
  txParams: TxParams,
): Promise<string> => {
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

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

export const placeLimitOrder = async ({
  driftClient,
  userMap,
  subaccountId,
  marketIndex,
  size,
  price,
  direction,
  orderType
}: PlaceOrderPayload
): Promise<string> => {
  try {
    const user = getUserAccountBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    const orderSize = BASE_PRECISION.mul(new BN(size.toString()));
    const orderDirection = direction === 'LONG' ? PositionDirection.LONG : PositionDirection.SHORT;
    const sdkOrderType = orderType === 'MARKET' ? OrderType.MARKET : OrderType.LIMIT;

    const perpMarket = driftClient.getPerpMarketAccount(marketIndex)!;
    const mktName = decodeName(perpMarket.name);

    const oracle = driftClient.getOracleDataForPerpMarket(marketIndex);

    console.log(`Current oracle price: ${convertToNumber(oracle.price, PRICE_PRECISION)}`);
    console.log(`\nPlacing a ${getVariant(orderDirection)} order for ${convertToNumber(orderSize, BASE_PRECISION)} ${mktName} at $${price ? convertToNumber(price, PRICE_PRECISION) : 'market'}`);

    const tx = await driftClient.placePerpOrder(
      getOrderParams({
        orderType: sdkOrderType,
        marketIndex,
        baseAssetAmount: orderSize,
        direction: orderDirection,
        price,
      }),
      {
        computeUnitsPrice: 1_000,
      }
    );

    console.log(`Place perp order tx: https://solscan.io/tx/${tx}`);
    return tx;
  } catch (error) {
    console.error('Error placing limit order:', error);
    throw error;
  }
};

export const depositFunds = async ({
  driftClient,
  userMap,
  subaccountId,
  marketIndex,
  amount,
  subAccountId,
  reduceOnly = false,
  txParams
}: DepositFundPayload): Promise<string> => {
  try {
    const user = getUserBySubaccountId(userMap, subaccountId);
    if (!user) {
      throw new Error('Subaccount not found');
    }

    if (marketIndex !== 0 && marketIndex !== 1) {
      throw new Error('Only USDC (0) and SOL (1) deposits are supported');
    }

    if (!amount || !(amount instanceof BN)) {
      throw new Error('Invalid amount for deposit');
    }

    const associatedTokenAccount = await driftClient.getAssociatedTokenAccount(marketIndex);

    const txSig = await driftClient.deposit(
      amount,
      marketIndex,
      associatedTokenAccount,
      subAccountId || subaccountId,
      reduceOnly,
      {
        ...txParams,
        computeUnitsPrice: 10_000,
      }
    );

    console.log(`Deposit successful: ${txSig}`);
    return txSig;
  } catch (error) {
    console.error('Error depositing funds:', error);
    throw error;
  }
};

export const withdrawFunds = async ({
  driftClient,
  userMap,
  subaccountId,
  marketIndex,
  amount,
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

    if (marketIndex !== 0 && marketIndex !== 1) {
      throw new Error('Only USDC (0) and SOL (1) withrawals are supported');
    }

    if (!amount || !(amount instanceof BN)) {
      throw new Error('Invalid amount for withdrawal');
    }

    const associatedTokenAccount = await driftClient.getAssociatedTokenAccount(marketIndex);

    const txSig = await driftClient.withdraw(
      amount,
      marketIndex,
      associatedTokenAccount,
      reduceOnly,
      subAccountId,
      {
        ...txParams,
        computeUnitsPrice: 10_000,
      },
      updateFuel
    );

    return txSig;
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    throw error;
  }
};