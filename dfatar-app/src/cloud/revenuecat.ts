import Purchases, { LOG_LEVEL, type CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

export const ENTITLEMENT_ID = 'premium';

export const isRevenueCatConfigured = Boolean(Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY);

let configured = false;

export function configurePurchases(): void {
  if (configured || !isRevenueCatConfigured) return;
  const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
  Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({ apiKey });
  configured = true;
}

export function hasPremiumEntitlement(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isRevenueCatConfigured) return null;
  return Purchases.getCustomerInfo();
}

export interface PurchaseResult {
  success: boolean;
  cancelled: boolean;
  error: string | null;
}

export async function purchasePremiumPackage(): Promise<PurchaseResult> {
  if (!isRevenueCatConfigured) {
    return { success: false, cancelled: false, error: 'RevenueCat non configuré pour cette build.' };
  }
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) {
      return { success: false, cancelled: false, error: 'Aucune offre disponible pour le moment.' };
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: hasPremiumEntitlement(customerInfo), cancelled: false, error: null };
  } catch (e: any) {
    if (e?.userCancelled) {
      return { success: false, cancelled: true, error: null };
    }
    return { success: false, cancelled: false, error: e?.message ?? 'Une erreur est survenue.' };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isRevenueCatConfigured) {
    return { success: false, cancelled: false, error: 'RevenueCat non configuré pour cette build.' };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: hasPremiumEntitlement(customerInfo), cancelled: false, error: null };
  } catch (e: any) {
    return { success: false, cancelled: false, error: e?.message ?? 'Une erreur est survenue.' };
  }
}
