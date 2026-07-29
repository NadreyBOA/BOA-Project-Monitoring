import { Link } from 'react-router-dom';
import { DataTable, type Colonne } from '../../components/ui/DataTable';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatDate, formatMontant } from '../../lib/format';
import type { Depense, Entite, Personne, Projet, StatutProjet } from '../../lib/types';

export const toneStatutProjet: Record<StatutProjet, BadgeTone> = {
  Cadrage: 'neutral',
  'En cours': 'info',
  'En pause': 'warning',
  Clôturé: 'success',
  Annulé: 'critical',
};

interface ProjetsVueTableauProps {
  projets: Projet[];
  personnes: Personne[];
  entites: Entite[];
  depenses: Depense[];
}

export function ProjetsVueTableau({ projets, personnes, entites, depenses }: ProjetsVueTableauProps) {
  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? '—';
  const codesEntites = (ids: string[]) => ids.map((id) => entites.find((e) => e.id === id)?.code ?? '?').join(', ');
  const consomme = (projetId: string) => depenses.filter((d) => d.projetId === projetId).reduce((s, d) => s + d.montant, 0);

  const colonnes: Colonne<Projet>[] = [
    {
      cle: 'nom',
      entete: 'Nom',
      rendu: (p) => (
        <Link to={`/projets/${p.id}`} className="font-semibold text-boa-navy hover:underline">
          {p.nom}
        </Link>
      ),
      tri: (a, b) => a.nom.localeCompare(b.nom),
    },
    { cle: 'responsable', entete: 'Responsable', rendu: (p) => nomPersonne(p.responsableId) },
    { cle: 'entites', entete: 'Entités', rendu: (p) => codesEntites(p.entiteIds) },
    { cle: 'statut', entete: 'Statut', rendu: (p) => <Badge label={p.statut} tone={toneStatutProjet[p.statut]} /> },
    {
      cle: 'avancement',
      entete: 'Avancement',
      rendu: (p) => (
        <div className="flex items-center gap-2 w-32">
          <ProgressBar pourcentage={p.avancement} tone={p.statut === 'Clôturé' ? 'success' : 'info'} />
          <span className="text-xs text-ink-secondary tabular-nums shrink-0">{p.avancement}%</span>
        </div>
      ),
      tri: (a, b) => a.avancement - b.avancement,
    },
    {
      cle: 'budget',
      entete: 'Budget consommé',
      rendu: (p) => (
        <span className="tabular-nums text-sm">
          {formatMontant(consomme(p.id))} <span className="text-ink-tertiary">/ {formatMontant(p.budgetAlloue)}</span>
        </span>
      ),
    },
    {
      cle: 'dateCible',
      entete: 'Date cible',
      rendu: (p) => formatDate(p.dateFinCible),
      tri: (a, b) => a.dateFinCible.localeCompare(b.dateFinCible),
    },
  ];

  return <DataTable colonnes={colonnes} lignes={projets} cleLigne={(p) => p.id} parPage={15} messageVide="Aucun projet ne correspond aux filtres." />;
}
