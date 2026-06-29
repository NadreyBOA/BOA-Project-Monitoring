import { type SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Account, Budget, Transaction } from '../types';

export async function getAccounts(db: SQLiteDatabase): Promise<Account[]> {
  return db.getAllAsync<Account>('SELECT * FROM accounts ORDER BY name');
}

export async function addAccount(
  db: SQLiteDatabase,
  account: Omit<Account, 'id'>
): Promise<void> {
  await db.runAsync(
    'INSERT INTO accounts (id, name, type, balance, color) VALUES (?, ?, ?, ?, ?)',
    uuidv4(),
    account.name,
    account.type,
    account.balance,
    account.color
  );
}

export async function deleteAccount(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM transactions WHERE accountId = ?', id);
  await db.runAsync('DELETE FROM accounts WHERE id = ?', id);
}

export async function getTransactions(db: SQLiteDatabase): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY date DESC');
}

export async function addTransaction(
  db: SQLiteDatabase,
  tx: Omit<Transaction, 'id'>
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO transactions (id, accountId, category, type, amount, note, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      uuidv4(),
      tx.accountId,
      tx.category,
      tx.type,
      tx.amount,
      tx.note,
      tx.date
    );
    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    await db.runAsync('UPDATE accounts SET balance = balance + ? WHERE id = ?', delta, tx.accountId);
  });
}

export async function deleteTransaction(db: SQLiteDatabase, tx: Transaction): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM transactions WHERE id = ?', tx.id);
    const delta = tx.type === 'income' ? -tx.amount : tx.amount;
    await db.runAsync('UPDATE accounts SET balance = balance + ? WHERE id = ?', delta, tx.accountId);
  });
}

export async function getBudgets(db: SQLiteDatabase): Promise<Budget[]> {
  return db.getAllAsync<Budget>('SELECT * FROM budgets ORDER BY category');
}

export async function upsertBudget(
  db: SQLiteDatabase,
  category: string,
  monthlyLimit: number
): Promise<void> {
  await db.runAsync(
    `INSERT INTO budgets (id, category, monthlyLimit) VALUES (?, ?, ?)
     ON CONFLICT(category) DO UPDATE SET monthlyLimit = excluded.monthlyLimit`,
    uuidv4(),
    category,
    monthlyLimit
  );
}

export async function deleteBudget(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM budgets WHERE id = ?', id);
}
