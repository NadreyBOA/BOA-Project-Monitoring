import { v4 as uuidv4 } from 'uuid';
import { Account, Budget, Transaction } from '../types';

const STORAGE_KEY = 'finance-app-data-v1';

interface StoreShape {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
}

function load(): StoreShape {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore malformed storage
  }
  return { accounts: [], transactions: [], budgets: [] };
}

function save(data: StoreShape) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function getAccounts(): Promise<Account[]> {
  return [...load().accounts].sort((a, b) => a.name.localeCompare(b.name));
}

export async function addAccount(account: Omit<Account, 'id'>): Promise<void> {
  const data = load();
  data.accounts.push({ ...account, id: uuidv4() });
  save(data);
}

export async function deleteAccount(id: string): Promise<void> {
  const data = load();
  data.accounts = data.accounts.filter((a) => a.id !== id);
  data.transactions = data.transactions.filter((t) => t.accountId !== id);
  save(data);
}

export async function getTransactions(): Promise<Transaction[]> {
  return [...load().transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function addTransaction(tx: Omit<Transaction, 'id'>): Promise<void> {
  const data = load();
  data.transactions.push({ ...tx, id: uuidv4() });
  const account = data.accounts.find((a) => a.id === tx.accountId);
  if (account) {
    account.balance += tx.type === 'income' ? tx.amount : -tx.amount;
  }
  save(data);
}

export async function deleteTransaction(tx: Transaction): Promise<void> {
  const data = load();
  data.transactions = data.transactions.filter((t) => t.id !== tx.id);
  const account = data.accounts.find((a) => a.id === tx.accountId);
  if (account) {
    account.balance += tx.type === 'income' ? -tx.amount : tx.amount;
  }
  save(data);
}

export async function getBudgets(): Promise<Budget[]> {
  return [...load().budgets].sort((a, b) => a.category.localeCompare(b.category));
}

export async function upsertBudget(category: string, monthlyLimit: number): Promise<void> {
  const data = load();
  const existing = data.budgets.find((b) => b.category === category);
  if (existing) {
    existing.monthlyLimit = monthlyLimit;
  } else {
    data.budgets.push({ id: uuidv4(), category, monthlyLimit });
  }
  save(data);
}

export async function deleteBudget(id: string): Promise<void> {
  const data = load();
  data.budgets = data.budgets.filter((b) => b.id !== id);
  save(data);
}
