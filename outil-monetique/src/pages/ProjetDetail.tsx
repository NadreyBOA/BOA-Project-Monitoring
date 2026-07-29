import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Pencil } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { champClasses } from '../components/ui/Field';
import { champsAudit } from '../lib/repository';
import { tracer } from '../lib/journal';
import { useUtilisateurCourant } from '../lib/currentUser';
import {
  depensesRepo,
  entitesRepo,
  jalonsRepo,
  personnesRepo,
  projetsRepo,
  reseauxRepo,
} from '../lib/repositories';
import { useRepositoryList } from '../lib/useRepositoryList';
import type { StatutProjet } from '../lib/types';
import { toneStatutProjet } from './projets/ProjetsVueTableau';
import { ProjetApercu } from './projets/ProjetApercu';
import { ProjetFormDrawer } from './projets/ProjetFormDrawer';
import { ProjetJalons } from './projets/ProjetJalons';
import { ProjetBudget } from './projets/ProjetBudget';
import { ProjetDepenses } from './projets/ProjetDepenses';
import { ProjetElementsLies } from './projets/ProjetElementsLies';
import { ProjetHistorique } from './projets/ProjetHistorique';

const onglets = [
  { cle: 'apercu', libelle: 'Aperçu' },
  { cle: 'jalons', libelle: 'Jalons' },
  { cle: 'budget', libelle: 'Budget' },
  { cle: 'depenses', libelle: 'Journal des dépenses' },
  { cle: 'elements', libelle: 'Éléments liés' },
  { cle: 'historique', libelle: 'Historique' },
];

export function ProjetDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const utilisateurCourant = useUtilisateurCourant();

  const { items: projets, recharger: rechargerProjets } = useRepositoryList(projetsRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const { items: entites } = useRepositoryList(entitesRepo);
  const { items: reseaux } = useRepositoryList(reseauxRepo);
  const { items: depenses, recharger: rechargerDepenses } = useRepositoryList(depensesRepo);
  const { items: jalons, recharger: rechargerJalons } = useRepositoryList(jalonsRepo);

  const [ongletActif, setOngletActif] = useState('apercu');
  const [editionOuverte, setEditionOuverte] = useState(false);

  const projet = projets.find((p) => p.id === id);

  if (!projet) {
    return <p className="text-sm text-ink-tertiary">Chargement du projet…</p>;
  }

  async function changerStatut(statut: StatutProjet) {
    if (!utilisateurCourant || statut === projet!.statut) return;
    const patch: Partial<typeof projet> = { statut, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id };
    if (statut === 'Clôturé') {
      patch.dateFinReelle = new Date().toISOString().slice(0, 10);
      patch.avancement = 100;
    }
    await projetsRepo.update(projet!.id, patch);
    await tracer('projet', projet!.id, 'changement de statut', utilisateurCourant.id, `Statut changé de « ${projet!.statut} » à « ${statut} ».`);
    rechargerProjets();
  }

  async function dupliquer() {
    if (!utilisateurCourant) return;
    const copie = await projetsRepo.create({
      ...champsAudit(utilisateurCourant.id),
      nom: `${projet!.nom} (copie)`,
      description: projet!.description,
      statut: 'Cadrage',
      responsableId: projet!.responsableId,
      entiteIds: projet!.entiteIds,
      reseauIds: projet!.reseauIds,
      dateDebut: new Date().toISOString().slice(0, 10),
      dateFinCible: projet!.dateFinCible,
      priorite: projet!.priorite,
      avancement: 0,
      budgetAlloue: projet!.budgetAlloue,
      tags: projet!.tags,
    });
    await tracer('projet', copie.id, 'création', utilisateurCourant.id, `Projet dupliqué depuis « ${projet!.nom} ».`);
    navigate(`/projets/${copie.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-[28px] font-extrabold text-ink-primary text-balance">{projet.nom}</h1>
            <Badge label={projet.statut} tone={toneStatutProjet[projet.statut]} />
          </div>
          <p className="text-sm text-ink-secondary">Code projet : {projet.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={projet.statut}
            onChange={(e) => changerStatut(e.target.value as StatutProjet)}
            className={`${champClasses} w-auto`}
            title="Changer le statut"
          >
            {(['Cadrage', 'En cours', 'En pause', 'Clôturé', 'Annulé'] as StatutProjet[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={dupliquer}
            title="Dupliquer le projet"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold border border-surface-border text-ink-secondary hover:bg-surface-tint"
          >
            <Copy className="w-3.5 h-3.5" /> Dupliquer
          </button>
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

      {ongletActif === 'apercu' && <ProjetApercu projet={projet} personnes={personnes} entites={entites} reseaux={reseaux} depenses={depenses} />}
      {ongletActif === 'jalons' && <ProjetJalons projet={projet} jalons={jalons} personnes={personnes} recharger={rechargerJalons} />}
      {ongletActif === 'budget' && <ProjetBudget projet={projet} depenses={depenses} />}
      {ongletActif === 'depenses' && (
        <ProjetDepenses projet={projet} depenses={depenses} recharger={() => { rechargerDepenses(); rechargerProjets(); }} />
      )}
      {ongletActif === 'elements' && <ProjetElementsLies projet={projet} />}
      {ongletActif === 'historique' && <ProjetHistorique projet={projet} personnes={personnes} />}

      <ProjetFormDrawer open={editionOuverte} onClose={() => setEditionOuverte(false)} projet={projet} onSaved={() => rechargerProjets()} />
    </div>
  );
}
