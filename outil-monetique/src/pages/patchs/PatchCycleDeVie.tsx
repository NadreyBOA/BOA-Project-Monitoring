import { useState } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { formatDate } from '../../lib/format';
import { tracer } from '../../lib/journal';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { journalRepo, patchsRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Patch, StatutPatch } from '../../lib/types';

const etapesCycle: StatutPatch[] = ['Reçu', 'En analyse', 'En recette', 'Validé', 'Déployé'];

export function PatchCycleDeVie({ patch, recharger }: { patch: Patch; recharger: () => void }) {
  const { items: journal, recharger: rechargerJournal } = useRepositoryList(journalRepo);
  const utilisateurCourant = useUtilisateurCourant();

  const [ouvert, setOuvert] = useState(false);
  const [statutCible, setStatutCible] = useState<StatutPatch>(patch.statut);
  const [motifRejet, setMotifRejet] = useState('');

  const changementsStatut = journal
    .filter((entree) => entree.typeObjet === 'patch' && entree.objetId === patch.id && entree.type === 'changement de statut')
    .sort((a, b) => a.date.localeCompare(b.date));

  const indexActuel = etapesCycle.indexOf(patch.statut);
  const horsCycle = patch.statut === 'Rejeté' || patch.statut === 'En attente';

  function ouvrirChangement() {
    setStatutCible(patch.statut);
    setMotifRejet('');
    setOuvert(true);
  }

  async function appliquer() {
    if (!utilisateurCourant || statutCible === patch.statut) return;
    if (statutCible === 'Rejeté' && !motifRejet.trim()) return;

    await patchsRepo.update(patch.id, { statut: statutCible, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
    const resume = `Statut changé de « ${patch.statut} » à « ${statutCible} ».`;
    await tracer('patch', patch.id, 'changement de statut', utilisateurCourant.id, resume, statutCible === 'Rejeté' ? `Motif : ${motifRejet}` : undefined);
    setOuvert(false);
    rechargerJournal();
    recharger();
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="Cycle de vie"
        actions={
          <button type="button" onClick={ouvrirChangement} className="rounded-full px-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700">
            Faire évoluer le statut
          </button>
        }
      >
        {horsCycle ? (
          <div className="flex items-center gap-2.5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-status-critical">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Patch actuellement « {patch.statut} »
          </div>
        ) : (
          <div className="flex items-center">
            {etapesCycle.map((etape, index) => (
              <div key={etape} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      index < indexActuel
                        ? 'bg-boa-green text-white'
                        : index === indexActuel
                          ? 'bg-boa-navy text-white'
                          : 'bg-surface-tint text-ink-tertiary'
                    }`}
                  >
                    {index < indexActuel ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`text-xs font-semibold text-center ${index <= indexActuel ? 'text-ink-primary' : 'text-ink-tertiary'}`}>{etape}</span>
                </div>
                {index < etapesCycle.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 mb-5 ${index < indexActuel ? 'bg-boa-green' : 'bg-surface-border'}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Dates de passage">
        {changementsStatut.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Aucun changement de statut enregistré pour l'instant.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {changementsStatut.map((entree) => (
              <li key={entree.id} className="flex items-center justify-between border-b border-surface-border last:border-0 pb-2 last:pb-0">
                <span className="text-sm text-ink-primary">{entree.resume}</span>
                <span className="text-xs text-ink-tertiary tabular-nums shrink-0">{formatDate(entree.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Faire évoluer le statut"
        footer={
          <button type="button" onClick={appliquer} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
            Appliquer
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Nouveau statut">
            <select value={statutCible} onChange={(e) => setStatutCible(e.target.value as StatutPatch)} className={champClasses}>
              {(['Reçu', 'En analyse', 'En recette', 'Validé', 'Déployé', 'En attente', 'Rejeté'] as StatutPatch[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          {statutCible === 'Rejeté' && (
            <Field label="Motif du rejet">
              <textarea value={motifRejet} onChange={(e) => setMotifRejet(e.target.value)} rows={3} className={champClasses} />
            </Field>
          )}
        </div>
      </Drawer>
    </div>
  );
}
