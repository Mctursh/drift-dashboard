import { ReactNode } from 'react';
import { Subaccount, TokenBalance, PerpPosition, OrderType } from './drift';
import { WalletAdapterNetwork } from '@hermis/solana-headless-react';

// Component props
export interface SolanaProviderProps {
  children: ReactNode;
  // network: WalletAdapterNetwork;
}

export interface SubaccountListProps {
  subaccounts: Subaccount[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  loading: boolean;
}

export interface BalanceViewProps {
  balances: {
    [token: string]: TokenBalance;
  };
  loading: boolean;
}

export interface PositionsViewProps {
  positions: PerpPosition[];
  loading: boolean;
}

export interface OrdersViewProps {
  orders: OrderType[];
  loading: boolean;
}

export interface PerpOrderFormProps {
  isModal?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export interface ButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
}

export interface InputProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  label?: string;
  error?: string;
}

export interface SelectProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  className?: string;
  label?: string;
  required?: boolean;
}

export interface TabProps {
  tabs: {
    id: string;
    label: string;
    icon?: ReactNode;
  }[];
  activeTab: string;
  onChange: (id: string) => void;
}