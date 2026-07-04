import type { SQLiteDatabase } from 'expo-sqlite';
import { getSetting, setSetting, SETTINGS_KEYS } from './db/settings';
import {
  configurePurchases,
  fetchCustomerInfo,
  hasPremiumEntitlement,
  isRevenueCatConfigured,
  purchasePremiumPackage,
  restorePurchases,
  type PurchaseResult,
} from './cloud/revenuecat';

export const FREE_CUSTOMER_LIMIT = 20;
export const PREMIUM_PRICE_LABEL = '$4.99';

export { isRevenueCatConfigured };

export async function isPremium(db: SQLiteDatabase): Promise<boolean> {
  return (await getSetting(db, SETTINGS_KEYS.isPremium)) === '1';
}

async function setPremiumFlag(db: SQLiteDatabase, value: boolean): Promise<void> {
  await setSetting(db, SETTINGS_KEYS.isPremium, value ? '1' : '0');
}

export function initPurchases(): void {
  configurePurchases();
}

/** Refresh the local premium flag from RevenueCat. Call on app start and when Settings gains focus. */
export async function syncPremiumStatus(db: SQLiteDatabase): Promise<void> {
  if (!isRevenueCatConfigured) return;
  const info = await fetchCustomerInfo();
  if (info) await setPremiumFlag(db, hasPremiumEntitlement(info));
}

export async function purchasePremium(db: SQLiteDatabase): Promise<PurchaseResult> {
  const result = await purchasePremiumPackage();
  if (result.success) await setPremiumFlag(db, true);
  return result;
}

export async function restorePremium(db: SQLiteDatabase): Promise<PurchaseResult> {
  const result = await restorePurchases();
  if (result.success) await setPremiumFlag(db, true);
  return result;
}
