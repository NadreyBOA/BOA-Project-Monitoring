import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Colonne } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { Avatar } from '../../components/ui/Avatar';
import { entitesRepo, personnesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Personne, RoleOutil } from '../../lib/types';

const libellesRole: Record<RoleOutil, string> = {
  ADMINISTRATEUR: 'Administrateur',
  COORDINATEUR: 'Coordinateur',
  TESTEUR: 'Testeur',
  OBSERVATEUR: 'Observateur',
};

interface FormPersonne {
  nom: string;
  email: string;
  entiteId: string;
  roleOutil: RoleOutil;
  fonction: string;
}

function formVide(entiteParDefaut: string): FormPersonne {
  return { nom: '', email: '', entiteId: entiteParDefaut, roleOutil: 'TESTEUR', fonction: '' };
}

export function ParametresPersonnes() {
  const { items: personnes, recharger } = useRepositoryList(personnesRepo);
  const { items: entites } = useRepositoryList(entitesRepo);
  const [personneEnEdition, setPersonneEnEdition] = useState<Personne | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState<FormPersonne>(formVide(''));

  const nomEntite = (id: string) => entites.find((e) => e.id === id)?.nom ?? '—';

  function ouvrirCreation() {
    setPersonneEnEdition(null);
    setForm(formVide(entites[0]?.id ?? ''));
    setOuvert(true);
  }

  function ouvrirEdition(personne: Personne) {
    setPersonneEnEdition(personne);
    setForm({
      nom: personne.nom,
      email: personne.email,
      entiteId: personne.entiteId,
      roleOutil: personne.roleOutil,
      fonction: personne.fonction,
    });
    setOuvert(true);
  }

  async function enregistrer() {
    if (!form.nom.trim() || !form.email.trim() || !form.entiteId) return;
    if (personneEnEdition) {
      await personnesRepo.update(personneEnEdition.id, { ...form });
    } else {
      await personnesRepo.create({ ...form, actif: true });
    }
    setOuvert(false);
    recharger();
  }

  async function basculerActif(personne: Personne) {
    await personnesRepo.update(personne.id, { actif: !personne.actif });
    recharger();
  }

  const colonnes: Colonne<Personne>[] = [
    {
      cle: 'nom',
      entete: 'Personne',
      rendu: (p) => (
        <div className="flex items-center gap-2.5">
          <Avatar nom={p.nom} taille={28} />
          <div>
            <div className="font-semibold text-ink-primary">{p.nom}</div>
            <div className="text-xs text-ink-tertiary">{p.email}</div>
          </div>
        </div>
      ),
      tri: (a, b) => a.nom.localeCompare(b.nom),
    },
    { cle: 'entite', entete: 'Entité', rendu: (p) => nomEntite(p.entiteId) },
    { cle: 'role', entete: 'Rôle outil', rendu: (p) => libellesRole[p.roleOutil] },
    { cle: 'fonction', entete: 'Fonction', rendu: (p) => p.fonction },
    { cle: 'statut', entete: 'Statut', rendu: (p) => <Badge label={p.actif ? 'Actif' : 'Inactif'} tone={p.actif ? 'success' : 'neutral'} /> },
    {
      cle: 'actions',
      entete: '',
      rendu: (p) => (
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => ouvrirEdition(p)} className="text-xs font-semibold text-boa-navy hover:underline">
            Modifier
          </button>
          <button type="button" onClick={() => basculerActif(p)} className="text-xs font-semibold text-ink-secondary hover:underline">
            {p.actif ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Personnes"
        actions={
          <button
            type="button"
            onClick={ouvrirCreation}
            className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouvelle personne
          </button>
        }
      >
        <DataTable colonnes={colonnes} lignes={personnes} cleLigne={(p) => p.id} messageVide="Aucune personne enregistrée." />
      </Card>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={personneEnEdition ? 'Modifier la personne' : 'Nouvelle personne'}
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
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="prenom.nom@boa.africa"
              className={champClasses}
            />
          </Field>
          <Field label="Entité">
            <select value={form.entiteId} onChange={(e) => setForm({ ...form, entiteId: e.target.value })} className={champClasses}>
              {entites.map((entite) => (
                <option key={entite.id} value={entite.id}>
                  {entite.nom}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rôle outil">
            <select
              value={form.roleOutil}
              onChange={(e) => setForm({ ...form, roleOutil: e.target.value as RoleOutil })}
              className={champClasses}
            >
              {Object.entries(libellesRole).map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fonction">
            <input
              value={form.fonction}
              onChange={(e) => setForm({ ...form, fonction: e.target.value })}
              placeholder="ex. Head SI Monétiques"
              className={champClasses}
            />
          </Field>
        </div>
      </Drawer>
    </>
  );
}
