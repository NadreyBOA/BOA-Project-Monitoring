export type TransactionType = 'credit' | 'payment';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  note: string | null;
  created_at: string;
}

export interface CustomerWithBalance extends Customer {
  balance: number;
  last_activity: string | null;
}

export interface Transaction {
  id: string;
  customer_id: string;
  type: TransactionType;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}
