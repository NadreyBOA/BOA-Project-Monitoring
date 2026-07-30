import { CheckCircle2, TriangleAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/format';
import { derniereVersionProduction, estAJour } from '../../lib/versionEcart';
import { tracer } from '../../lib/journal';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { environnementsRepo, modulesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Environnement, VersionProduction } from '../../lib/types';

interface EnvironnementVersionsProps {
  environnement: Environnement;
  versions: VersionProduction[];
  recharger: () => void;
}

export function EnvironnementVersions({ environnement, versions, recharger }: EnvironnementVersionsProps) {
  const { items: modules } = useRepositoryList(modulesRepo);
  const utilisateurCourant = useUtilisateurCourant();
  const derniere = derniereVersionProduction(versions);
  const aJour = estAJour(environnement, versions);

  async function mettreAJour() {
    if (!derniere || !utilisateurCourant) return;
    await environnementsRepo.update(environnement.id, {
      versionProdDeployee: { reference: derniere.reference, date: derniere.dateMiseEnProd },
      dateModification: new Date().toISOString(),
      modifiePar: utilisateurCourant.id,
    });
    await tracer('environnement', environnement.id, 'modification', utilisateurCourant.id, `Version reflétée mise à jour vers ${derniere.reference}.`);
    recharger();
  }

  return (
    <div className="flex flex-col gap-5">
      <Card title="Écart de version">
        {!derniere ? (
          <EmptyState message="Aucune version de production enregistrée dans le référentiel." />
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {aJour ? <CheckCircle2 className="w-5 h-5 text-boa-green shrink-0" /> : <TriangleAlert className="w-5 h-5 text-status-critical shrink-0" />}
              <div>
                <p className="text-sm text-ink-primary">
                  Version reflétée : <span className="font-bold">{environnement.versionProdDeployee.reference}</span> (
                  {formatDate(environnement.versionProdDeployee.date)})
                </p>
                <p className="text-sm text-ink-secondary">
                  Dernière version de production : <span className="font-semibold">{derniere.reference}</span> ({formatDate(derniere.dateMiseEnProd)})
                </p>
              </div>
            </div>
            {!aJour && (
              <button
                type="button"
                onClick={mettreAJour}
                className="rounded-full px-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700 shrink-0"
              >
                Mettre à jour la version reflétée
              </button>
            )}
          </div>
        )}
      </Card>

      <Card title="Historique des versions de production">
        {versions.length === 0 ? (
          <EmptyState message="Aucune version de production enregistrée." />
        ) : (
          <ul className="flex flex-col gap-3">
            {[...versions]
              .sort((a, b) => b.dateMiseEnProd.localeCompare(a.dateMiseEnProd))
              .map((version) => (
                <li key={version.id} className="flex items-center justify-between gap-3 border border-surface-border rounded-chip px-3.5 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">{version.reference}</p>
                    <p className="text-xs text-ink-secondary">{version.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-ink-tertiary">{formatDate(version.dateMiseEnProd)}</p>
                    <p className="text-xs text-ink-secondary">{version.moduleIds.map((id) => modules.find((m) => m.id === id)?.nom ?? '?').join(', ')}</p>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
