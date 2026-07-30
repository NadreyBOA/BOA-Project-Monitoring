import { useEffect, useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { entitesRepo, environnementsRepo, personnesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { champsAudit } from '../../lib/repository';
import { tracer } from '../../lib/journal';
import type { Environnement, StatutEnvironnement, TypeEnvironnement } from '../../lib/types';

interface FormEnvironnement {
  nom: string;
  type: TypeEnvironnement;
  entiteId: string;
  statut: StatutEnvironnement;
  versionReference: string;
  versionDate: string;
  description: string;
  responsableId: string;
}

function versForm(env?: Environnement): FormEnvironnement {
  return {
    nom: env?.nom ?? '',
    type: env?.type ?? 'Test',
    entiteId: env?.entiteId ?? '',
    statut: env?.statut ?? 'Disponible',
    versionReference: env?.versionProdDeployee.reference ?? '',
    versionDate: env?.versionProdDeployee.date ?? new Date().toISOString().slice(0, 10),
    description: env?.description ?? '',
    responsableId: env?.responsableId ?? '',
  };
}

interface EnvironnementFormDrawerProps {
  open: boolean;
  onClose: () => void;
  environnement?: Environnement;
  onSaved: (id: string) => void;
}

export function EnvironnementFormDrawer({ open, onClose, environnement, onSaved }: EnvironnementFormDrawerProps) {
  const { items: entites } = useRepositoryList(entitesRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const utilisateurCourant = useUtilisateurCourant();
  const [form, setForm] = useState<FormEnvironnement>(versForm(environnement));

  useEffect(() => {
    setForm(versForm(environnement));
  }, [environnement, open]);

  async function enregistrer() {
    if (!form.nom.trim() || !form.responsableId || !utilisateurCourant) return;
    const donnees = {
      nom: form.nom,
      type: form.type,
      entiteId: form.entiteId || undefined,
      statut: form.statut,
      versionProdDeployee: { reference: form.versionReference, date: form.versionDate },
      description: form.description,
      responsableId: form.responsableId,
    };
    if (environnement) {
      await environnementsRepo.update(environnement.id, { ...donnees, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
      await tracer('environnement', environnement.id, 'modification', utilisateurCourant.id, `Modification de l'environnement « ${donnees.nom} ».`);
      onSaved(environnement.id);
    } else {
      const cree = await environnementsRepo.create({ ...champsAudit(utilisateurCourant.id), ...donnees });
      await tracer('environnement', cree.id, 'création', utilisateurCourant.id, `Création de l'environnement « ${donnees.nom} ».`);
      onSaved(cree.id);
    }
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={environnement ? "Modifier l'environnement" : 'Nouvel environnement'}
      footer={
        <button type="button" onClick={enregistrer} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
          Enregistrer
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nom">
          <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="ex. RECETTE-GROUPE-01" className={champClasses} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TypeEnvironnement })} className={champClasses}>
              {(['Test', 'Recette', 'Préproduction', 'Formation', 'Iso-production'] as TypeEnvironnement[]).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Statut">
            <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as StatutEnvironnement })} className={champClasses}>
              {(['Disponible', 'Occupé', 'Indisponible', 'En restauration'] as StatutEnvironnement[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Entité (laisser vide pour un périmètre Groupe)">
          <select value={form.entiteId} onChange={(e) => setForm({ ...form, entiteId: e.target.value })} className={champClasses}>
            <option value="">Groupe</option>
            {entites.map((entite) => (
              <option key={entite.id} value={entite.id}>
                {entite.nom}
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Version de prod reflétée">
            <input value={form.versionReference} onChange={(e) => setForm({ ...form, versionReference: e.target.value })} placeholder="ex. PROD-2026.06" className={champClasses} />
          </Field>
          <Field label="Date de cette version">
            <input type="date" value={form.versionDate} onChange={(e) => setForm({ ...form, versionDate: e.target.value })} className={champClasses} />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={champClasses} />
        </Field>
      </div>
    </Drawer>
  );
}
