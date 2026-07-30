import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/format';
import { champsAudit } from '../../lib/repository';
import { tracer } from '../../lib/journal';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { personnesRepo, restaurationsRepo, versionsProductionRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Environnement, Restauration, StatutRestauration } from '../../lib/types';

const toneStatutRestauration: Record<StatutRestauration, BadgeTone> = {
  Demandée: 'neutral',
  Planifiée: 'info',
  Réalisée: 'success',
  Échouée: 'critical',
};

interface EnvironnementRestaurationsProps {
  environnement: Environnement;
  restaurations: Restauration[];
  recharger: () => void;
}

export function EnvironnementRestaurations({ environnement, restaurations, recharger }: EnvironnementRestaurationsProps) {
  const { items: versions } = useRepositoryList(versionsProductionRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const utilisateurCourant = useUtilisateurCourant();
  const restaurationsEnvironnement = restaurations
    .filter((r) => r.environnementId === environnement.id)
    .sort((a, b) => b.dateDemande.localeCompare(a.dateDemande));

  const [ouvert, setOuvert] = useState(false);
  const [versionSource, setVersionSource] = useState('');
  const [motif, setMotif] = useState('');

  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? '—';

  function ouvrirDemande() {
    setVersionSource(versions[0]?.reference ?? '');
    setMotif('');
    setOuvert(true);
  }

  async function demander() {
    if (!versionSource.trim() || !motif.trim() || !utilisateurCourant) return;
    await restaurationsRepo.create({
      ...champsAudit(utilisateurCourant.id),
      environnementId: environnement.id,
      dateDemande: new Date().toISOString().slice(0, 10),
      versionSource,
      motif,
      demandeurId: utilisateurCourant.id,
      statut: 'Demandée',
    });
    await tracer('environnement', environnement.id, 'modification', utilisateurCourant.id, `Restauration demandée depuis ${versionSource}.`);
    setOuvert(false);
    recharger();
  }

  async function changerStatut(restauration: Restauration, statut: StatutRestauration) {
    if (!utilisateurCourant) return;
    const patch: Partial<Restauration> = { statut, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id };
    if (statut === 'Réalisée' || statut === 'Échouée') {
      patch.dateRealisation = new Date().toISOString().slice(0, 10);
    }
    await restaurationsRepo.update(restauration.id, patch);
    await tracer('environnement', environnement.id, 'changement de statut', utilisateurCourant.id, `Restauration marquée « ${statut} ».`);
    recharger();
  }

  return (
    <>
      <Card
        title="Restaurations"
        actions={
          <button
            type="button"
            onClick={ouvrirDemande}
            className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700"
          >
            <Plus className="w-4 h-4" /> Demander une restauration
          </button>
        }
      >
        {restaurationsEnvironnement.length === 0 ? (
          <EmptyState message="Aucune restauration demandée pour cet environnement." />
        ) : (
          <ul className="flex flex-col gap-3">
            {restaurationsEnvironnement.map((restauration) => (
              <li key={restauration.id} className="flex items-center justify-between gap-3 border border-surface-border rounded-chip px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-primary">
                    Depuis <span className="font-mono">{restauration.versionSource}</span>
                  </p>
                  <p className="text-xs text-ink-secondary">{restauration.motif}</p>
                  <p className="text-xs text-ink-tertiary mt-0.5">
                    Demandée le {formatDate(restauration.dateDemande)} par {nomPersonne(restauration.demandeurId)}
                    {restauration.dateRealisation && ` · réalisée le ${formatDate(restauration.dateRealisation)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={restauration.statut}
                    onChange={(e) => changerStatut(restauration, e.target.value as StatutRestauration)}
                    className={`${champClasses} w-auto py-1.5 text-xs`}
                  >
                    {(['Demandée', 'Planifiée', 'Réalisée', 'Échouée'] as StatutRestauration[]).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <Badge label={restauration.statut} tone={toneStatutRestauration[restauration.statut]} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Demander une restauration"
        footer={
          <button type="button" onClick={demander} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
            Envoyer la demande
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Version source">
            <select value={versionSource} onChange={(e) => setVersionSource(e.target.value)} className={champClasses}>
              {versions.length === 0 && <option value="">Aucune version de production enregistrée</option>}
              {versions.map((v) => (
                <option key={v.id} value={v.reference}>
                  {v.reference} — {formatDate(v.dateMiseEnProd)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Motif">
            <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={3} className={champClasses} />
          </Field>
        </div>
      </Drawer>
    </>
  );
}
