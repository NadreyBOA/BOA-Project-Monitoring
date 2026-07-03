import type { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../utils/id';
import { getSetting, setSetting, SETTINGS_KEYS } from './settings';
import type { AccountType } from '../types';

export interface Space {
  id: string;
  name: string;
  accountType: AccountType;
  createdAt: string;
}

function mapRow(row: { id: string; name: string; account_type: string; created_at: string }): Space {
  return { id: row.id, name: row.name, accountType: row.account_type as AccountType, createdAt: row.created_at };
}

export async function listSpaces(db: SQLiteDatabase): Promise<Space[]> {
  const rows = await db.getAllAsync<{ id: string; name: string; account_type: string; created_at: string }>(
    'SELECT * FROM spaces ORDER BY created_at ASC'
  );
  return rows.map(mapRow);
}

export async function countSpaces(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM spaces');
  return row?.count ?? 0;
}

export async function getSpace(db: SQLiteDatabase, id: string): Promise<Space | null> {
  const row = await db.getFirstAsync<{ id: string; name: string; account_type: string; created_at: string }>(
    'SELECT * FROM spaces WHERE id = ?',
    [id]
  );
  return row ? mapRow(row) : null;
}

export async function createSpace(
  db: SQLiteDatabase,
  input: { name: string; accountType: AccountType }
): Promise<string> {
  const id = generateId();
  await db.runAsync('INSERT INTO spaces (id, name, account_type, created_at) VALUES (?, ?, ?, ?)', [
    id,
    input.name.trim(),
    input.accountType,
    new Date().toISOString(),
  ]);
  return id;
}

export async function getCurrentSpaceId(db: SQLiteDatabase): Promise<string | null> {
  return getSetting(db, SETTINGS_KEYS.currentSpaceId);
}

export async function setCurrentSpaceId(db: SQLiteDatabase, id: string): Promise<void> {
  await setSetting(db, SETTINGS_KEYS.currentSpaceId, id);
}

export async function getCurrentSpace(db: SQLiteDatabase): Promise<Space | null> {
  const id = await getCurrentSpaceId(db);
  if (!id) return null;
  return getSpace(db, id);
}

export async function renameSpace(db: SQLiteDatabase, id: string, name: string): Promise<void> {
  await db.runAsync('UPDATE spaces SET name = ? WHERE id = ?', [name.trim(), id]);
}

export const MAX_FREE_SPACES = 1;

export async function completeOnboarding(
  db: SQLiteDatabase,
  input: { accountType: AccountType; displayName: string; countryCode: string; baseCurrency: string }
): Promise<void> {
  await setSetting(db, SETTINGS_KEYS.countryCode, input.countryCode);
  await setSetting(db, SETTINGS_KEYS.baseCurrency, input.baseCurrency);
  const spaceId = await createSpace(db, { name: input.displayName, accountType: input.accountType });
  await setCurrentSpaceId(db, spaceId);
  await setSetting(db, SETTINGS_KEYS.onboardingComplete, '1');
}
