import { useEffect, useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { elementsATesterRepo, modulesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { champsAudit } from '../../lib/repository';
import { tracer } from '../../lib/journal';
import type { Criticite, ElementATester } from '../../lib/types';

interface FormElement {
  libelle: string;
  moduleId: string;
  description: string;
  criticite: Criticite;
}

function versForm(element?: ElementATester): FormElement {
  return {
    libelle: element?.libelle ?? '',
    moduleId: element?.moduleId ?? '',
    description: element?.description ?? '',
    criticite: element?.criticite ?? 'Moyenne',
  };
}

interface ElementFormDrawerProps {
  open: boolean;
  onClose: () => void;
  cahierId: string;
  element?: ElementATester;
  onSaved: () => void;
}

export function ElementFormDrawer({ open, onClose, cahierId, element, onSaved }: ElementFormDrawerProps) {
  const { items: modules } = useRepositoryList(modulesRepo);
  const utilisateurCourant = useUtilisateurCourant();
  const [form, setForm] = useState<FormElement>(versForm(element));

  useEffect(() => {
    setForm(versForm(element));
  }, [element, open]);

  async function enregistrer() {
    if (!form.libelle.trim() || !form.moduleId || !utilisateurCourant) return;
    if (element) {
      await elementsATesterRepo.update(element.id, { ...form, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
      await tracer('cahierTest', cahierId, 'modification', utilisateurCourant.id, `Élément « ${form.libelle} » modifié.`);
    } else {
      await elementsATesterRepo.create({ ...champsAudit(utilisateurCourant.id), cahierId, ...form });
      await tracer('cahierTest', cahierId, 'modification', utilisateurCourant.id, `Élément à tester « ${form.libelle} » ajouté.`);
    }
    onSaved();
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={element ? "Modifier l'élément" : 'Nouvel élément à tester'}
      footer={
        <button type="button" onClick={enregistrer} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
          Enregistrer
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Libellé">
          <input value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} className={champClasses} />
        </Field>
        <Field label="Module">
          <select value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })} className={champClasses}>
            <option value="" disabled>
              Choisir…
            </option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={champClasses} />
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
    </Drawer>
  );
}
