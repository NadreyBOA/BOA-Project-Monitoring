import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SearchBar } from '../components/ui/SearchBar';
import { champClasses } from '../components/ui/Field';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { DataTable, type Colonne } from '../components/ui/DataTable';
import { entitesRepo, environnementsRepo, personnesRepo, versionsProductionRepo } from '../lib/repositories';
import { useRepositoryList } from '../lib/useRepositoryList';
import { estAJour } from '../lib/versionEcart';
import { formatDate } from '../lib/format';
import type { Environnement, StatutEnvironnement, TypeEnvironnement } from '../lib/types';
import { EnvironnementFormDrawer } from './environnements/EnvironnementFormDrawer';

export const toneStatutEnvironnement: Record<StatutEnvironnement, BadgeTone> = {
  Disponible: 'success',
  Occupé: 'info',
  Indisponible: 'critical',
  'En restauration': 'warning',
};

export function Environnements() {
  const navigate = useNavigate();
  const { items: environnements } = useRepositoryList(environnementsRepo);
  const { items: entites } = useRepositoryList(entitesRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const { items: versions } = useRepositoryList(versionsProductionRepo);

  const [recherche, setRecherche] = useState('');
  const [filtreType, setFiltreType] = useState<TypeEnvironnement | ''>('');
  const [filtreStatut, setFiltreStatut] = useState<StatutEnvironnement | ''>('');
  const [creationOuverte, setCreationOuverte] = useState(false);

  const nomEntite = (id?: string) => (id ? entites.find((e) => e.id === id)?.nom : undefined) ?? 'Groupe';
  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? '—';

  const environnementsFiltres = useMemo(() => {
    const rechercheNormalisee = recherche.trim().toLowerCase();
    return environnements.filter((e) => {
      if (filtreType && e.type !== filtreType) return false;
      if (filtreStatut && e.statut !== filtreStatut) return false;
      if (rechercheNormalisee && !e.nom.toLowerCase().includes(rechercheNormalisee)) return false;
      return true;
    });
  }, [environnements, filtreType, filtreStatut, recherche]);

  const colonnes: Colonne<Environnement>[] = [
    {
      cle: 'nom',
      entete: 'Nom',
      rendu: (e) => (
        <Link to={`/environnements/${e.id}`} className="font-semibold text-boa-navy hover:underline">
          {e.nom}
        </Link>
      ),
      tri: (a, b) => a.nom.localeCompare(b.nom),
    },
    { cle: 'type', entete: 'Type', rendu: (e) => e.type },
    { cle: 'perimetre', entete: 'Entité / périmètre', rendu: (e) => nomEntite(e.entiteId) },
    { cle: 'responsable', entete: 'Responsable', rendu: (e) => nomPersonne(e.responsableId) },
    { cle: 'statut', entete: 'Statut', rendu: (e) => <Badge label={e.statut} tone={toneStatutEnvironnement[e.statut]} /> },
    {
      cle: 'version',
      entete: 'Version de prod reflétée',
      rendu: (e) => (
        <span className="text-sm">
          {e.versionProdDeployee.reference} <span className="text-ink-tertiary">({formatDate(e.versionProdDeployee.date)})</span>
        </span>
      ),
    },
    {
      cle: 'ecart',
      entete: 'Écart',
      rendu: (e) => (estAJour(e, versions) ? <Badge label="À jour" tone="success" /> : <Badge label="Écart de version" tone="critical" />),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-secondary mb-1">Droits, restaurations et versions déployées</p>
          <h1 className="text-[34px] font-extrabold text-ink-primary text-balance">Environnements</h1>
        </div>
        <button
          type="button"
          onClick={() => setCreationOuverte(true)}
          className="flex items-center gap-1.5 rounded-full pl-3.5 pr-5 py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Nouvel environnement
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <SearchBar placeholder="Rechercher un environnement..." valeur={recherche} onChange={setRecherche} />
        </div>
        <select value={filtreType} onChange={(e) => setFiltreType(e.target.value as TypeEnvironnement | '')} className={`${champClasses} w-auto`}>
          <option value="">Tous les types</option>
          {(['Test', 'Recette', 'Préproduction', 'Formation', 'Iso-production'] as TypeEnvironnement[]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value as StatutEnvironnement | '')} className={`${champClasses} w-auto`}>
          <option value="">Tous les statuts</option>
          {(['Disponible', 'Occupé', 'Indisponible', 'En restauration'] as StatutEnvironnement[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface-card rounded-card shadow-card p-5">
        <DataTable colonnes={colonnes} lignes={environnementsFiltres} cleLigne={(e) => e.id} messageVide="Aucun environnement ne correspond aux filtres." />
      </div>

      <EnvironnementFormDrawer open={creationOuverte} onClose={() => setCreationOuverte(false)} onSaved={(id) => navigate(`/environnements/${id}`)} />
    </div>
  );
}
