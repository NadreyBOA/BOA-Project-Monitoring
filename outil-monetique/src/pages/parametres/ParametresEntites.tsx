import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Colonne } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { entitesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Entite, SchemaConnectivite } from '../../lib/types';

interface FormEntite {
  code: string;
  nom: string;
  schemaConnectivite: SchemaConnectivite;
}

const formVide: FormEntite = { code: '', nom: '', schemaConnectivite: 'A' };

export function ParametresEntites() {
  const { items: entites, recharger } = useRepositoryList(entitesRepo);
  const [entiteEnEdition, setEntiteEnEdition] = useState<Entite | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState<FormEntite>(formVide);

  function ouvrirCreation() {
    setEntiteEnEdition(null);
    setForm(formVide);
    setOuvert(true);
  }

  function ouvrirEdition(entite: Entite) {
    setEntiteEnEdition(entite);
    setForm({ code: entite.code, nom: entite.nom, schemaConnectivite: entite.schemaConnectivite });
    setOuvert(true);
  }

  async function enregistrer() {
    if (!form.code.trim() || !form.nom.trim()) return;
    if (entiteEnEdition) {
      await entitesRepo.update(entiteEnEdition.id, {
        code: form.code.toUpperCase() as Entite['code'],
        nom: form.nom,
        schemaConnectivite: form.schemaConnectivite,
      });
    } else {
      await entitesRepo.create({
        code: form.code.toUpperCase() as Entite['code'],
        nom: form.nom,
        schemaConnectivite: form.schemaConnectivite,
        actif: true,
      });
    }
    setOuvert(false);
    recharger();
  }

  async function basculerActif(entite: Entite) {
    await entitesRepo.update(entite.id, { actif: !entite.actif });
    recharger();
  }

  const colonnes: Colonne<Entite>[] = [
    { cle: 'code', entete: 'Code', rendu: (e) => <span className="font-mono font-semibold">{e.code}</span>, tri: (a, b) => a.code.localeCompare(b.code) },
    { cle: 'nom', entete: 'Nom', rendu: (e) => e.nom, tri: (a, b) => a.nom.localeCompare(b.nom) },
    { cle: 'schema', entete: 'Schéma de connectivité', rendu: (e) => e.schemaConnectivite },
    { cle: 'statut', entete: 'Statut', rendu: (e) => <Badge label={e.actif ? 'Active' : 'Inactive'} tone={e.actif ? 'success' : 'neutral'} /> },
    {
      cle: 'actions',
      entete: '',
      rendu: (e) => (
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => ouvrirEdition(e)} className="text-xs font-semibold text-boa-navy hover:underline">
            Modifier
          </button>
          <button type="button" onClick={() => basculerActif(e)} className="text-xs font-semibold text-ink-secondary hover:underline">
            {e.actif ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Entités"
        actions={
          <button
            type="button"
            onClick={ouvrirCreation}
            className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouvelle entité
          </button>
        }
      >
        <DataTable colonnes={colonnes} lignes={entites} cleLigne={(e) => e.id} messageVide="Aucune entité enregistrée." />
      </Card>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={entiteEnEdition ? "Modifier l'entité" : 'Nouvelle entité'}
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
          <Field label="Code">
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              maxLength={4}
              placeholder="ex. CI"
              className={champClasses}
            />
          </Field>
          <Field label="Nom">
            <input
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="ex. Côte d'Ivoire"
              className={champClasses}
            />
          </Field>
          <Field label="Schéma de connectivité">
            <select
              value={form.schemaConnectivite}
              onChange={(e) => setForm({ ...form, schemaConnectivite: e.target.value as SchemaConnectivite })}
              className={champClasses}
            >
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </Field>
        </div>
      </Drawer>
    </>
  );
}
