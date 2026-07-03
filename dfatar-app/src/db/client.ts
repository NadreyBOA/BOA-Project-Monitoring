import type { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../utils/id';

export const DATABASE_NAME = 'dfatar.db';

const DATABASE_VERSION = 4;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        note TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('credit', 'payment')),
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.execAsync(`
      ALTER TABLE customers ADD COLUMN currency TEXT NOT NULL DEFAULT 'MAD';
      ALTER TABLE customers ADD COLUMN address TEXT;
    `);
    currentVersion = 2;
  }

  if (currentVersion === 2) {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN due_date TEXT;
      ALTER TABLE transactions ADD COLUMN notification_id TEXT;
    `);
    currentVersion = 3;
  }

  if (currentVersion === 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS spaces (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        account_type TEXT NOT NULL CHECK (account_type IN ('pro', 'particulier')),
        created_at TEXT NOT NULL
      );

      ALTER TABLE customers ADD COLUMN space_id TEXT REFERENCES spaces(id);
      ALTER TABLE transactions ADD COLUMN payment_channel TEXT;

      CREATE TABLE IF NOT EXISTS transaction_edits (
        id TEXT PRIMARY KEY NOT NULL,
        transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        field TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        reason TEXT,
        reason_other TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transaction_edits_transaction_id ON transaction_edits(transaction_id);
    `);

    const settingsRows = await db.getAllAsync<{ key: string; value: string }>(
      "SELECT key, value FROM settings WHERE key IN ('account_type', 'display_name', 'onboarding_complete')"
    );
    const settingsMap = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));
    if (settingsMap.onboarding_complete === '1') {
      const defaultSpaceId = generateId();
      await db.runAsync('INSERT INTO spaces (id, name, account_type, created_at) VALUES (?, ?, ?, ?)', [
        defaultSpaceId,
        settingsMap.display_name || 'Mon espace',
        settingsMap.account_type === 'pro' ? 'pro' : 'particulier',
        new Date().toISOString(),
      ]);
      await db.runAsync('UPDATE customers SET space_id = ? WHERE space_id IS NULL', [defaultSpaceId]);
      await db.runAsync(
        "INSERT INTO settings (key, value) VALUES ('current_space_id', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [defaultSpaceId]
      );
    }

    currentVersion = 4;
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
}
