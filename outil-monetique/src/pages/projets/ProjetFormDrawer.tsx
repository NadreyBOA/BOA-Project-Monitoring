import { useEffect, useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { entitesRepo, personnesRepo, projetsRepo, reseauxRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { champsAudit } from '../../lib/repository';
import { tracer } from '../../lib/journal';
import type { Projet, PrioriteProjet, StatutProjet } from '../../lib/types';

interface FormProjet {
  nom: string;
  description: string;
  statut: StatutProjet;
  responsableId: string;
  entiteIds: string[];
  reseauIds: string[];
  dateDebut: string;
  dateFinCible: string;
  priorite: PrioriteProjet;
  budgetAlloue: string;
  tags: string;
}

function versForm(projet?: Projet): FormProjet {
  return {
    nom: projet?.nom ?? '',
    description: projet?.description ?? '',
    statut: projet?.statut ?? 'Cadrage',
    responsableId: projet?.responsableId ?? '',
    entiteIds: projet?.entiteIds ?? [],
    reseauIds: projet?.reseauIds ?? [],
    dateDebut: projet?.dateDebut ?? new Date().toISOString().slice(0, 10),
    dateFinCible: projet?.dateFinCible ?? '',
    priorite: projet?.priorite ?? 'Moyenne',
    budgetAlloue: projet ? String(projet.budgetAlloue) : '0',
    tags: projet?.tags.join(', ') ?? '',
  };
}

interface ProjetFormDrawerProps {
  open: boolean;
  onClose: () => void;
  projet?: Projet;
  onSaved: (id: string) => void;
}

export function ProjetFormDrawer({ open, onClose, projet, onSaved }: ProjetFormDrawerProps) {
  const { items: entites } = useRepositoryList(entitesRepo);
  const { items: reseaux } = useRepositoryList(reseauxRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const utilisateurCourant = useUtilisateurCourant();
  const [form, setForm] = useState<FormProjet>(versForm(projet));

  useEffect(() => {
    setForm(versForm(projet));
  }, [projet, open]);

  function basculerDansListe(liste: string[], valeur: string): string[] {
    return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur];
  }

  async function enregistrer() {
    if (!form.nom.trim() || !form.responsableId || !utilisateurCourant) return;
    const donnees = {
      nom: form.nom,
      description: form.description,
      statut: form.statut,
      responsableId: form.responsableId,
      entiteIds: form.entiteIds,
      reseauIds: form.reseauIds,
      dateDebut: form.dateDebut,
      dateFinCible: form.dateFinCible,
      priorite: form.priorite,
      budgetAlloue: Number(form.budgetAlloue) || 0,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (projet) {
      await projetsRepo.update(projet.id, { ...donnees, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
      await tracer('projet', projet.id, 'modification', utilisateurCourant.id, `Modification du projet « ${donnees.nom} ».`);
      onSaved(projet.id);
    } else {
      const cree = await projetsRepo.create({
        ...champsAudit(utilisateurCourant.id),
        ...donnees,
        avancement: 0,
      });
      await tracer('projet', cree.id, 'création', utilisateurCourant.id, `Création du projet « ${donnees.nom} ».`);
      onSaved(cree.id);
    }
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={projet ? 'Modifier le projet' : 'Nouveau projet'}
      footer={
        <button
          type="button"
          onClick={enregistrer}
          className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700 transition-colors"
        >
          Enregistrer
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nom">
          <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={champClasses} />
        </Field>
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={champClasses}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Statut">
            <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as StatutProjet })} className={champClasses}>
              {(['Cadrage', 'En cours', 'En pause', 'Clôturé', 'Annulé'] as StatutProjet[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priorité">
            <select value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value as PrioriteProjet })} className={champClasses}>
              {(['Basse', 'Moyenne', 'Haute', 'Critique'] as PrioriteProjet[]).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>

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
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.entiteIds.includes(entite.id)}
                  onChange={() => setForm({ ...form, entiteIds: basculerDansListe(form.entiteIds, entite.id) })}
                />
                {entite.code}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Réseaux concernés">
          <div className="flex flex-wrap gap-2">
            {reseaux.map((reseau) => (
              <label
                key={reseau.id}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                  form.reseauIds.includes(reseau.id) ? 'bg-boa-violet text-white border-boa-violet' : 'border-surface-border text-ink-secondary'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.reseauIds.includes(reseau.id)}
                  onChange={() => setForm({ ...form, reseauIds: basculerDansListe(form.reseauIds, reseau.id) })}
                />
                {reseau.nom}
              </label>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date de début">
            <input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} className={champClasses} />
          </Field>
          <Field label="Date cible">
            <input
              type="date"
              value={form.dateFinCible}
              onChange={(e) => setForm({ ...form, dateFinCible: e.target.value })}
              className={champClasses}
            />
          </Field>
        </div>

        <Field label="Budget alloué (FCFA)">
          <input
            type="number"
            value={form.budgetAlloue}
            onChange={(e) => setForm({ ...form, budgetAlloue: e.target.value })}
            className={champClasses}
          />
        </Field>

        <Field label="Tags (séparés par une virgule)">
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={champClasses} />
        </Field>
      </div>
    </Drawer>
  );
}
