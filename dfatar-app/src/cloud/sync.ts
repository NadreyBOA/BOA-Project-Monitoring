import type { SQLiteDatabase } from 'expo-sqlite';
import { supabase } from './supabase';
import { setSetting, SETTINGS_KEYS } from '../db/settings';

interface SpaceRow {
  id: string;
  name: string;
  account_type: string;
  created_at: string;
}

interface CustomerRow {
  id: string;
  space_id: string | null;
  name: string;
  phone: string | null;
  note: string | null;
  currency: string | null;
  address: string | null;
  created_at: string;
}

interface TransactionRow {
  id: string;
  customer_id: string;
  type: string;
  amount: number;
  date: string;
  note: string | null;
  due_date: string | null;
  notification_id: string | null;
  payment_channel: string | null;
  created_at: string;
}

interface TransactionEditRow {
  id: string;
  transaction_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  reason_other: string | null;
  created_at: string;
}

interface SettingRow {
  key: string;
  value: string;
}

export async function hasLocalData(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM customers');
  return (row?.count ?? 0) > 0;
}

export async function cloudHasData(userId: string): Promise<boolean> {
  const { count } = await supabase.from('backup_customers').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  return (count ?? 0) > 0;
}

export async function pushAllToCloud(db: SQLiteDatabase, userId: string): Promise<void> {
  const [spaces, customers, transactions, edits, settings] = await Promise.all([
    db.getAllAsync<SpaceRow>('SELECT * FROM spaces'),
    db.getAllAsync<CustomerRow>('SELECT * FROM customers'),
    db.getAllAsync<TransactionRow>('SELECT * FROM transactions'),
    db.getAllAsync<TransactionEditRow>('SELECT * FROM transaction_edits'),
    db.getAllAsync<SettingRow>('SELECT * FROM settings'),
  ]);

  if (spaces.length) {
    const { error } = await supabase.from('backup_spaces').upsert(spaces.map((s) => ({ ...s, user_id: userId })));
    if (error) throw error;
  }
  if (customers.length) {
    const { error } = await supabase.from('backup_customers').upsert(customers.map((c) => ({ ...c, user_id: userId })));
    if (error) throw error;
  }
  if (transactions.length) {
    const { error } = await supabase.from('backup_transactions').upsert(transactions.map((t) => ({ ...t, user_id: userId })));
    if (error) throw error;
  }
  if (edits.length) {
    const { error } = await supabase.from('backup_transaction_edits').upsert(edits.map((e) => ({ ...e, user_id: userId })));
    if (error) throw error;
  }
  if (settings.length) {
    const { error } = await supabase.from('backup_settings').upsert(settings.map((s) => ({ ...s, user_id: userId })));
    if (error) throw error;
  }

  await setSetting(db, SETTINGS_KEYS.lastBackupAt, new Date().toISOString());
}

export async function pullAllFromCloud(db: SQLiteDatabase, userId: string): Promise<void> {
  const [spacesRes, customersRes, transactionsRes, editsRes, settingsRes] = await Promise.all([
    supabase.from('backup_spaces').select('*').eq('user_id', userId),
    supabase.from('backup_customers').select('*').eq('user_id', userId),
    supabase.from('backup_transactions').select('*').eq('user_id', userId),
    supabase.from('backup_transaction_edits').select('*').eq('user_id', userId),
    supabase.from('backup_settings').select('*').eq('user_id', userId),
  ]);

  const spaces = (spacesRes.data ?? []) as SpaceRow[];
  const customers = (customersRes.data ?? []) as CustomerRow[];
  const transactions = (transactionsRes.data ?? []) as TransactionRow[];
  const edits = (editsRes.data ?? []) as TransactionEditRow[];
  const settings = (settingsRes.data ?? []) as SettingRow[];

  await db.withTransactionAsync(async () => {
    for (const s of spaces) {
      await db.runAsync(
        `INSERT INTO spaces (id, name, account_type, created_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, account_type = excluded.account_type`,
        [s.id, s.name, s.account_type, s.created_at]
      );
    }
    for (const c of customers) {
      await db.runAsync(
        `INSERT INTO customers (id, name, phone, note, currency, address, space_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, phone = excluded.phone, note = excluded.note,
           currency = excluded.currency, address = excluded.address, space_id = excluded.space_id`,
        [c.id, c.name, c.phone, c.note, c.currency, c.address, c.space_id, c.created_at]
      );
    }
    for (const t of transactions) {
      await db.runAsync(
        `INSERT INTO transactions (id, customer_id, type, amount, date, note, due_date, notification_id, payment_channel, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET type = excluded.type, amount = excluded.amount, date = excluded.date,
           note = excluded.note, due_date = excluded.due_date, payment_channel = excluded.payment_channel`,
        [t.id, t.customer_id, t.type, t.amount, t.date, t.note, t.due_date, t.notification_id, t.payment_channel, t.created_at]
      );
    }
    for (const e of edits) {
      await db.runAsync(
        `INSERT INTO transaction_edits (id, transaction_id, field, old_value, new_value, reason, reason_other, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO NOTHING`,
        [e.id, e.transaction_id, e.field, e.old_value, e.new_value, e.reason, e.reason_other, e.created_at]
      );
    }
    for (const s of settings) {
      await db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [s.key, s.value]
      );
    }
  });

  await setSetting(db, SETTINGS_KEYS.lastBackupAt, new Date().toISOString());
}
