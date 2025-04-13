import { DriftClient, UserMap, PerpMarkets, BulkAccountLoader, TxParams, User, BN } from '@drift-labs/sdk';
import { PublicKey } from '@solana/web3.js';

// Main Drift client interfaces
export interface DriftClientConfig {
  driftClient: DriftClient | null;
  userMap?: UserMap | null;
  user?: User | null;
  accountLoader: BulkAccountLoader | null;
  markets: typeof PerpMarkets | null;
  //   userStatsAccount: string | null;
}

// Subaccount structures
export interface Subaccount {
  id: number;
  name: string;
  authority: string;
  subAccountId: number;
  delegate: string;
}

// Balance structures
export interface TokenBalance {
  token: string;
  balance: string;
  value: string;
}

export interface SubaccountBalances {
  [token: string]: TokenBalance;
}

// Position structures
export interface PerpPosition {
  marketIndex: string;
  baseAssetAmount: string;
  quoteAssetAmount: string;
  entryPrice: string;
  breakEvenPrice: string;
  pnl: string;
  unrealizedPnl: string;
  direction: 'LONG' | 'SHORT';
}

// Order structures
export interface OrderType {
  marketIndex: string;
  orderId: string;
  price: string;
  baseAssetAmount: string;
  direction: 'LONG' | 'SHORT';
  orderType: string;
  triggerPrice: string | null;
  triggerCondition: string | null;
  timestamp: string;
}

// Modal states
export interface ModalStates {
  isDepositModalOpen: boolean;
  isWithdrawModalOpen: boolean;
  isPerpOrderModalOpen: boolean;
  isTpSlModalOpen: boolean;
  isScaledOrdersModalOpen: boolean;
  isWalletLookupModalOpen: boolean;
}

// Order form states
export interface OrderFormState {
  selectedMarket: string | null;
  orderType: 'MARKET' | 'LIMIT';
  orderSize: string;
  orderPrice: string;
  orderDirection: 'LONG' | 'SHORT';
  takeProfitPrice: string;
  stopLossPrice: string;
  scaledOrdersCount: number;
  priceRangeStart: string;
  priceRangeEnd: string;
  totalSize: string;
}

// Scaled order summary
export interface ScaledOrderSummary {
  orderNum: number;
  price: string;
  size: string;
}

// Transaction response
export interface TransactionResponse {
  txid: string;
  status: 'success' | 'error';
  message?: string;
}

export interface DepositFundPayload {
  driftClient: DriftClient,
  userMap: UserMap,
  subaccountId: number,
  marketIndex: number,
  amount: BN,
  // associatedTokenAccount: PublicKey,
  subAccountId?: number,
  reduceOnly?: boolean,
  txParams?: TxParams
}

export interface WithdrawFundPayload {
  driftClient: DriftClient,
  userMap: UserMap,
  subaccountId: number,
  marketIndex: number,
  amount: number,
  associatedTokenAddress: PublicKey,
  subAccountId?: number,
  reduceOnly?: boolean,
  txParams?: TxParams,
  updateFuel?: boolean
}