import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import {
  cahiersDeTestRepo,
  casDeTestRepo,
  elementsATesterRepo,
  entitesRepo,
  executionsCasRepo,
  iterationsRepo,
  modulesRepo,
  personnesRepo,
  projetsRepo,
} from '../lib/repositories';
import { useRepositoryList } from '../lib/useRepositoryList';
import { toneStatutCahier } from './Tests';
import { CahierFormDrawer } from './tests/CahierFormDrawer';
import { CahierApercu } from './tests/CahierApercu';
import { CahierElementsEtCas } from './tests/CahierElementsEtCas';
import { CahierIterations } from './tests/CahierIterations';
import { CahierResultats } from './tests/CahierResultats';
import { CahierHistorique } from './tests/CahierHistorique';

const onglets = [
  { cle: 'apercu', libelle: 'Aperçu' },
  { cle: 'elements', libelle: 'Éléments et cas' },
  { cle: 'iterations', libelle: 'Itérations' },
  { cle: 'resultats', libelle: 'Résultats' },
  { cle: 'historique', libelle: 'Historique' },
];

export function CahierDetail() {
  const { id = '' } = useParams();
  const { items: cahiers, recharger: rechargerCahiers } = useRepositoryList(cahiersDeTestRepo);
  const { items: projets } = useRepositoryList(projetsRepo);
  const { items: entites } = useRepositoryList(entitesRepo);
  const { items: modules } = useRepositoryList(modulesRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const { items: elements, recharger: rechargerElements } = useRepositoryList(elementsATesterRepo);
  const { items: cas, recharger: rechargerCas } = useRepositoryList(casDeTestRepo);
  const { items: iterations, recharger: rechargerIterations } = useRepositoryList(iterationsRepo);
  const { items: executions, recharger: rechargerExecutions } = useRepositoryList(executionsCasRepo);

  const [ongletActif, setOngletActif] = useState('apercu');
  const [editionOuverte, setEditionOuverte] = useState(false);

  const cahier = cahiers.find((c) => c.id === id);

  function rechargerTout() {
    rechargerElements();
    rechargerCas();
    rechargerIterations();
    rechargerExecutions();
  }

  if (!cahier) {
    return <p className="text-sm text-ink-tertiary">Chargement du cahier de test…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-[28px] font-extrabold text-ink-primary text-balance">{cahier.nom}</h1>
            <Badge label={cahier.statut} tone={toneStatutCahier[cahier.statut]} />
          </div>
          <p className="text-sm text-ink-secondary">{cahier.perimetre}</p>
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
        <CahierApercu cahier={cahier} projets={projets} entites={entites} modules={modules} personnes={personnes} elements={elements} cas={cas} iterations={iterations} />
      )}
      {ongletActif === 'elements' && <CahierElementsEtCas cahier={cahier} elements={elements} cas={cas} recharger={rechargerTout} />}
      {ongletActif === 'iterations' && (
        <CahierIterations cahier={cahier} elements={elements} cas={cas} iterations={iterations} executions={executions} recharger={rechargerTout} />
      )}
      {ongletActif === 'resultats' && <CahierResultats cahier={cahier} iterations={iterations} executions={executions} />}
      {ongletActif === 'historique' && <CahierHistorique cahier={cahier} personnes={personnes} />}

      <CahierFormDrawer open={editionOuverte} onClose={() => setEditionOuverte(false)} cahier={cahier} onSaved={() => rechargerCahiers()} />
    </div>
  );
}
