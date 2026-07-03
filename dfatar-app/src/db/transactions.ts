import type { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../utils/id';
import type { Transaction, TransactionEdit, TransactionType } from '../types';

export async function listTransactionsForCustomer(
  db: SQLiteDatabase,
  customerId: string
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC, created_at DESC',
    [customerId]
  );
}

export async function getTransaction(db: SQLiteDatabase, id: string): Promise<Transaction | null> {
  const row = await db.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
  return row ?? null;
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
    paymentChannel?: string | null;
  }
): Promise<string> {
  const id = generateId();
  await db.runAsync(
    'INSERT INTO transactions (id, customer_id, type, amount, date, note, due_date, notification_id, payment_channel, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      input.customerId,
      input.type,
      input.amount,
      input.date,
      input.note?.trim() || null,
      input.dueDate || null,
      input.notificationId || null,
      input.paymentChannel || null,
      new Date().toISOString(),
    ]
  );
  return id;
}

export async function deleteTransaction(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

async function logTransactionEdit(
  db: SQLiteDatabase,
  input: {
    transactionId: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
    reason?: string | null;
    reasonOther?: string | null;
  }
): Promise<void> {
  const id = generateId();
  await db.runAsync(
    'INSERT INTO transaction_edits (id, transaction_id, field, old_value, new_value, reason, reason_other, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      input.transactionId,
      input.field,
      input.oldValue,
      input.newValue,
      input.reason ?? null,
      input.reasonOther ?? null,
      new Date().toISOString(),
    ]
  );
}

export async function listTransactionEdits(db: SQLiteDatabase, transactionId: string): Promise<TransactionEdit[]> {
  return db.getAllAsync<TransactionEdit>(
    'SELECT * FROM transaction_edits WHERE transaction_id = ? ORDER BY created_at DESC',
    [transactionId]
  );
}

export async function updateTransactionAmount(
  db: SQLiteDatabase,
  transaction: Transaction,
  newAmount: number
): Promise<void> {
  if (newAmount === transaction.amount) return;
  await db.runAsync('UPDATE transactions SET amount = ? WHERE id = ?', [newAmount, transaction.id]);
  await logTransactionEdit(db, {
    transactionId: transaction.id,
    field: 'amount',
    oldValue: String(transaction.amount),
    newValue: String(newAmount),
  });
}

export async function updateTransactionDueDate(
  db: SQLiteDatabase,
  transaction: Transaction,
  newDueDate: string | null,
  reason: string,
  reasonOther: string | null
): Promise<void> {
  if (newDueDate === transaction.due_date) return;
  await db.runAsync('UPDATE transactions SET due_date = ? WHERE id = ?', [newDueDate, transaction.id]);
  await logTransactionEdit(db, {
    transactionId: transaction.id,
    field: 'due_date',
    oldValue: transaction.due_date,
    newValue: newDueDate,
    reason,
    reasonOther,
  });
}

export async function updateTransactionDate(
  db: SQLiteDatabase,
  transaction: Transaction,
  newDate: string
): Promise<void> {
  if (newDate === transaction.date) return;
  await db.runAsync('UPDATE transactions SET date = ? WHERE id = ?', [newDate, transaction.id]);
  await logTransactionEdit(db, {
    transactionId: transaction.id,
    field: 'date',
    oldValue: transaction.date,
    newValue: newDate,
  });
}

export async function updateTransactionChannel(
  db: SQLiteDatabase,
  transaction: Transaction,
  newChannel: string | null
): Promise<void> {
  if (newChannel === transaction.payment_channel) return;
  await db.runAsync('UPDATE transactions SET payment_channel = ? WHERE id = ?', [newChannel, transaction.id]);
  await logTransactionEdit(db, {
    transactionId: transaction.id,
    field: 'channel',
    oldValue: transaction.payment_channel,
    newValue: newChannel,
  });
}

export async function updateTransactionNote(
  db: SQLiteDatabase,
  transaction: Transaction,
  newNote: string
): Promise<void> {
  const normalized = newNote.trim() || null;
  if (normalized === transaction.note) return;
  await db.runAsync('UPDATE transactions SET note = ? WHERE id = ?', [normalized, transaction.id]);
  await logTransactionEdit(db, {
    transactionId: transaction.id,
    field: 'note',
    oldValue: transaction.note,
    newValue: normalized,
  });
}
