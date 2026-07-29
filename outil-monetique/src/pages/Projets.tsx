import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Pill } from '../components/ui/Pill';
import { SearchBar } from '../components/ui/SearchBar';
import { champClasses } from '../components/ui/Field';
import { depensesRepo, entitesRepo, jalonsRepo, personnesRepo, projetsRepo } from '../lib/repositories';
import { useRepositoryList } from '../lib/useRepositoryList';
import type { PrioriteProjet, StatutProjet } from '../lib/types';
import { ProjetsVueTableau } from './projets/ProjetsVueTableau';
import { ProjetsVueKanban } from './projets/ProjetsVueKanban';
import { ProjetsVueChronologie } from './projets/ProjetsVueChronologie';
import { ProjetFormDrawer } from './projets/ProjetFormDrawer';

type Vue = 'tableau' | 'kanban' | 'chronologie';

export function Projets() {
  const navigate = useNavigate();
  const { items: projets, recharger } = useRepositoryList(projetsRepo);
  const { items: entites } = useRepositoryList(entitesRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const { items: depenses } = useRepositoryList(depensesRepo);
  const { items: jalons } = useRepositoryList(jalonsRepo);

  const [vue, setVue] = useState<Vue>('tableau');
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<StatutProjet | ''>('');
  const [filtreEntite, setFiltreEntite] = useState('');
  const [filtreResponsable, setFiltreResponsable] = useState('');
  const [filtrePriorite, setFiltrePriorite] = useState<PrioriteProjet | ''>('');
  const [creationOuverte, setCreationOuverte] = useState(false);

  const projetsFiltres = useMemo(() => {
    const rechercheNormalisee = recherche.trim().toLowerCase();
    return projets.filter((p) => {
      if (filtreStatut && p.statut !== filtreStatut) return false;
      if (filtreEntite && !p.entiteIds.includes(filtreEntite)) return false;
      if (filtreResponsable && p.responsableId !== filtreResponsable) return false;
      if (filtrePriorite && p.priorite !== filtrePriorite) return false;
      if (rechercheNormalisee && !p.nom.toLowerCase().includes(rechercheNormalisee)) return false;
      return true;
    });
  }, [projets, filtreStatut, filtreEntite, filtreResponsable, filtrePriorite, recherche]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-secondary mb-1">Piloter les projets de la Cellule Déploiement</p>
          <h1 className="text-[34px] font-extrabold text-ink-primary text-balance">Projets</h1>
        </div>
        <button
          type="button"
          onClick={() => setCreationOuverte(true)}
          className="flex items-center gap-1.5 rounded-full pl-3.5 pr-5 py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Nouveau projet
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <SearchBar placeholder="Rechercher un projet..." valeur={recherche} onChange={setRecherche} />
        </div>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value as StatutProjet | '')} className={`${champClasses} w-auto`}>
          <option value="">Tous les statuts</option>
          {(['Cadrage', 'En cours', 'En pause', 'Clôturé', 'Annulé'] as StatutProjet[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={filtreEntite} onChange={(e) => setFiltreEntite(e.target.value)} className={`${champClasses} w-auto`}>
          <option value="">Toutes les entités</option>
          {entites.map((entite) => (
            <option key={entite.id} value={entite.id}>
              {entite.nom}
            </option>
          ))}
        </select>
        <select value={filtreResponsable} onChange={(e) => setFiltreResponsable(e.target.value)} className={`${champClasses} w-auto`}>
          <option value="">Tous les responsables</option>
          {personnes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>
        <select value={filtrePriorite} onChange={(e) => setFiltrePriorite(e.target.value as PrioriteProjet | '')} className={`${champClasses} w-auto`}>
          <option value="">Toutes les priorités</option>
          {(['Basse', 'Moyenne', 'Haute', 'Critique'] as PrioriteProjet[]).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <div className="flex gap-2 ml-auto">
          <Pill label="Tableau" active={vue === 'tableau'} onClick={() => setVue('tableau')} />
          <Pill label="Kanban" active={vue === 'kanban'} onClick={() => setVue('kanban')} />
          <Pill label="Chronologie" active={vue === 'chronologie'} onClick={() => setVue('chronologie')} />
        </div>
      </div>

      {vue === 'tableau' && (
        <div className="bg-surface-card rounded-card shadow-card p-5">
          <ProjetsVueTableau projets={projetsFiltres} personnes={personnes} entites={entites} depenses={depenses} />
        </div>
      )}
      {vue === 'kanban' && <ProjetsVueKanban projets={projetsFiltres} personnes={personnes} recharger={recharger} />}
      {vue === 'chronologie' && <ProjetsVueChronologie projets={projetsFiltres} jalons={jalons} />}

      <ProjetFormDrawer
        open={creationOuverte}
        onClose={() => setCreationOuverte(false)}
        onSaved={(id) => navigate(`/projets/${id}`)}
      />
    </div>
  );
}
