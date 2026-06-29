import React, { createContext, useContext } from 'react';
import { Account, Budget, Transaction } from '../types';

export interface FinanceContextValue {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  refresh: () => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (tx: Transaction) => Promise<void>;
  upsertBudget: (category: string, monthlyLimit: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const FinanceContext = createContext<FinanceContextValue | null>(null);

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
