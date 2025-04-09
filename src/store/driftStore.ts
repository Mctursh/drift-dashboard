import { create } from 'zustand';
import { DriftClient, UserMap, PerpMarkets } from '@drift-labs/sdk';
import { DriftClientConfig, ModalStates, OrderFormState } from '@/types/drift';

interface DriftState extends DriftClientConfig, ModalStates, OrderFormState {}

interface DriftActions {
  // Set Drift SDK instances
  setDriftClient: (driftClient: DriftClient | null) => void;
  setUserMap: (userMap: UserMap | null) => void;
//   setUserStatsAccount: (userStatsAccount: string | null) => void;
  
  // Set markets
//   setMarkets: (markets: typeof PerpMarkets[] | null) => void;
  setSelectedMarket: (market: string | null) => void;
  
  // Modal controls
  openDepositModal: () => void;
  closeDepositModal: () => void;
  openWithdrawModal: () => void;
  closeWithdrawModal: () => void;
  openPerpOrderModal: () => void;
  closePerpOrderModal: () => void;
  openTpSlModal: () => void;
  closeTpSlModal: () => void;
  openScaledOrdersModal: () => void;
  closeScaledOrdersModal: () => void;
  
  // Order form actions
  setOrderType: (type: 'MARKET' | 'LIMIT') => void;
  setOrderSize: (size: string) => void;
  setOrderPrice: (price: string) => void;
  setOrderDirection: (direction: 'LONG' | 'SHORT') => void;
  
  // TP/SL form actions
  setTakeProfitPrice: (price: string) => void;
  setStopLossPrice: (price: string) => void;
  
  // Scaled orders actions
  setScaledOrdersCount: (count: number) => void;
  setPriceRangeStart: (price: string) => void;
  setPriceRangeEnd: (price: string) => void;
  setTotalSize: (size: string) => void;
  
  // Reset states
  resetOrderState: () => void;
  resetDriftState: () => void;
}

type DriftStore = DriftState & DriftActions;

const initialState: DriftState = {
  // Drift SDK instances
  driftClient: null,
  userMap: null,
  accountLoader: null,
  markets: null,
//   userStatsAccount: null,
  
  // Modal states
  isDepositModalOpen: false,
  isWithdrawModalOpen: false,
  isPerpOrderModalOpen: false,
  isTpSlModalOpen: false,
  isScaledOrdersModalOpen: false,
  
  // Order form state
  selectedMarket: null,
  orderType: 'MARKET',
  orderSize: '',
  orderPrice: '',
  orderDirection: 'LONG',
  
  // TP/SL form state
  takeProfitPrice: '',
  stopLossPrice: '',
  
  // Scaled orders state
  scaledOrdersCount: 2,
  priceRangeStart: '',
  priceRangeEnd: '',
  totalSize: '',
};

const useDriftStore = create<DriftStore>((set) => ({
  ...initialState,
  
  // Set Drift SDK instances
  setDriftClient: (driftClient: DriftClient | null) => set({ driftClient }),
  setUserMap: (userMap: UserMap | null) => set({ userMap }),
//   setUserStatsAccount: (userStatsAccount: string | null) => set({ userStatsAccount }),
  
  // Set markets
//   setMarkets: (markets: typeof PerpMarkets[] | null) => set({ markets }),
  setSelectedMarket: (market: string | null) => set({ selectedMarket: market }),
  
  // Modal controls
  openDepositModal: () => set({ isDepositModalOpen: true }),
  closeDepositModal: () => set({ isDepositModalOpen: false }),
  openWithdrawModal: () => set({ isWithdrawModalOpen: true }),
  closeWithdrawModal: () => set({ isWithdrawModalOpen: false }),
  openPerpOrderModal: () => set({ isPerpOrderModalOpen: true }),
  closePerpOrderModal: () => set({ isPerpOrderModalOpen: false }),
  openTpSlModal: () => set({ isTpSlModalOpen: true }),
  closeTpSlModal: () => set({ isTpSlModalOpen: false }),
  openScaledOrdersModal: () => set({ isScaledOrdersModalOpen: true }),
  closeScaledOrdersModal: () => set({ isScaledOrdersModalOpen: false }),
  
  // Order form actions
  setOrderType: (type: 'MARKET' | 'LIMIT') => set({ orderType: type }),
  setOrderSize: (size: string) => set({ orderSize: size }),
  setOrderPrice: (price: string) => set({ orderPrice: price }),
  setOrderDirection: (direction: 'LONG' | 'SHORT') => set({ orderDirection: direction }),
  
  // TP/SL form actions
  setTakeProfitPrice: (price: string) => set({ takeProfitPrice: price }),
  setStopLossPrice: (price: string) => set({ stopLossPrice: price }),
  
  // Scaled orders actions
  setScaledOrdersCount: (count: number) => set({ scaledOrdersCount: count }),
  setPriceRangeStart: (price: string) => set({ priceRangeStart: price }),
  setPriceRangeEnd: (price: string) => set({ priceRangeEnd: price }),
  setTotalSize: (size: string) => set({ totalSize: size }),
  
  // Reset order state
  resetOrderState: () => set({
    orderType: 'MARKET',
    orderSize: '',
    orderPrice: '',
    orderDirection: 'LONG',
    takeProfitPrice: '',
    stopLossPrice: '',
    scaledOrdersCount: 2,
    priceRangeStart: '',
    priceRangeEnd: '',
    totalSize: '',
  }),
  
  // Reset Drift state
  resetDriftState: () => set({
    driftClient: null,
    userMap: null,
    // userStatsAccount: null,
    markets: null,
    selectedMarket: null,
  }),
}));

export default useDriftStore;