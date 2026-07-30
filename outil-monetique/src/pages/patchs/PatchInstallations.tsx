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
import { cahiersDeTestRepo, environnementsRepo, installationsPatchRepo, iterationsRepo, personnesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { InstallationPatch, Patch, StatutInstallation } from '../../lib/types';

const toneStatutInstallation: Record<StatutInstallation, BadgeTone> = {
  Installé: 'success',
  Échec: 'critical',
  Annulé: 'neutral',
};

interface FormInstallation {
  environnementId: string;
  dateInstallation: string;
  installeParId: string;
  statut: StatutInstallation;
  resultat: string;
  iterationTestLiee: string;
}

function formVide(defautResponsable: string): FormInstallation {
  return {
    environnementId: '',
    dateInstallation: new Date().toISOString().slice(0, 10),
    installeParId: defautResponsable,
    statut: 'Installé',
    resultat: '',
    iterationTestLiee: '',
  };
}

export function PatchInstallations({ patch, installations, recharger }: { patch: Patch; installations: InstallationPatch[]; recharger: () => void }) {
  const { items: environnements } = useRepositoryList(environnementsRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const { items: iterations } = useRepositoryList(iterationsRepo);
  const { items: cahiers } = useRepositoryList(cahiersDeTestRepo);
  const utilisateurCourant = useUtilisateurCourant();

  const installationsPatch = installations.filter((i) => i.patchId === patch.id).sort((a, b) => b.dateInstallation.localeCompare(a.dateInstallation));

  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState<FormInstallation>(formVide(patch.responsableId));

  const nomEnvironnement = (id: string) => environnements.find((e) => e.id === id)?.nom ?? '—';
  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? '—';
  const libelleIteration = (id?: string) => {
    if (!id) return '—';
    const iteration = iterations.find((it) => it.id === id);
    if (!iteration) return '—';
    const cahier = cahiers.find((c) => c.id === iteration.cahierId);
    return `${cahier?.nom ?? '—'} — n°${iteration.numero}`;
  };

  function ouvrirCreation() {
    setForm(formVide(patch.responsableId));
    setOuvert(true);
  }

  async function enregistrer() {
    if (!form.environnementId || !utilisateurCourant) return;
    await installationsPatchRepo.create({
      ...champsAudit(utilisateurCourant.id),
      patchId: patch.id,
      environnementId: form.environnementId,
      dateInstallation: form.dateInstallation,
      installeParId: form.installeParId,
      statut: form.statut,
      resultat: form.resultat || undefined,
      iterationTestLiee: form.iterationTestLiee || undefined,
    });
    await tracer(
      'patch',
      patch.id,
      'modification',
      utilisateurCourant.id,
      `Installation enregistrée sur ${nomEnvironnement(form.environnementId)} (${form.statut}).`
    );
    setOuvert(false);
    recharger();
  }

  return (
    <>
      <Card
        title="Installations"
        actions={
          <button
            type="button"
            onClick={ouvrirCreation}
            className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700"
          >
            <Plus className="w-4 h-4" /> Enregistrer une installation
          </button>
        }
      >
        {installationsPatch.length === 0 ? (
          <EmptyState message="Aucune installation enregistrée pour ce patch." />
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-border text-xs font-semibold text-ink-tertiary uppercase tracking-wide">
                  <th className="text-left px-3 py-2">Environnement</th>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Installé par</th>
                  <th className="text-left px-3 py-2">Statut</th>
                  <th className="text-left px-3 py-2">Résultat</th>
                  <th className="text-left px-3 py-2">Itération liée</th>
                </tr>
              </thead>
              <tbody>
                {installationsPatch.map((installation) => (
                  <tr key={installation.id} className="border-b border-surface-border last:border-0">
                    <td className="px-3 py-2.5 font-medium text-ink-primary">{nomEnvironnement(installation.environnementId)}</td>
                    <td className="px-3 py-2.5">{formatDate(installation.dateInstallation)}</td>
                    <td className="px-3 py-2.5">{nomPersonne(installation.installeParId)}</td>
                    <td className="px-3 py-2.5">
                      <Badge label={installation.statut} tone={toneStatutInstallation[installation.statut]} />
                    </td>
                    <td className="px-3 py-2.5 text-ink-secondary">{installation.resultat ?? '—'}</td>
                    <td className="px-3 py-2.5 text-ink-secondary">{libelleIteration(installation.iterationTestLiee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Enregistrer une installation"
        footer={
          <button type="button" onClick={enregistrer} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
            Enregistrer
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Environnement">
            <select value={form.environnementId} onChange={(e) => setForm({ ...form, environnementId: e.target.value })} className={champClasses}>
              <option value="" disabled>
                Choisir…
              </option>
              {environnements.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.nom}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date d'installation">
              <input type="date" value={form.dateInstallation} onChange={(e) => setForm({ ...form, dateInstallation: e.target.value })} className={champClasses} />
            </Field>
            <Field label="Statut">
              <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as StatutInstallation })} className={champClasses}>
                {(['Installé', 'Échec', 'Annulé'] as StatutInstallation[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Installé par">
            <select value={form.installeParId} onChange={(e) => setForm({ ...form, installeParId: e.target.value })} className={champClasses}>
              {personnes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Itération de test liée (optionnel)">
            <select value={form.iterationTestLiee} onChange={(e) => setForm({ ...form, iterationTestLiee: e.target.value })} className={champClasses}>
              <option value="">Aucune</option>
              {iterations.map((it) => (
                <option key={it.id} value={it.id}>
                  {libelleIteration(it.id)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Résultat">
            <textarea value={form.resultat} onChange={(e) => setForm({ ...form, resultat: e.target.value })} rows={3} className={champClasses} />
          </Field>
        </div>
      </Drawer>
    </>
  );
}
