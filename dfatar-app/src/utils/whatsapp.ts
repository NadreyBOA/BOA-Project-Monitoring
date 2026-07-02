import { Linking } from 'react-native';
import { formatAmount } from './currency';

export function buildReminderMessage(customerName: string, balance: number, currency: string, shopName: string): string {
  return `Bonjour ${customerName}, un petit rappel : vous avez un solde de ${formatAmount(balance, currency)} chez ${shopName}. Merci !`;
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
