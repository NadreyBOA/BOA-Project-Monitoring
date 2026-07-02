export function formatAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount * 100) / 100;
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(rounded));
  const sign = rounded < 0 ? '-' : '';
  return `${sign}${formatted} ${currency}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
