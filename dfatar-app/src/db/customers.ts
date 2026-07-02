import type { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../utils/id';
import type { Customer, CustomerWithBalance } from '../types';

const BALANCE_SELECT = `
  SELECT
    c.id, c.name, c.phone, c.address, c.note, c.currency, c.created_at,
    COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END), 0) AS balance,
    MAX(t.date) AS last_activity
  FROM customers c
  LEFT JOIN transactions t ON t.customer_id = c.id
`;

export async function listCustomersWithBalance(db: SQLiteDatabase): Promise<CustomerWithBalance[]> {
  return db.getAllAsync<CustomerWithBalance>(
    `${BALANCE_SELECT} GROUP BY c.id ORDER BY balance DESC, c.name ASC`
  );
}

export async function countCustomers(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM customers');
  return row?.count ?? 0;
}

export async function totalDue(db: SQLiteDatabase): Promise<number> {
  const rows = await listCustomersWithBalance(db);
  return rows.reduce((sum, row) => sum + Math.max(row.balance, 0), 0);
}

export async function getCustomerWithBalance(
  db: SQLiteDatabase,
  id: string
): Promise<CustomerWithBalance | null> {
  const row = await db.getFirstAsync<CustomerWithBalance>(
    `${BALANCE_SELECT} WHERE c.id = ? GROUP BY c.id`,
    [id]
  );
  return row ?? null;
}

export async function createCustomer(
  db: SQLiteDatabase,
  input: { name: string; phone: string | null; address: string | null; note: string | null }
): Promise<string> {
  const id = generateId();
  await db.runAsync(
    'INSERT INTO customers (id, name, phone, address, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [
      id,
      input.name.trim(),
      input.phone?.trim() || null,
      input.address?.trim() || null,
      input.note?.trim() || null,
      new Date().toISOString(),
    ]
  );
  return id;
}

export async function updateCustomer(
  db: SQLiteDatabase,
  id: string,
  input: { name: string; phone: string | null; address: string | null; note: string | null }
): Promise<void> {
  await db.runAsync('UPDATE customers SET name = ?, phone = ?, address = ?, note = ? WHERE id = ?', [
    input.name.trim(),
    input.phone?.trim() || null,
    input.address?.trim() || null,
    input.note?.trim() || null,
    id,
  ]);
}

export async function deleteCustomer(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM transactions WHERE customer_id = ?', [id]);
  await db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
}

export async function getCustomer(db: SQLiteDatabase, id: string): Promise<Customer | null> {
  const row = await db.getFirstAsync<Customer>('SELECT * FROM customers WHERE id = ?', [id]);
  return row ?? null;
}
