import { useCallback, useEffect, useState } from 'react';
import { Account, Budget, Transaction } from '../types';
import { FinanceContextValue } from './FinanceContext';

export interface FinanceOps {
  getAccounts: () => Promise<Account[]>;
  getTransactions: () => Promise<Transaction[]>;
  getBudgets: () => Promise<Budget[]>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (tx: Transaction) => Promise<void>;
  upsertBudget: (category: string, monthlyLimit: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export function useFinanceState(ops: FinanceOps): FinanceContextValue {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [a, t, b] = await Promise.all([
      ops.getAccounts(),
      ops.getTransactions(),
      ops.getBudgets(),
    ]);
    setAccounts(a);
    setTransactions(t);
    setBudgets(b);
  }, [ops]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return {
    accounts,
    transactions,
    budgets,
    loading,
    refresh,
    addAccount: async (account) => {
      await ops.addAccount(account);
      await refresh();
    },
    deleteAccount: async (id) => {
      await ops.deleteAccount(id);
      await refresh();
    },
    addTransaction: async (tx) => {
      await ops.addTransaction(tx);
      await refresh();
    },
    deleteTransaction: async (tx) => {
      await ops.deleteTransaction(tx);
      await refresh();
    },
    upsertBudget: async (category, monthlyLimit) => {
      await ops.upsertBudget(category, monthlyLimit);
      await refresh();
    },
    deleteBudget: async (id) => {
      await ops.deleteBudget(id);
      await refresh();
    },
  };
}
