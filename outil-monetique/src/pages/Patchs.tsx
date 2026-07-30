import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SearchBar } from '../components/ui/SearchBar';
import { champClasses } from '../components/ui/Field';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { DataTable, type Colonne } from '../components/ui/DataTable';
import { editeursRepo, modulesRepo, patchsRepo, personnesRepo, projetsRepo, reseauxRepo } from '../lib/repositories';
import { useRepositoryList } from '../lib/useRepositoryList';
import { formatDate, joursDepuis } from '../lib/format';
import type { Criticite, Patch, StatutPatch, TypePatch } from '../lib/types';
import { PatchFormDrawer } from './patchs/PatchFormDrawer';

export const toneStatutPatch: Record<StatutPatch, BadgeTone> = {
  Reçu: 'neutral',
  'En analyse': 'info',
  'En recette': 'info',
  Validé: 'success',
  Déployé: 'success',
  Rejeté: 'critical',
  'En attente': 'warning',
};

export function Patchs() {
  const navigate = useNavigate();
  const { items: patchs } = useRepositoryList(patchsRepo);
  const { items: editeurs } = useRepositoryList(editeursRepo);
  const { items: modules } = useRepositoryList(modulesRepo);
  const { items: reseaux } = useRepositoryList(reseauxRepo);
  const { items: projets } = useRepositoryList(projetsRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);

  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<StatutPatch | ''>('');
  const [filtreEditeur, setFiltreEditeur] = useState('');
  const [filtreModule, setFiltreModule] = useState('');
  const [filtreType, setFiltreType] = useState<TypePatch | ''>('');
  const [filtreCriticite, setFiltreCriticite] = useState<Criticite | ''>('');
  const [filtreProjet, setFiltreProjet] = useState('');
  const [filtreReseau, setFiltreReseau] = useState('');
  const [filtreDepuis, setFiltreDepuis] = useState('');
  const [creationOuverte, setCreationOuverte] = useState(false);

  const nomEditeur = (id: string) => editeurs.find((e) => e.id === id)?.nom ?? '—';
  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? '—';
  const nomsModules = (ids: string[]) => ids.map((id) => modules.find((m) => m.id === id)?.nom ?? '?').join(', ');

  const patchsFiltres = useMemo(() => {
    const rechercheNormalisee = recherche.trim().toLowerCase();
    return patchs.filter((p) => {
      if (filtreStatut && p.statut !== filtreStatut) return false;
      if (filtreEditeur && p.editeurId !== filtreEditeur) return false;
      if (filtreModule && !p.moduleIds.includes(filtreModule)) return false;
      if (filtreType && p.type !== filtreType) return false;
      if (filtreCriticite && p.criticite !== filtreCriticite) return false;
      if (filtreProjet && p.projetId !== filtreProjet) return false;
      if (filtreReseau && !p.reseauIds.includes(filtreReseau)) return false;
      if (filtreDepuis && p.dateReception < filtreDepuis) return false;
      if (rechercheNormalisee && !p.reference.toLowerCase().includes(rechercheNormalisee)) return false;
      return true;
    });
  }, [patchs, filtreStatut, filtreEditeur, filtreModule, filtreType, filtreCriticite, filtreProjet, filtreReseau, filtreDepuis, recherche]);

  const colonnes: Colonne<Patch>[] = [
    {
      cle: 'reference',
      entete: 'Référence',
      rendu: (p) => (
        <Link to={`/patchs/${p.id}`} className="font-semibold text-boa-navy hover:underline font-mono">
          {p.reference}
        </Link>
      ),
      tri: (a, b) => a.reference.localeCompare(b.reference),
    },
    { cle: 'editeur', entete: 'Éditeur', rendu: (p) => nomEditeur(p.editeurId) },
    { cle: 'modules', entete: 'Modules', rendu: (p) => nomsModules(p.moduleIds) || '—' },
    { cle: 'type', entete: 'Type', rendu: (p) => p.type },
    {
      cle: 'dateReception',
      entete: 'Date de réception',
      rendu: (p) => formatDate(p.dateReception),
      tri: (a, b) => a.dateReception.localeCompare(b.dateReception),
    },
    { cle: 'statut', entete: 'Statut', rendu: (p) => <Badge label={p.statut} tone={toneStatutPatch[p.statut]} /> },
    { cle: 'responsable', entete: 'Responsable', rendu: (p) => nomPersonne(p.responsableId) },
    {
      cle: 'delai',
      entete: 'Délai depuis réception',
      rendu: (p) => <span className="tabular-nums">{joursDepuis(p.dateReception)} j</span>,
      tri: (a, b) => joursDepuis(a.dateReception) - joursDepuis(b.dateReception),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-secondary mb-1">Réception, cycle de vie et installations</p>
          <h1 className="text-[34px] font-extrabold text-ink-primary text-balance">Patchs</h1>
        </div>
        <button
          type="button"
          onClick={() => setCreationOuverte(true)}
          className="flex items-center gap-1.5 rounded-full pl-3.5 pr-5 py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Enregistrer un patch reçu
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <SearchBar placeholder="Rechercher une référence..." valeur={recherche} onChange={setRecherche} />
        </div>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value as StatutPatch | '')} className={`${champClasses} w-auto`}>
          <option value="">Tous les statuts</option>
          {(['Reçu', 'En analyse', 'En recette', 'Validé', 'Déployé', 'Rejeté', 'En attente'] as StatutPatch[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={filtreEditeur} onChange={(e) => setFiltreEditeur(e.target.value)} className={`${champClasses} w-auto`}>
          <option value="">Tous les éditeurs</option>
          {editeurs.map((ed) => (
            <option key={ed.id} value={ed.id}>
              {ed.nom}
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
        <select value={filtreType} onChange={(e) => setFiltreType(e.target.value as TypePatch | '')} className={`${champClasses} w-auto`}>
          <option value="">Tous les types</option>
          {(['Correctif', 'Évolution', 'Réglementaire', 'Sécurité'] as TypePatch[]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={filtreCriticite} onChange={(e) => setFiltreCriticite(e.target.value as Criticite | '')} className={`${champClasses} w-auto`}>
          <option value="">Toutes les criticités</option>
          {(['Basse', 'Moyenne', 'Haute', 'Critique'] as Criticite[]).map((c) => (
            <option key={c} value={c}>
              {c}
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
        <select value={filtreReseau} onChange={(e) => setFiltreReseau(e.target.value)} className={`${champClasses} w-auto`}>
          <option value="">Tous les réseaux</option>
          {reseaux.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nom}
            </option>
          ))}
        </select>
        <FiltrePeriode valeur={filtreDepuis} onChange={setFiltreDepuis} />
      </div>

      <div className="bg-surface-card rounded-card shadow-card p-5">
        <DataTable colonnes={colonnes} lignes={patchsFiltres} cleLigne={(p) => p.id} messageVide="Aucun patch ne correspond aux filtres." />
      </div>

      <PatchFormDrawer open={creationOuverte} onClose={() => setCreationOuverte(false)} onSaved={(id) => navigate(`/patchs/${id}`)} />
    </div>
  );
}

function FiltrePeriode({ valeur, onChange }: { valeur: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-secondary">
      Reçu depuis
      <input type="date" value={valeur} onChange={(e) => onChange(e.target.value)} className={`${champClasses} w-auto`} />
    </label>
  );
}
