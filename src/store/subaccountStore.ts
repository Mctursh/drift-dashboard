import { create } from 'zustand';
import { Subaccount, SubaccountBalances, PerpPosition, OrderType } from '@/types/drift';

interface SubaccountState {
  // User subaccounts
  subaccounts: Subaccount[];
  selectedSubaccountIndex: number;
  
  // Selected subaccount data
  balances: SubaccountBalances;
  positions: PerpPosition[];
  orders: OrderType[];
  
  // Loading states
  loading: boolean;
  balancesLoading: boolean;
  positionsLoading: boolean;
  ordersLoading: boolean;
}

interface SubaccountActions {
  // Actions
  setSubaccounts: (subaccounts: Subaccount[]) => void;
  setSelectedSubaccountIndex: (index: number) => void;
  
  setBalances: (balances: SubaccountBalances) => void;
  setPositions: (positions: PerpPosition[]) => void;
  setOrders: (orders: OrderType[]) => void;
  
  setLoading: (loading: boolean) => void;
  setBalancesLoading: (loading: boolean) => void;
  setPositionsLoading: (loading: boolean) => void;
  setOrdersLoading: (loading: boolean) => void;
  
  // Getters
  getSelectedSubaccount: () => Subaccount | null;
  
  // Reset subaccount state
  resetSubaccountState: () => void;
}

type SubaccountStore = SubaccountState & SubaccountActions;

const initialState: SubaccountState = {
  subaccounts: [],
  selectedSubaccountIndex: 0,
  balances: {},
  positions: [],
  orders: [],
  loading: false,
  balancesLoading: false,
  positionsLoading: false,
  ordersLoading: false,
};

const useSubaccountStore = create<SubaccountStore>((set, get) => ({
  ...initialState,
  
  // Actions
  setSubaccounts: (subaccounts: Subaccount[]) => set({ subaccounts }),
  setSelectedSubaccountIndex: (index: number) => set({ selectedSubaccountIndex: index }),
  
  setBalances: (balances: SubaccountBalances) => set({ balances }),
  setPositions: (positions: PerpPosition[]) => set({ positions }),
  setOrders: (orders: OrderType[]) => set({ orders }),
  
  setLoading: (loading: boolean) => set({ loading }),
  setBalancesLoading: (loading: boolean) => set({ balancesLoading: loading }),
  setPositionsLoading: (loading: boolean) => set({ positionsLoading: loading }),
  setOrdersLoading: (loading: boolean) => set({ ordersLoading: loading }),
  
  // Getters
  getSelectedSubaccount: () => {
    const { subaccounts, selectedSubaccountIndex } = get();
    return subaccounts[selectedSubaccountIndex] || null;
  },
  
  // Reset subaccount state
  resetSubaccountState: () => set({
    subaccounts: [],
    selectedSubaccountIndex: 0,
    balances: {},
    positions: [],
    orders: [],
  }),
}));

export default useSubaccountStore;