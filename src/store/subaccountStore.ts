import { create } from 'zustand';
import { Subaccount, SubaccountBalances, PerpPosition, OrderType } from '@/types/drift';

interface SubaccountState {
  subaccounts: Subaccount[];
  selectedSubaccountIndex: number;
  
  balances: SubaccountBalances;
  positions: PerpPosition[];
  orders: OrderType[];
  
  loading: boolean;
  balancesLoading: boolean;
  positionsLoading: boolean;
  ordersLoading: boolean;
}

interface SubaccountActions {
  setSubaccounts: (subaccounts: Subaccount[]) => void;
  setSelectedSubaccountIndex: (index: number) => void;
  
  setBalances: (balances: SubaccountBalances) => void;
  setPositions: (positions: PerpPosition[]) => void;
  setOrders: (orders: OrderType[]) => void;
  
  setLoading: (loading: boolean) => void;
  setBalancesLoading: (loading: boolean) => void;
  setPositionsLoading: (loading: boolean) => void;
  setOrdersLoading: (loading: boolean) => void;
  
  getSelectedSubaccount: () => Subaccount | null;
  
  resetSubaccountState: () => void;
}

type SubaccountStore = SubaccountState & SubaccountActions;

const initialState: SubaccountState = {
  subaccounts: [],
  selectedSubaccountIndex: 0,
  balances: {},
  positions: [],
  orders: [],
  loading: true,
  balancesLoading: false,
  positionsLoading: false,
  ordersLoading: false,
};

const useSubaccountStore = create<SubaccountStore>((set, get) => ({
  ...initialState,
  
  setSubaccounts: (subaccounts: Subaccount[]) => set({ subaccounts }),
  setSelectedSubaccountIndex: (index: number) => set({ selectedSubaccountIndex: index }),
  
  setBalances: (balances: SubaccountBalances) => set({ balances }),
  setPositions: (positions: PerpPosition[]) => set({ positions }),
  setOrders: (orders: OrderType[]) => set({ orders }),
  
  setLoading: (loading: boolean) => set({ loading }),
  setBalancesLoading: (loading: boolean) => set({ balancesLoading: loading }),
  setPositionsLoading: (loading: boolean) => set({ positionsLoading: loading }),
  setOrdersLoading: (loading: boolean) => set({ ordersLoading: loading }),
  
  getSelectedSubaccount: () => {
    const { subaccounts, selectedSubaccountIndex } = get();
    return subaccounts[selectedSubaccountIndex] || null;
  },
  
  resetSubaccountState: () => set({
    subaccounts: [],
    selectedSubaccountIndex: 0,
    balances: {},
    positions: [],
    orders: [],
  }),
}));

export default useSubaccountStore;