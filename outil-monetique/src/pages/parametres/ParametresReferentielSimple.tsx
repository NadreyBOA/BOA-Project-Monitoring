import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Colonne } from '../../components/ui/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Repository } from '../../lib/repository';

interface EntreeNommee {
  id: string;
  nom: string;
}

interface ParametresReferentielSimpleProps {
  titre: string;
  boutonLibelle: string;
  placeholder: string;
  repo: Repository<EntreeNommee>;
}

/**
 * Référentiel générique {id, nom} — utilisé pour Réseaux, Modules et Éditeurs.
 * Pas de suppression : ces valeurs sont référencées par id depuis d'autres
 * modules (patchs, projets...), donc seuls la création et le renommage sont
 * proposés pour préserver l'intégrité des références existantes.
 */
export function ParametresReferentielSimple({ titre, boutonLibelle, placeholder, repo }: ParametresReferentielSimpleProps) {
  const { items, recharger } = useRepositoryList(repo);
  const [entreeEnEdition, setEntreeEnEdition] = useState<EntreeNommee | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState('');

  function ouvrirCreation() {
    setEntreeEnEdition(null);
    setNom('');
    setOuvert(true);
  }

  function ouvrirEdition(entree: EntreeNommee) {
    setEntreeEnEdition(entree);
    setNom(entree.nom);
    setOuvert(true);
  }

  async function enregistrer() {
    if (!nom.trim()) return;
    if (entreeEnEdition) {
      await repo.update(entreeEnEdition.id, { nom });
    } else {
      await repo.create({ nom });
    }
    setOuvert(false);
    recharger();
  }

  const colonnes: Colonne<EntreeNommee>[] = [
    { cle: 'nom', entete: 'Nom', rendu: (e) => e.nom, tri: (a, b) => a.nom.localeCompare(b.nom) },
    {
      cle: 'actions',
      entete: '',
      rendu: (e) => (
        <div className="flex justify-end">
          <button type="button" onClick={() => ouvrirEdition(e)} className="text-xs font-semibold text-boa-navy hover:underline">
            Renommer
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title={titre}
        actions={
          <button
            type="button"
            onClick={ouvrirCreation}
            className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> {boutonLibelle}
          </button>
        }
      >
        <DataTable colonnes={colonnes} lignes={items} cleLigne={(e) => e.id} messageVide="Aucune entrée enregistrée." />
      </Card>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={entreeEnEdition ? 'Renommer' : boutonLibelle}
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
        <Field label="Nom">
          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder={placeholder} className={champClasses} />
        </Field>
      </Drawer>
    </>
  );
}
