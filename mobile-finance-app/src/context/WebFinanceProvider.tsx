import React from 'react';
import { FinanceContext } from './FinanceContext';
import { useFinanceState } from './useFinanceState';
import * as webStore from '../db/webStore';

export function WebFinanceProvider({ children }: { children: React.ReactNode }) {
  const value = useFinanceState(webStore);
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
