import { Linking } from 'react-native';
import { formatAmount } from './currency';
import type { AccountType } from '../types';

export function buildReminderMessage(
  customerName: string,
  balance: number,
  currency: string,
  displayName: string,
  accountType: AccountType
): string {
  const amount = formatAmount(balance, currency);
  if (accountType === 'pro') {
    return `Bonjour ${customerName}, un petit rappel : vous avez un solde de ${amount} chez ${displayName}. Merci !`;
  }
  return `Bonjour ${customerName}, petit rappel amical de la part de ${displayName} : il te reste ${amount} à me rembourser. Merci !`;
}

export async function openWhatsAppReminder(phone: string, message: string): Promise<boolean> {
  const digitsOnly = phone.replace(/[^\d+]/g, '');
  const url = `whatsapp://send?phone=${encodeURIComponent(digitsOnly)}&text=${encodeURIComponent(message)}`;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  }
  const webUrl = `https://wa.me/${encodeURIComponent(digitsOnly.replace('+', ''))}?text=${encodeURIComponent(message)}`;
  await Linking.openURL(webUrl);
  return true;
}
