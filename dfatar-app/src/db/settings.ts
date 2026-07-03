import type { SQLiteDatabase } from 'expo-sqlite';
import type { AccountType } from '../types';

export const SETTINGS_KEYS = {
  accountType: 'account_type',
  displayName: 'display_name',
  countryCode: 'country_code',
  baseCurrency: 'base_currency',
  onboardingComplete: 'onboarding_complete',
  isPremium: 'is_premium',
  themeId: 'theme_id',
  notificationsEnabled: 'notifications_enabled',
  reminderOffsetDays: 'reminder_offset_days',
} as const;

export const DEFAULT_REMINDER_OFFSET_DAYS = 1;

export async function getReminderOffsetDays(db: SQLiteDatabase): Promise<number> {
  const value = await getSetting(db, SETTINGS_KEYS.reminderOffsetDays);
  return value === null ? DEFAULT_REMINDER_OFFSET_DAYS : Number(value);
}

export async function setReminderOffsetDays(db: SQLiteDatabase, days: number): Promise<void> {
  await setSetting(db, SETTINGS_KEYS.reminderOffsetDays, String(days));
}

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

export interface Profile {
  accountType: AccountType;
  displayName: string;
  countryCode: string;
  baseCurrency: string;
}

export async function isOnboardingComplete(db: SQLiteDatabase): Promise<boolean> {
  return (await getSetting(db, SETTINGS_KEYS.onboardingComplete)) === '1';
}

export async function getProfile(db: SQLiteDatabase): Promise<Profile> {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings WHERE key IN (?, ?, ?, ?)',
    [SETTINGS_KEYS.accountType, SETTINGS_KEYS.displayName, SETTINGS_KEYS.countryCode, SETTINGS_KEYS.baseCurrency]
  );
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    accountType: (map[SETTINGS_KEYS.accountType] as AccountType) ?? 'particulier',
    displayName: map[SETTINGS_KEYS.displayName] ?? '',
    countryCode: map[SETTINGS_KEYS.countryCode] ?? 'MA',
    baseCurrency: map[SETTINGS_KEYS.baseCurrency] ?? 'MAD',
  };
}

export async function completeOnboarding(db: SQLiteDatabase, profile: Profile): Promise<void> {
  await setSetting(db, SETTINGS_KEYS.accountType, profile.accountType);
  await setSetting(db, SETTINGS_KEYS.displayName, profile.displayName);
  await setSetting(db, SETTINGS_KEYS.countryCode, profile.countryCode);
  await setSetting(db, SETTINGS_KEYS.baseCurrency, profile.baseCurrency);
  await setSetting(db, SETTINGS_KEYS.onboardingComplete, '1');
}
