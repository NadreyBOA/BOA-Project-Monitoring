import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SearchBar } from '../components/ui/SearchBar';
import { champClasses } from '../components/ui/Field';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { DataTable, type Colonne } from '../components/ui/DataTable';
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
import { casDuCahier, derniereIteration, tauxReussite } from '../lib/testsStats';
import type { CahierDeTest, StatutCahierTest } from '../lib/types';
import { CahierFormDrawer } from './tests/CahierFormDrawer';

export const toneStatutCahier: Record<StatutCahierTest, BadgeTone> = {
  Brouillon: 'neutral',
  'En cours': 'info',
  Clôturé: 'success',
};

export function Tests() {
  const navigate = useNavigate();
  const { items: cahiers } = useRepositoryList(cahiersDeTestRepo);
  const { items: projets } = useRepositoryList(projetsRepo);
  const { items: entites } = useRepositoryList(entitesRepo);
  const { items: modules } = useRepositoryList(modulesRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const { items: elements } = useRepositoryList(elementsATesterRepo);
  const { items: cas } = useRepositoryList(casDeTestRepo);
  const { items: iterations } = useRepositoryList(iterationsRepo);
  const { items: executions } = useRepositoryList(executionsCasRepo);

  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<StatutCahierTest | ''>('');
  const [filtreProjet, setFiltreProjet] = useState('');
  const [filtreModule, setFiltreModule] = useState('');
  const [filtreEntite, setFiltreEntite] = useState('');
  const [filtreResponsable, setFiltreResponsable] = useState('');
  const [creationOuverte, setCreationOuverte] = useState(false);

  const nomProjet = (id?: string) => (id ? projets.find((p) => p.id === id)?.nom : undefined) ?? '—';
  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? '—';
  const codesModules = (ids: string[]) => ids.map((id) => modules.find((m) => m.id === id)?.nom ?? '?').join(', ');

  const cahiersFiltres = useMemo(() => {
    const rechercheNormalisee = recherche.trim().toLowerCase();
    return cahiers.filter((c) => {
      if (filtreStatut && c.statut !== filtreStatut) return false;
      if (filtreProjet && c.projetId !== filtreProjet) return false;
      if (filtreModule && !c.moduleIds.includes(filtreModule)) return false;
      if (filtreEntite && !c.entiteIds.includes(filtreEntite)) return false;
      if (filtreResponsable && c.responsableId !== filtreResponsable) return false;
      if (rechercheNormalisee && !c.nom.toLowerCase().includes(rechercheNormalisee)) return false;
      return true;
    });
  }, [cahiers, filtreStatut, filtreProjet, filtreModule, filtreEntite, filtreResponsable, recherche]);

  const colonnes: Colonne<CahierDeTest>[] = [
    {
      cle: 'nom',
      entete: 'Nom',
      rendu: (c) => (
        <Link to={`/tests/${c.id}`} className="font-semibold text-boa-navy hover:underline">
          {c.nom}
        </Link>
      ),
      tri: (a, b) => a.nom.localeCompare(b.nom),
    },
    { cle: 'projet', entete: 'Projet lié', rendu: (c) => nomProjet(c.projetId) },
    { cle: 'modules', entete: 'Modules', rendu: (c) => codesModules(c.moduleIds) || '—' },
    { cle: 'responsable', entete: 'Responsable', rendu: (c) => nomPersonne(c.responsableId) },
    { cle: 'nbCas', entete: 'Nb. cas', rendu: (c) => casDuCahier(c.id, elements, cas).length },
    {
      cle: 'tauxReussite',
      entete: 'Taux réussite (dernière itération)',
      rendu: (c) => {
        const iteration = derniereIteration(c.id, iterations);
        if (!iteration) return <span className="text-ink-tertiary">—</span>;
        const taux = tauxReussite(iteration.id, executions);
        return taux === null ? <span className="text-ink-tertiary">—</span> : <span className="font-semibold tabular-nums">{taux}%</span>;
      },
    },
    { cle: 'statut', entete: 'Statut', rendu: (c) => <Badge label={c.statut} tone={toneStatutCahier[c.statut]} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-secondary mb-1">Cahiers de test, cas et itérations</p>
          <h1 className="text-[34px] font-extrabold text-ink-primary text-balance">Tests</h1>
        </div>
        <button
          type="button"
          onClick={() => setCreationOuverte(true)}
          className="flex items-center gap-1.5 rounded-full pl-3.5 pr-5 py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Nouveau cahier
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <SearchBar placeholder="Rechercher un cahier..." valeur={recherche} onChange={setRecherche} />
        </div>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value as StatutCahierTest | '')} className={`${champClasses} w-auto`}>
          <option value="">Tous les statuts</option>
          {(['Brouillon', 'En cours', 'Clôturé'] as StatutCahierTest[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={filtreProjet} onChange={(e) => setFiltreProjet(e.target.value)} className={`${champClasses} w-auto`}>
          <option value="">Tous les projets</option>
          {projets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>
        <select value={filtreModule} onChange={(e) => setFiltreModule(e.target.value)} className={`${champClasses} w-auto`}>
          <option value="">Tous les modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nom}
            </option>
          ))}
        </select>
        <select value={filtreEntite} onChange={(e) => setFiltreEntite(e.target.value)} className={`${champClasses} w-auto`}>
          <option value="">Toutes les entités</option>
          {entites.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom}
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
      </div>

      <div className="bg-surface-card rounded-card shadow-card p-5">
        <DataTable colonnes={colonnes} lignes={cahiersFiltres} cleLigne={(c) => c.id} messageVide="Aucun cahier de test ne correspond aux filtres." />
      </div>

      <CahierFormDrawer open={creationOuverte} onClose={() => setCreationOuverte(false)} onSaved={(id) => navigate(`/tests/${id}`)} />
    </div>
  );
}
