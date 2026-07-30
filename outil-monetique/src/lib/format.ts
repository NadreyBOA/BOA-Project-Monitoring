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

/** Nombre de jours écoulés depuis une date ISO (YYYY-MM-DD) jusqu'à aujourd'hui. */
export function joursDepuis(dateISO: string): number {
  const debut = new Date(dateISO).getTime();
  const maintenant = Date.now();
  return Math.max(0, Math.floor((maintenant - debut) / (1000 * 60 * 60 * 24)));
}
