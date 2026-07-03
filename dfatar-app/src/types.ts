export type TransactionType = 'credit' | 'payment';

export type AccountType = 'pro' | 'particulier';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
  currency: string;
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
  due_date: string | null;
  notification_id: string | null;
  created_at: string;
}
