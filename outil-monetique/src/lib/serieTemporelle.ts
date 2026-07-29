/** Regroupe des montants datés par mois et calcule le cumul, pour un graphe d'aires. */
export function cumulParMois(entrees: { date: string; montant: number }[]): { categories: string[]; valeurs: number[] } {
  if (entrees.length === 0) return { categories: [], valeurs: [] };

  const parMois = new Map<string, number>();
  for (const entree of entrees) {
    const cle = entree.date.slice(0, 7); // YYYY-MM
    parMois.set(cle, (parMois.get(cle) ?? 0) + entree.montant);
  }

  const clesTriees = [...parMois.keys()].sort();
  let cumul = 0;
  const valeurs: number[] = [];
  const categories: string[] = [];
  for (const cle of clesTriees) {
    cumul += parMois.get(cle)!;
    valeurs.push(cumul);
    const [annee, mois] = cle.split('-');
    const libelleMois = new Date(Number(annee), Number(mois) - 1, 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    categories.push(libelleMois);
  }

  return { categories, valeurs };
}
