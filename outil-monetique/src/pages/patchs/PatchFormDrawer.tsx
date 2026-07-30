import { useEffect, useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { editeursRepo, modulesRepo, patchsRepo, personnesRepo, projetsRepo, reseauxRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { champsAudit } from '../../lib/repository';
import { tracer } from '../../lib/journal';
import type { Criticite, Patch, TypePatch } from '../../lib/types';

interface FormPatch {
  reference: string;
  editeurId: string;
  moduleIds: string[];
  dateReception: string;
  contenu: string;
  type: TypePatch;
  criticite: Criticite;
  projetId: string;
  reseauIds: string[];
  responsableId: string;
  pieceJointe: string;
}

function versForm(patch?: Patch): FormPatch {
  return {
    reference: patch?.reference ?? '',
    editeurId: patch?.editeurId ?? '',
    moduleIds: patch?.moduleIds ?? [],
    dateReception: patch?.dateReception ?? new Date().toISOString().slice(0, 10),
    contenu: patch?.contenu ?? '',
    type: patch?.type ?? 'Correctif',
    criticite: patch?.criticite ?? 'Moyenne',
    projetId: patch?.projetId ?? '',
    reseauIds: patch?.reseauIds ?? [],
    responsableId: patch?.responsableId ?? '',
    pieceJointe: patch?.pieceJointe ?? '',
  };
}

interface PatchFormDrawerProps {
  open: boolean;
  onClose: () => void;
  patch?: Patch;
  onSaved: (id: string) => void;
}

export function PatchFormDrawer({ open, onClose, patch, onSaved }: PatchFormDrawerProps) {
  const { items: editeurs } = useRepositoryList(editeursRepo);
  const { items: modules } = useRepositoryList(modulesRepo);
  const { items: reseaux } = useRepositoryList(reseauxRepo);
  const { items: projets } = useRepositoryList(projetsRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const utilisateurCourant = useUtilisateurCourant();
  const [form, setForm] = useState<FormPatch>(versForm(patch));

  useEffect(() => {
    setForm(versForm(patch));
  }, [patch, open]);

  function basculer(liste: string[], valeur: string): string[] {
    return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur];
  }

  async function enregistrer() {
    if (!form.reference.trim() || !form.editeurId || !form.responsableId || !utilisateurCourant) return;
    const donnees = {
      reference: form.reference,
      editeurId: form.editeurId,
      moduleIds: form.moduleIds,
      dateReception: form.dateReception,
      contenu: form.contenu,
      type: form.type,
      criticite: form.criticite,
      projetId: form.projetId || undefined,
      reseauIds: form.reseauIds,
      responsableId: form.responsableId,
      pieceJointe: form.pieceJointe || undefined,
    };
    if (patch) {
      await patchsRepo.update(patch.id, { ...donnees, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
      await tracer('patch', patch.id, 'modification', utilisateurCourant.id, `Modification du patch « ${donnees.reference} ».`);
      onSaved(patch.id);
    } else {
      const cree = await patchsRepo.create({ ...champsAudit(utilisateurCourant.id), ...donnees, statut: 'Reçu' });
      await tracer('patch', cree.id, 'création', utilisateurCourant.id, `Patch « ${donnees.reference} » reçu.`);
      onSaved(cree.id);
    }
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={patch ? 'Modifier le patch' : 'Enregistrer un patch reçu'}
      footer={
        <button type="button" onClick={enregistrer} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
          Enregistrer
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Référence">
            <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="ex. SVFE-2026-0200" className={champClasses} />
          </Field>
          <Field label="Date de réception">
            <input type="date" value={form.dateReception} onChange={(e) => setForm({ ...form, dateReception: e.target.value })} className={champClasses} />
          </Field>
        </div>
        <Field label="Éditeur">
          <select value={form.editeurId} onChange={(e) => setForm({ ...form, editeurId: e.target.value })} className={champClasses}>
            <option value="" disabled>
              Choisir…
            </option>
            {editeurs.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.nom}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TypePatch })} className={champClasses}>
              {(['Correctif', 'Évolution', 'Réglementaire', 'Sécurité'] as TypePatch[]).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Criticité">
            <select value={form.criticite} onChange={(e) => setForm({ ...form, criticite: e.target.value as Criticite })} className={champClasses}>
              {(['Basse', 'Moyenne', 'Haute', 'Critique'] as Criticite[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Contenu (correctifs / évolutions)">
          <textarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} rows={3} className={champClasses} />
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
        <Field label="Modules concernés">
          <div className="flex flex-wrap gap-2">
            {modules.map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                  form.moduleIds.includes(m.id) ? 'bg-boa-navy text-white border-boa-navy' : 'border-surface-border text-ink-secondary'
                }`}
              >
                <input type="checkbox" className="hidden" checked={form.moduleIds.includes(m.id)} onChange={() => setForm({ ...form, moduleIds: basculer(form.moduleIds, m.id) })} />
                {m.nom}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Réseaux concernés">
          <div className="flex flex-wrap gap-2">
            {reseaux.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                  form.reseauIds.includes(r.id) ? 'bg-boa-violet text-white border-boa-violet' : 'border-surface-border text-ink-secondary'
                }`}
              >
                <input type="checkbox" className="hidden" checked={form.reseauIds.includes(r.id)} onChange={() => setForm({ ...form, reseauIds: basculer(form.reseauIds, r.id) })} />
                {r.nom}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Pièce jointe (nom de fichier ou lien)">
          <input value={form.pieceJointe} onChange={(e) => setForm({ ...form, pieceJointe: e.target.value })} className={champClasses} />
        </Field>
      </div>
    </Drawer>
  );
}
