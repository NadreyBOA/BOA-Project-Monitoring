import type { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../utils/id';
import type { Transaction, TransactionType } from '../types';

export async function listTransactionsForCustomer(
  db: SQLiteDatabase,
  customerId: string
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC, created_at DESC',
    [customerId]
  );
}

export async function createTransaction(
  db: SQLiteDatabase,
  input: {
    customerId: string;
    type: TransactionType;
    amount: number;
    date: string;
    note: string | null;
    dueDate?: string | null;
    notificationId?: string | null;
  }
): Promise<string> {
  const id = generateId();
  await db.runAsync(
    'INSERT INTO transactions (id, customer_id, type, amount, date, note, due_date, notification_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      input.customerId,
      input.type,
      input.amount,
      input.date,
      input.note?.trim() || null,
      input.dueDate || null,
      input.notificationId || null,
      new Date().toISOString(),
    ]
  );
  return id;
}

export async function deleteTransaction(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}
