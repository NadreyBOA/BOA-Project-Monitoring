import type { SQLiteDatabase } from 'expo-sqlite';
import { getSetting, setSetting, SETTINGS_KEYS } from './db/settings';

export const FREE_CUSTOMER_LIMIT = 20;
export const PREMIUM_PRICE_LABEL = '$4.99';

export async function isPremium(db: SQLiteDatabase): Promise<boolean> {
  return (await getSetting(db, SETTINGS_KEYS.isPremium)) === '1';
}

// Simulated purchase for local testing — replace with a real IAP SDK (e.g. RevenueCat)
// once App Store Connect / Google Play Console products exist. This is the single
// integration point: swap the implementation, keep the call sites unchanged.
export async function unlockPremium(db: SQLiteDatabase): Promise<void> {
  await setSetting(db, SETTINGS_KEYS.isPremium, '1');
}
