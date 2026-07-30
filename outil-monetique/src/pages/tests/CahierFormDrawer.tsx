import { useEffect, useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { cahiersDeTestRepo, entitesRepo, modulesRepo, personnesRepo, projetsRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { champsAudit } from '../../lib/repository';
import { tracer } from '../../lib/journal';
import type { CahierDeTest, StatutCahierTest } from '../../lib/types';

interface FormCahier {
  nom: string;
  projetId: string;
  perimetre: string;
  entiteIds: string[];
  moduleIds: string[];
  statut: StatutCahierTest;
  responsableId: string;
}

function versForm(cahier?: CahierDeTest): FormCahier {
  return {
    nom: cahier?.nom ?? '',
    projetId: cahier?.projetId ?? '',
    perimetre: cahier?.perimetre ?? '',
    entiteIds: cahier?.entiteIds ?? [],
    moduleIds: cahier?.moduleIds ?? [],
    statut: cahier?.statut ?? 'Brouillon',
    responsableId: cahier?.responsableId ?? '',
  };
}

interface CahierFormDrawerProps {
  open: boolean;
  onClose: () => void;
  cahier?: CahierDeTest;
  onSaved: (id: string) => void;
}

export function CahierFormDrawer({ open, onClose, cahier, onSaved }: CahierFormDrawerProps) {
  const { items: projets } = useRepositoryList(projetsRepo);
  const { items: entites } = useRepositoryList(entitesRepo);
  const { items: modules } = useRepositoryList(modulesRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const utilisateurCourant = useUtilisateurCourant();
  const [form, setForm] = useState<FormCahier>(versForm(cahier));

  useEffect(() => {
    setForm(versForm(cahier));
  }, [cahier, open]);

  function basculer(liste: string[], valeur: string): string[] {
    return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur];
  }

  async function enregistrer() {
    if (!form.nom.trim() || !form.responsableId || !utilisateurCourant) return;
    const donnees = {
      nom: form.nom,
      projetId: form.projetId || undefined,
      perimetre: form.perimetre,
      entiteIds: form.entiteIds,
      moduleIds: form.moduleIds,
      statut: form.statut,
      responsableId: form.responsableId,
    };
    if (cahier) {
      await cahiersDeTestRepo.update(cahier.id, { ...donnees, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
      await tracer('cahierTest', cahier.id, 'modification', utilisateurCourant.id, `Modification du cahier « ${donnees.nom} ».`);
      onSaved(cahier.id);
    } else {
      const cree = await cahiersDeTestRepo.create({ ...champsAudit(utilisateurCourant.id), ...donnees });
      await tracer('cahierTest', cree.id, 'création', utilisateurCourant.id, `Création du cahier de test « ${donnees.nom} ».`);
      onSaved(cree.id);
    }
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={cahier ? 'Modifier le cahier' : 'Nouveau cahier de test'}
      footer={
        <button type="button" onClick={enregistrer} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
          Enregistrer
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nom">
          <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={champClasses} />
        </Field>
        <Field label="Périmètre">
          <textarea value={form.perimetre} onChange={(e) => setForm({ ...form, perimetre: e.target.value })} rows={3} className={champClasses} />
        </Field>
        <Field label="Projet lié (optionnel)">
          <select value={form.projetId} onChange={(e) => setForm({ ...form, projetId: e.target.value })} className={champClasses}>
            <option value="">Aucun</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Statut">
          <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as StatutCahierTest })} className={champClasses}>
            {(['Brouillon', 'En cours', 'Clôturé'] as StatutCahierTest[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Responsable">
          <select value={form.responsableId} onChange={(e) => setForm({ ...form, responsableId: e.target.value })} className={champClasses}>
            <option value="" disabled>
              Choisir…
            </option>
            {personnes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Entités concernées">
          <div className="flex flex-wrap gap-2">
            {entites.map((entite) => (
              <label
                key={entite.id}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                  form.entiteIds.includes(entite.id) ? 'bg-boa-navy text-white border-boa-navy' : 'border-surface-border text-ink-secondary'
                }`}
              >
                <input type="checkbox" className="hidden" checked={form.entiteIds.includes(entite.id)} onChange={() => setForm({ ...form, entiteIds: basculer(form.entiteIds, entite.id) })} />
                {entite.code}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Modules concernés">
          <div className="flex flex-wrap gap-2">
            {modules.map((module_) => (
              <label
                key={module_.id}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                  form.moduleIds.includes(module_.id) ? 'bg-boa-violet text-white border-boa-violet' : 'border-surface-border text-ink-secondary'
                }`}
              >
                <input type="checkbox" className="hidden" checked={form.moduleIds.includes(module_.id)} onChange={() => setForm({ ...form, moduleIds: basculer(form.moduleIds, module_.id) })} />
                {module_.nom}
              </label>
            ))}
          </div>
        </Field>
      </div>
    </Drawer>
  );
}
