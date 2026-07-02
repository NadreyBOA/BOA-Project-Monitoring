export function flagFromISO2(cc: string): string {
  if (!cc || cc.length !== 2) return '🏳️';
  const base = 0x1f1e6;
  return cc
    .toUpperCase()
    .split('')
    .map((ch) => String.fromCodePoint(base + (ch.charCodeAt(0) - 65)))
    .join('');
}
