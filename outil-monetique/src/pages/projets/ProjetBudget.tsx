import { TriangleAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AreaChart } from '../../components/ui/AreaChart';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatMontant } from '../../lib/format';
import { cumulParMois } from '../../lib/serieTemporelle';
import { parametresKPIRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Depense, Projet } from '../../lib/types';

interface ProjetBudgetProps {
  projet: Projet;
  depenses: Depense[];
}

export function ProjetBudget({ projet, depenses }: ProjetBudgetProps) {
  const { items: parametresKPI } = useRepositoryList(parametresKPIRepo);
  const seuil = parametresKPI.find((p) => p.cle === 'seuil_depassement_budget')?.valeur ?? 90;

  const depensesProjet = depenses.filter((d) => d.projetId === projet.id);
  const consomme = depensesProjet.reduce((s, d) => s + d.montant, 0);
  const reste = projet.budgetAlloue - consomme;
  const taux = projet.budgetAlloue > 0 ? (consomme / projet.budgetAlloue) * 100 : 0;
  const depassement = taux >= seuil;

  const { categories, valeurs } = cumulParMois(depensesProjet.map((d) => ({ date: d.date, montant: d.montant })));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <Card title="Suivi budgétaire" className="lg:col-span-2">
        {categories.length === 0 ? (
          <EmptyState message="Aucune dépense enregistrée pour ce projet." />
        ) : (
          <AreaChart
            categories={categories}
            series={[{ cle: 'cumul', libelle: 'Dépenses cumulées', couleur: '#044C7E', valeurs }]}
            formatValeur={formatMontant}
          />
        )}
      </Card>

      <div className="flex flex-col gap-5">
        <Card title="Budget alloué">
          <p className="text-2xl font-extrabold text-ink-primary tabular-nums">{formatMontant(projet.budgetAlloue)}</p>
        </Card>

        <Card title="Consommation">
          <div className="flex flex-col gap-2">
            <ProgressBar pourcentage={taux} tone={depassement ? 'critical' : 'success'} />
            <p className="text-sm text-ink-secondary tabular-nums">{Math.round(taux)}% consommé</p>
            <p className="text-sm text-ink-secondary">
              <span className="font-semibold text-ink-primary tabular-nums">{formatMontant(consomme)}</span> dépensés
            </p>
            <p className="text-sm text-ink-secondary">
              <span className={`font-semibold tabular-nums ${reste < 0 ? 'text-status-critical' : 'text-ink-primary'}`}>{formatMontant(reste)}</span>{' '}
              restants
            </p>
            {depassement && (
              <div className="flex items-center gap-2 text-xs font-semibold text-status-critical bg-red-50 rounded-lg px-3 py-2 mt-1">
                <TriangleAlert className="w-4 h-4 shrink-0" />
                Seuil d'alerte ({seuil}%) dépassé.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
