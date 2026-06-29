import React from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { FinanceContext } from './FinanceContext';
import { useFinanceState } from './useFinanceState';
import * as queries from '../db/queries';

export function SqliteFinanceProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const value = useFinanceState({
    getAccounts: () => queries.getAccounts(db),
    getTransactions: () => queries.getTransactions(db),
    getBudgets: () => queries.getBudgets(db),
    addAccount: (a) => queries.addAccount(db, a),
    deleteAccount: (id) => queries.deleteAccount(db, id),
    addTransaction: (t) => queries.addTransaction(db, t),
    deleteTransaction: (t) => queries.deleteTransaction(db, t),
    upsertBudget: (c, l) => queries.upsertBudget(db, c, l),
    deleteBudget: (id) => queries.deleteBudget(db, id),
  });

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
