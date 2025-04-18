import { DriftClient, UserMap, PerpMarkets, BulkAccountLoader, TxParams, User, BN } from '@drift-labs/sdk';
import { PublicKey } from '@solana/web3.js';

export interface DriftClientConfig {
  driftClient: DriftClient | null;
  userMap?: UserMap | null;
  user?: User | null;
  accountLoader: BulkAccountLoader | null;
  markets: typeof PerpMarkets | null;
}

export interface Subaccount {
  id: number;
  name: string;
  authority: string;
  subAccountId: number;
  delegate: string;
}

export interface TokenBalance {
  token: string;
  balance: string;
  value: string;
}

export interface SubaccountBalances {
  [token: string]: TokenBalance;
}

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

export interface ModalStates {
  isDepositModalOpen: boolean;
  isWithdrawModalOpen: boolean;
  isPerpOrderModalOpen: boolean;
  isTpSlModalOpen: boolean;
  isScaledOrdersModalOpen: boolean;
  isWalletLookupModalOpen: boolean;
}

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

export interface ScaledOrderSummary {
  orderNum: number;
  price: string;
  size: string;
}

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
  subAccountId?: number,
  reduceOnly?: boolean,
  txParams?: TxParams
}

export interface WithdrawFundPayload {
  driftClient: DriftClient,
  userMap: UserMap,
  subaccountId: number,
  marketIndex: number,
  amount: BN,
  subAccountId?: number,
  reduceOnly?: boolean,
  txParams?: TxParams,
  updateFuel?: boolean
}

export interface PlaceOrderPayload {
  driftClient: DriftClient,
  userMap: UserMap,
  subaccountId: number,
  marketIndex: number,
  size: BN,
  price?: BN,
  direction: 'LONG' | 'SHORT',
  orderType: 'MARKET' | 'LIMIT',
}