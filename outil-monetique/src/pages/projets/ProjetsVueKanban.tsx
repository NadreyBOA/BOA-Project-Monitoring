import { useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { tracer } from '../../lib/journal';
import { projetsRepo } from '../../lib/repositories';
import type { Personne, Projet, StatutProjet } from '../../lib/types';

const colonnes: StatutProjet[] = ['Cadrage', 'En cours', 'En pause', 'Clôturé'];

interface ProjetsVueKanbanProps {
  projets: Projet[];
  personnes: Personne[];
  recharger: () => void;
}

export function ProjetsVueKanban({ projets, personnes, recharger }: ProjetsVueKanbanProps) {
  const [colonneSurvolee, setColonneSurvolee] = useState<StatutProjet | null>(null);
  const utilisateurCourant = useUtilisateurCourant();
  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? '—';

  async function deposer(statut: StatutProjet, e: DragEvent) {
    e.preventDefault();
    setColonneSurvolee(null);
    const id = e.dataTransfer.getData('text/projet-id');
    const projet = projets.find((p) => p.id === id);
    if (!id || !projet || projet.statut === statut || !utilisateurCourant) return;
    await projetsRepo.update(id, { statut, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
    await tracer('projet', id, 'changement de statut', utilisateurCourant.id, `Statut changé de « ${projet.statut} » à « ${statut} » (vue kanban).`);
    recharger();
  }

  return (
    <div className="grid grid-cols-4 gap-4 items-start">
      {colonnes.map((statut) => (
        <div
          key={statut}
          onDragOver={(e) => {
            e.preventDefault();
            setColonneSurvolee(statut);
          }}
          onDragLeave={() => setColonneSurvolee((c) => (c === statut ? null : c))}
          onDrop={(e) => deposer(statut, e)}
          className={`flex flex-col gap-3 rounded-card p-3 min-h-[120px] transition-colors ${
            colonneSurvolee === statut ? 'bg-boa-navy-50' : 'bg-surface-tint'
          }`}
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-ink-primary">{statut}</span>
            <span className="text-xs text-ink-tertiary tabular-nums">{projets.filter((p) => p.statut === statut).length}</span>
          </div>

          {projets
            .filter((p) => p.statut === statut)
            .map((projet) => (
              <div
                key={projet.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/projet-id', projet.id)}
                className="bg-surface-card rounded-chip shadow-card p-3.5 flex flex-col gap-2 cursor-grab active:cursor-grabbing"
              >
                <Link to={`/projets/${projet.id}`} className="text-sm font-semibold text-ink-primary hover:text-boa-navy hover:underline">
                  {projet.nom}
                </Link>
                <p className="text-xs text-ink-tertiary">{nomPersonne(projet.responsableId)}</p>
                <ProgressBar pourcentage={projet.avancement} tone={projet.statut === 'Clôturé' ? 'success' : 'info'} />
                <Badge label={projet.priorite} tone={projet.priorite === 'Critique' || projet.priorite === 'Haute' ? 'critical' : 'neutral'} />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
