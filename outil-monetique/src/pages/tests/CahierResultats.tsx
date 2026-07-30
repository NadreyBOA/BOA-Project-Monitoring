import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { DonutChart } from '../../components/ui/DonutChart';
import { AreaChart } from '../../components/ui/AreaChart';
import { EmptyState } from '../../components/ui/EmptyState';
import { champClasses } from '../../components/ui/Field';
import { iterationsDuCahier, tauxReussite } from '../../lib/testsStats';
import { personnesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { CahierDeTest, ExecutionCas, Iteration } from '../../lib/types';

interface CahierResultatsProps {
  cahier: CahierDeTest;
  iterations: Iteration[];
  executions: ExecutionCas[];
}

export function CahierResultats({ cahier, iterations, executions }: CahierResultatsProps) {
  const { items: personnes } = useRepositoryList(personnesRepo);
  const iterationsCahier = iterationsDuCahier(cahier.id, iterations);
  const derniereIterationCahier = iterationsCahier[iterationsCahier.length - 1];
  const [iterationSelectionneeId, setIterationSelectionneeId] = useState<string>(derniereIterationCahier?.id ?? '');
  const iterationSelectionnee = iterationsCahier.find((it) => it.id === iterationSelectionneeId) ?? derniereIterationCahier;

  if (iterationsCahier.length === 0 || !iterationSelectionnee) {
    return (
      <Card>
        <EmptyState message="Aucune itération exécutée pour ce cahier : pas encore de résultats à afficher." />
      </Card>
    );
  }

  const executionsIteration = executions.filter((e) => e.iterationId === iterationSelectionnee.id);
  const parStatut = (statut: ExecutionCas['statut']) => executionsIteration.filter((e) => e.statut === statut).length;

  const segments = [
    { label: 'Réussis', value: parStatut('Réussi'), couleur: '#008457' },
    { label: 'Échoués', value: parStatut('Échoué'), couleur: '#E5484D' },
    { label: 'Bloqués', value: parStatut('Bloqué'), couleur: '#F79009' },
    { label: 'Non exécutés', value: parStatut('Non exécuté') + parStatut('Non applicable'), couleur: '#D0D5DD' },
  ];

  const dureeTotale = executionsIteration.reduce((s, e) => s + e.duree, 0);
  const executees = executionsIteration.filter((e) => e.statut !== 'Non exécuté');
  const dureeMoyenne = executees.length > 0 ? Math.round(dureeTotale / executees.length) : 0;

  const evolutionCategories = iterationsCahier.map((it) => `n°${it.numero}`);
  const evolutionValeurs = iterationsCahier.map((it) => tauxReussite(it.id, executions) ?? 0);

  const parTesteur = new Map<string, { nbCas: number; duree: number }>();
  for (const execution of executionsIteration) {
    const entree = parTesteur.get(execution.testeurId) ?? { nbCas: 0, duree: 0 };
    entree.nbCas += 1;
    entree.duree += execution.duree;
    parTesteur.set(execution.testeurId, entree);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-ink-secondary">Itération :</span>
        <select value={iterationSelectionnee.id} onChange={(e) => setIterationSelectionneeId(e.target.value)} className={`${champClasses} w-auto`}>
          {iterationsCahier.map((it) => (
            <option key={it.id} value={it.id}>
              n°{it.numero}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <Card title="Répartition des résultats">
          <DonutChart segments={segments} centre={{ valeur: executionsIteration.length, libelle: 'cas' }} />
        </Card>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card title="Durées">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Durée totale</p>
                <p className="text-xl font-extrabold text-ink-primary tabular-nums">{dureeTotale} min</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Durée moyenne / cas</p>
                <p className="text-xl font-extrabold text-ink-primary tabular-nums">{dureeMoyenne} min</p>
              </div>
            </div>
          </Card>

          <Card title="Par testeur">
            {parTesteur.size === 0 ? (
              <EmptyState message="Aucune exécution saisie." />
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {[...parTesteur.entries()].map(([testeurId, stats]) => (
                  <li key={testeurId} className="flex justify-between border-b border-surface-border last:border-0 pb-2 last:pb-0">
                    <span className="text-ink-primary font-medium">{personnes.find((p) => p.id === testeurId)?.nom ?? '—'}</span>
                    <span className="text-ink-secondary tabular-nums">
                      {stats.nbCas} cas · {stats.duree} min
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {iterationsCahier.length > 1 && (
        <Card title="Évolution du taux de réussite">
          <AreaChart
            categories={evolutionCategories}
            series={[{ cle: 'taux', libelle: 'Taux de réussite', couleur: '#044C7E', valeurs: evolutionValeurs }]}
            formatValeur={(v) => `${v}%`}
          />
        </Card>
      )}
    </div>
  );
}
