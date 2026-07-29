import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/format';
import {
  cahiersDeTestRepo,
  environnementsRepo,
  installationsPatchRepo,
  iterationsRepo,
  patchsRepo,
} from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Projet } from '../../lib/types';

export function ProjetElementsLies({ projet }: { projet: Projet }) {
  const { items: cahiers } = useRepositoryList(cahiersDeTestRepo);
  const { items: patchs } = useRepositoryList(patchsRepo);
  const { items: iterations } = useRepositoryList(iterationsRepo);
  const { items: installations } = useRepositoryList(installationsPatchRepo);
  const { items: environnements } = useRepositoryList(environnementsRepo);

  const cahiersProjet = cahiers.filter((c) => c.projetId === projet.id);
  const patchsProjet = patchs.filter((p) => p.projetId === projet.id);

  const environnementIds = new Set<string>();
  for (const cahier of cahiersProjet) {
    for (const iteration of iterations.filter((it) => it.cahierId === cahier.id)) {
      environnementIds.add(iteration.environnementId);
    }
  }
  for (const patch of patchsProjet) {
    for (const installation of installations.filter((i) => i.patchId === patch.id)) {
      environnementIds.add(installation.environnementId);
    }
  }
  const environnementsProjet = environnements.filter((e) => environnementIds.has(e.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <Card title="Cahiers de test">
        {cahiersProjet.length === 0 ? (
          <EmptyState message="Aucun cahier de test rattaché." />
        ) : (
          <ul className="flex flex-col gap-3">
            {cahiersProjet.map((cahier) => (
              <li key={cahier.id} className="flex items-start justify-between gap-2 border border-surface-border rounded-chip px-3.5 py-2.5">
                <span className="text-sm font-medium text-ink-primary">{cahier.nom}</span>
                <Badge label={cahier.statut} tone={cahier.statut === 'Clôturé' ? 'success' : cahier.statut === 'En cours' ? 'info' : 'neutral'} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Patchs">
        {patchsProjet.length === 0 ? (
          <EmptyState message="Aucun patch rattaché." />
        ) : (
          <ul className="flex flex-col gap-3">
            {patchsProjet.map((patch) => (
              <li key={patch.id} className="flex items-start justify-between gap-2 border border-surface-border rounded-chip px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink-primary">{patch.reference}</p>
                  <p className="text-xs text-ink-tertiary">{formatDate(patch.dateReception)}</p>
                </div>
                <Badge label={patch.statut} tone={patch.statut === 'Déployé' || patch.statut === 'Validé' ? 'success' : patch.statut === 'Rejeté' ? 'critical' : 'info'} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Environnements">
        {environnementsProjet.length === 0 ? (
          <EmptyState message="Aucun environnement utilisé (via cahiers de test ou installations de patchs)." />
        ) : (
          <ul className="flex flex-col gap-3">
            {environnementsProjet.map((env) => (
              <li key={env.id} className="flex items-start justify-between gap-2 border border-surface-border rounded-chip px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink-primary">{env.nom}</p>
                  <p className="text-xs text-ink-tertiary">{env.type}</p>
                </div>
                <Badge label={env.statut} tone={env.statut === 'Disponible' ? 'success' : env.statut === 'Indisponible' ? 'critical' : 'warning'} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
