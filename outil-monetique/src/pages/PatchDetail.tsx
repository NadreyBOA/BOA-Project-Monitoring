import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import {
  editeursRepo,
  installationsPatchRepo,
  modulesRepo,
  patchsRepo,
  personnesRepo,
  projetsRepo,
  reseauxRepo,
} from '../lib/repositories';
import { useRepositoryList } from '../lib/useRepositoryList';
import { toneStatutPatch } from './Patchs';
import { PatchFormDrawer } from './patchs/PatchFormDrawer';
import { PatchApercu } from './patchs/PatchApercu';
import { PatchCycleDeVie } from './patchs/PatchCycleDeVie';
import { PatchInstallations } from './patchs/PatchInstallations';
import { PatchHistorique } from './patchs/PatchHistorique';

const onglets = [
  { cle: 'apercu', libelle: 'Aperçu' },
  { cle: 'cycle', libelle: 'Statut et cycle de vie' },
  { cle: 'installations', libelle: 'Installations' },
  { cle: 'historique', libelle: 'Historique' },
];

export function PatchDetail() {
  const { id = '' } = useParams();
  const { items: patchs, recharger: rechargerPatchs } = useRepositoryList(patchsRepo);
  const { items: editeurs } = useRepositoryList(editeursRepo);
  const { items: modules } = useRepositoryList(modulesRepo);
  const { items: reseaux } = useRepositoryList(reseauxRepo);
  const { items: projets } = useRepositoryList(projetsRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const { items: installations, recharger: rechargerInstallations } = useRepositoryList(installationsPatchRepo);

  const [ongletActif, setOngletActif] = useState('apercu');
  const [editionOuverte, setEditionOuverte] = useState(false);

  const patch = patchs.find((p) => p.id === id);

  if (!patch) {
    return <p className="text-sm text-ink-tertiary">Chargement du patch…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-[28px] font-extrabold text-ink-primary text-balance font-mono">{patch.reference}</h1>
            <Badge label={patch.statut} tone={toneStatutPatch[patch.statut]} />
          </div>
          <p className="text-sm text-ink-secondary">{patch.type}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditionOuverte(true)}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700 shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" /> Modifier
        </button>
      </div>

      <Tabs onglets={onglets} actif={ongletActif} onChange={setOngletActif} />

      {ongletActif === 'apercu' && (
        <PatchApercu patch={patch} editeurs={editeurs} modules={modules} reseaux={reseaux} projets={projets} personnes={personnes} />
      )}
      {ongletActif === 'cycle' && <PatchCycleDeVie patch={patch} recharger={rechargerPatchs} />}
      {ongletActif === 'installations' && <PatchInstallations patch={patch} installations={installations} recharger={rechargerInstallations} />}
      {ongletActif === 'historique' && <PatchHistorique patch={patch} personnes={personnes} />}

      <PatchFormDrawer open={editionOuverte} onClose={() => setEditionOuverte(false)} patch={patch} onSaved={() => rechargerPatchs()} />
    </div>
  );
}
