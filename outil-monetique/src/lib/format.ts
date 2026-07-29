/** Formate une date ISO (YYYY-MM-DD) en JJ/MM/AAAA. */
export function formatDate(dateISO: string | undefined): string {
  if (!dateISO) return '—';
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Formate un montant en FCFA : séparateur de milliers par espace, sans décimales. */
export function formatMontant(montant: number): string {
  const entier = Math.round(montant).toString();
  const avecEspaces = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${avecEspaces} FCFA`;
}
