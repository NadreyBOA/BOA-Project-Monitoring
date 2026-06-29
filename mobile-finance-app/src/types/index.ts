export type AccountType = 'checking' | 'savings' | 'cash' | 'credit';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  accountId: string;
  category: string;
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
}

export const EXPENSE_CATEGORIES = [
  'Alimentation',
  'Logement',
  'Transport',
  'Loisirs',
  'Santé',
  'Shopping',
  'Factures',
  'Autres',
];

export const INCOME_CATEGORIES = ['Salaire', 'Freelance', 'Cadeau', 'Investissement', 'Autres'];

export const ACCOUNT_COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#0891b2'];
