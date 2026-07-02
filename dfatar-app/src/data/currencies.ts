export interface CurrencyInfo {
  code: string;
  label: string;
  flag: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'MAD', label: 'Dirham marocain', flag: '🇲🇦' },
  { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { code: 'USD', label: 'Dollar US', flag: '🇺🇸' },
  { code: 'XOF', label: "FCFA (Afrique de l'Ouest)", flag: '🌍' },
  { code: 'XAF', label: 'FCFA (Afrique Centrale)', flag: '🌍' },
  { code: 'DZD', label: 'Dinar algérien', flag: '🇩🇿' },
  { code: 'TND', label: 'Dinar tunisien', flag: '🇹🇳' },
  { code: 'GBP', label: 'Livre sterling', flag: '🇬🇧' },
  { code: 'CHF', label: 'Franc suisse', flag: '🇨🇭' },
  { code: 'CAD', label: 'Dollar canadien', flag: '🇨🇦' },
  { code: 'NGN', label: 'Naira nigérian', flag: '🇳🇬' },
  { code: 'GHS', label: 'Cedi ghanéen', flag: '🇬🇭' },
  { code: 'EGP', label: 'Livre égyptienne', flag: '🇪🇬' },
  { code: 'CNY', label: 'Yuan chinois', flag: '🇨🇳' },
  { code: 'INR', label: 'Roupie indienne', flag: '🇮🇳' },
  { code: 'BRL', label: 'Real brésilien', flag: '🇧🇷' },
  { code: 'MXN', label: 'Peso mexicain', flag: '🇲🇽' },
  { code: 'TRY', label: 'Livre turque', flag: '🇹🇷' },
  { code: 'AED', label: 'Dirham émirati', flag: '🇦🇪' },
  { code: 'SAR', label: 'Riyal saoudien', flag: '🇸🇦' },
  { code: 'ZAR', label: 'Rand sud-africain', flag: '🇿🇦' },
  { code: 'RUB', label: 'Rouble russe', flag: '🇷🇺' },
  { code: 'JPY', label: 'Yen japonais', flag: '🇯🇵' },
];

export function currencyInfo(code: string): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) ?? { code, label: code, flag: '💱' };
}
