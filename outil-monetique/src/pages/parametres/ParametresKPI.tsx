import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Colonne } from '../../components/ui/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { parametresKPIRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { ParametreKPI } from '../../lib/types';

export function ParametresKPI() {
  const { items: parametres, recharger } = useRepositoryList(parametresKPIRepo);
  const [parametreEnEdition, setParametreEnEdition] = useState<ParametreKPI | null>(null);
  const [valeur, setValeur] = useState('');

  function ouvrirEdition(parametre: ParametreKPI) {
    setParametreEnEdition(parametre);
    setValeur(String(parametre.valeur));
  }

  async function enregistrer() {
    if (!parametreEnEdition) return;
    const nombre = Number(valeur);
    if (Number.isNaN(nombre)) return;
    await parametresKPIRepo.update(parametreEnEdition.id, { valeur: nombre });
    setParametreEnEdition(null);
    recharger();
  }

  const colonnes: Colonne<ParametreKPI>[] = [
    { cle: 'libelle', entete: 'Paramètre', rendu: (p) => p.libelle, tri: (a, b) => a.libelle.localeCompare(b.libelle) },
    {
      cle: 'valeur',
      entete: 'Valeur',
      rendu: (p) => (
        <span className="font-semibold tabular-nums">
          {p.valeur}
          {p.unite ? ` ${p.unite}` : ''}
        </span>
      ),
    },
    {
      cle: 'actions',
      entete: '',
      rendu: (p) => (
        <div className="flex justify-end">
          <button type="button" onClick={() => ouvrirEdition(p)} className="text-xs font-semibold text-boa-navy hover:underline">
            Modifier
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card title="Paramètres de calcul des KPI">
        <p className="text-sm text-ink-secondary -mt-1">
          Seuils et cibles utilisés par les indicateurs du tableau de bord et des modules (voir cahier, section 8).
        </p>
        <DataTable colonnes={colonnes} lignes={parametres} cleLigne={(p) => p.id} messageVide="Aucun paramètre KPI enregistré." />
      </Card>

      <Drawer
        open={parametreEnEdition !== null}
        onClose={() => setParametreEnEdition(null)}
        title={parametreEnEdition?.libelle ?? ''}
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
        {parametreEnEdition && (
          <div className="flex flex-col gap-4">
            {parametreEnEdition.description && <p className="text-sm text-ink-secondary">{parametreEnEdition.description}</p>}
            <Field label={`Valeur${parametreEnEdition.unite ? ` (${parametreEnEdition.unite})` : ''}`}>
              <input
                type="number"
                value={valeur}
                onChange={(e) => setValeur(e.target.value)}
                className={champClasses}
              />
            </Field>
          </div>
        )}
      </Drawer>
    </>
  );
}
