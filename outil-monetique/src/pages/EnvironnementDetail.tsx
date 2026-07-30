import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { champClasses } from '../components/ui/Field';
import { tracer } from '../lib/journal';
import { useUtilisateurCourant } from '../lib/currentUser';
import {
  entitesRepo,
  droitsEnvironnementRepo,
  environnementsRepo,
  personnesRepo,
  restaurationsRepo,
  versionsProductionRepo,
} from '../lib/repositories';
import { useRepositoryList } from '../lib/useRepositoryList';
import type { StatutEnvironnement } from '../lib/types';
import { toneStatutEnvironnement } from './Environnements';
import { EnvironnementFormDrawer } from './environnements/EnvironnementFormDrawer';
import { EnvironnementApercu } from './environnements/EnvironnementApercu';
import { EnvironnementDroits } from './environnements/EnvironnementDroits';
import { EnvironnementRestaurations } from './environnements/EnvironnementRestaurations';
import { EnvironnementVersions } from './environnements/EnvironnementVersions';
import { EnvironnementObjetsLies } from './environnements/EnvironnementObjetsLies';
import { EnvironnementHistorique } from './environnements/EnvironnementHistorique';

const onglets = [
  { cle: 'apercu', libelle: 'Aperçu' },
  { cle: 'droits', libelle: 'Droits' },
  { cle: 'restaurations', libelle: 'Restaurations' },
  { cle: 'versions', libelle: 'Versions et écarts' },
  { cle: 'elements', libelle: 'Objets liés' },
  { cle: 'historique', libelle: 'Historique' },
];

export function EnvironnementDetail() {
  const { id = '' } = useParams();
  const utilisateurCourant = useUtilisateurCourant();

  const { items: environnements, recharger: rechargerEnvironnements } = useRepositoryList(environnementsRepo);
  const { items: entites } = useRepositoryList(entitesRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const { items: droits, recharger: rechargerDroits } = useRepositoryList(droitsEnvironnementRepo);
  const { items: restaurations, recharger: rechargerRestaurations } = useRepositoryList(restaurationsRepo);
  const { items: versions } = useRepositoryList(versionsProductionRepo);

  const [ongletActif, setOngletActif] = useState('apercu');
  const [editionOuverte, setEditionOuverte] = useState(false);

  const environnement = environnements.find((e) => e.id === id);

  if (!environnement) {
    return <p className="text-sm text-ink-tertiary">Chargement de l'environnement…</p>;
  }

  async function changerStatut(statut: StatutEnvironnement) {
    if (!utilisateurCourant || statut === environnement!.statut) return;
    await environnementsRepo.update(environnement!.id, { statut, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
    await tracer('environnement', environnement!.id, 'changement de statut', utilisateurCourant.id, `Statut changé de « ${environnement!.statut} » à « ${statut} ».`);
    rechargerEnvironnements();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-[28px] font-extrabold text-ink-primary text-balance">{environnement.nom}</h1>
            <Badge label={environnement.statut} tone={toneStatutEnvironnement[environnement.statut]} />
          </div>
          <p className="text-sm text-ink-secondary">{environnement.type}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={environnement.statut}
            onChange={(e) => changerStatut(e.target.value as StatutEnvironnement)}
            className={`${champClasses} w-auto`}
            title="Changer le statut"
          >
            {(['Disponible', 'Occupé', 'Indisponible', 'En restauration'] as StatutEnvironnement[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setEditionOuverte(true)}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700"
          >
            <Pencil className="w-3.5 h-3.5" /> Modifier
          </button>
        </div>
      </div>

      <Tabs onglets={onglets} actif={ongletActif} onChange={setOngletActif} />

      {ongletActif === 'apercu' && <EnvironnementApercu environnement={environnement} entites={entites} personnes={personnes} />}
      {ongletActif === 'droits' && <EnvironnementDroits environnement={environnement} droits={droits} recharger={rechargerDroits} />}
      {ongletActif === 'restaurations' && (
        <EnvironnementRestaurations environnement={environnement} restaurations={restaurations} recharger={rechargerRestaurations} />
      )}
      {ongletActif === 'versions' && <EnvironnementVersions environnement={environnement} versions={versions} recharger={rechargerEnvironnements} />}
      {ongletActif === 'elements' && <EnvironnementObjetsLies environnement={environnement} />}
      {ongletActif === 'historique' && <EnvironnementHistorique environnement={environnement} personnes={personnes} />}

      <EnvironnementFormDrawer
        open={editionOuverte}
        onClose={() => setEditionOuverte(false)}
        environnement={environnement}
        onSaved={() => rechargerEnvironnements()}
      />
    </div>
  );
}
