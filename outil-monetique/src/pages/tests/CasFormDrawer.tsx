import { useEffect, useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { casDeTestRepo } from '../../lib/repositories';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { champsAudit } from '../../lib/repository';
import { tracer } from '../../lib/journal';
import type { CasDeTest, StatutCasDeTest } from '../../lib/types';

interface FormCas {
  reference: string;
  titre: string;
  preconditions: string;
  etapes: string;
  resultatAttendu: string;
  donneesTest: string;
  statut: StatutCasDeTest;
}

function versForm(cas?: CasDeTest): FormCas {
  return {
    reference: cas?.reference ?? '',
    titre: cas?.titre ?? '',
    preconditions: cas?.preconditions ?? '',
    etapes: cas?.etapes.join('\n') ?? '',
    resultatAttendu: cas?.resultatAttendu ?? '',
    donneesTest: cas?.donneesTest ?? '',
    statut: cas?.statut ?? 'Non exécuté',
  };
}

interface CasFormDrawerProps {
  open: boolean;
  onClose: () => void;
  cahierId: string;
  elementId: string;
  cas?: CasDeTest;
  dupliquerDepuis?: CasDeTest;
  onSaved: () => void;
}

export function CasFormDrawer({ open, onClose, cahierId, elementId, cas, dupliquerDepuis, onSaved }: CasFormDrawerProps) {
  const utilisateurCourant = useUtilisateurCourant();
  const [form, setForm] = useState<FormCas>(versForm(cas ?? dupliquerDepuis));

  useEffect(() => {
    setForm(versForm(cas ?? dupliquerDepuis));
  }, [cas, dupliquerDepuis, open]);

  async function enregistrer() {
    if (!form.reference.trim() || !form.titre.trim() || !utilisateurCourant) return;
    const donnees = {
      reference: form.reference,
      titre: form.titre,
      preconditions: form.preconditions,
      etapes: form.etapes.split('\n').map((e) => e.trim()).filter(Boolean),
      resultatAttendu: form.resultatAttendu,
      donneesTest: form.donneesTest || undefined,
      statut: form.statut,
    };
    if (cas) {
      await casDeTestRepo.update(cas.id, { ...donnees, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
      await tracer('cahierTest', cahierId, 'modification', utilisateurCourant.id, `Cas de test « ${donnees.titre} » modifié.`);
    } else {
      await casDeTestRepo.create({ ...champsAudit(utilisateurCourant.id), elementId, ...donnees });
      await tracer(
        'cahierTest',
        cahierId,
        'modification',
        utilisateurCourant.id,
        dupliquerDepuis ? `Cas de test « ${donnees.titre} » dupliqué depuis « ${dupliquerDepuis.titre} ».` : `Cas de test « ${donnees.titre} » ajouté.`
      );
    }
    onSaved();
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={cas ? 'Modifier le cas de test' : dupliquerDepuis ? 'Dupliquer le cas de test' : 'Nouveau cas de test'}
      footer={
        <button type="button" onClick={enregistrer} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
          Enregistrer
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Référence">
            <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="ex. CT-002" className={champClasses} />
          </Field>
          <Field label="Statut">
            <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as StatutCasDeTest })} className={champClasses}>
              {(['Non exécuté', 'Réussi', 'Échoué', 'Bloqué', 'Non applicable'] as StatutCasDeTest[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Titre">
          <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className={champClasses} />
        </Field>
        <Field label="Préconditions">
          <textarea value={form.preconditions} onChange={(e) => setForm({ ...form, preconditions: e.target.value })} rows={2} className={champClasses} />
        </Field>
        <Field label="Étapes (une par ligne)">
          <textarea value={form.etapes} onChange={(e) => setForm({ ...form, etapes: e.target.value })} rows={4} className={champClasses} />
        </Field>
        <Field label="Résultat attendu">
          <textarea value={form.resultatAttendu} onChange={(e) => setForm({ ...form, resultatAttendu: e.target.value })} rows={2} className={champClasses} />
        </Field>
        <Field label="Données de test">
          <input value={form.donneesTest} onChange={(e) => setForm({ ...form, donneesTest: e.target.value })} placeholder="ex. carte de test EMV n°..." className={champClasses} />
        </Field>
      </div>
    </Drawer>
  );
}
