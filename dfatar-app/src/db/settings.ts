import type { SQLiteDatabase } from 'expo-sqlite';

export const SETTINGS_KEYS = {
  shopName: 'shop_name',
  currency: 'currency',
} as const;

export const DEFAULT_SETTINGS = {
  shopName: 'Ma Boutique',
  currency: 'MAD',
};

export async function getSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}

export async function getAllSettings(
  db: SQLiteDatabase
): Promise<{ shopName: string; currency: string }> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    shopName: map[SETTINGS_KEYS.shopName] ?? DEFAULT_SETTINGS.shopName,
    currency: map[SETTINGS_KEYS.currency] ?? DEFAULT_SETTINGS.currency,
  };
}
