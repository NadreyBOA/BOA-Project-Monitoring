import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/format';
import { cahiersDeTestRepo, installationsPatchRepo, iterationsRepo, patchsRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Environnement } from '../../lib/types';

export function EnvironnementObjetsLies({ environnement }: { environnement: Environnement }) {
  const { items: installations } = useRepositoryList(installationsPatchRepo);
  const { items: patchs } = useRepositoryList(patchsRepo);
  const { items: iterations } = useRepositoryList(iterationsRepo);
  const { items: cahiers } = useRepositoryList(cahiersDeTestRepo);

  const installationsEnvironnement = installations.filter((i) => i.environnementId === environnement.id);
  const iterationsEnvironnement = iterations.filter((it) => it.environnementId === environnement.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      <Card title="Installations de patchs">
        {installationsEnvironnement.length === 0 ? (
          <EmptyState message="Aucune installation de patch sur cet environnement." />
        ) : (
          <ul className="flex flex-col gap-3">
            {installationsEnvironnement.map((installation) => {
              const patch = patchs.find((p) => p.id === installation.patchId);
              return (
                <li key={installation.id} className="flex items-start justify-between gap-2 border border-surface-border rounded-chip px-3.5 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink-primary">{patch?.reference ?? '—'}</p>
                    <p className="text-xs text-ink-tertiary">{formatDate(installation.dateInstallation)}</p>
                  </div>
                  <Badge label={installation.statut} tone={installation.statut === 'Installé' ? 'success' : installation.statut === 'Échec' ? 'critical' : 'neutral'} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Itérations de test">
        {iterationsEnvironnement.length === 0 ? (
          <EmptyState message="Aucune itération de test exécutée sur cet environnement." />
        ) : (
          <ul className="flex flex-col gap-3">
            {iterationsEnvironnement.map((iteration) => {
              const cahier = cahiers.find((c) => c.id === iteration.cahierId);
              return (
                <li key={iteration.id} className="flex items-start justify-between gap-2 border border-surface-border rounded-chip px-3.5 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink-primary">
                      {cahier?.nom ?? '—'} — itération n°{iteration.numero}
                    </p>
                    <p className="text-xs text-ink-tertiary">{formatDate(iteration.dateDebut)}</p>
                  </div>
                  <Badge label={iteration.statut} tone={iteration.statut === 'Terminée' ? 'success' : iteration.statut === 'En cours' ? 'info' : 'neutral'} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
