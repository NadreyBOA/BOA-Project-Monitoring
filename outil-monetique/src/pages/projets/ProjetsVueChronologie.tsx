import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/format';
import { toneStatutJalon } from '../../lib/jalonTone';
import type { Jalon, Projet } from '../../lib/types';

const couleurTon: Record<'success' | 'warning' | 'critical' | 'info', string> = {
  success: '#008457',
  warning: '#F79009',
  critical: '#E5484D',
  info: '#044C7E',
};

interface ProjetsVueChronologieProps {
  projets: Projet[];
  jalons: Jalon[];
}

export function ProjetsVueChronologie({ projets, jalons }: ProjetsVueChronologieProps) {
  if (projets.length === 0) {
    return <EmptyState message="Aucun projet à positionner sur la frise." />;
  }

  const timestamps = projets.flatMap((p) => [new Date(p.dateDebut).getTime(), new Date(p.dateFinCible).getTime()]);
  const debut = Math.min(...timestamps);
  const fin = Math.max(...timestamps);
  const etendue = Math.max(fin - debut, 1);

  const position = (date: string) => {
    const t = new Date(date).getTime();
    return Math.min(100, Math.max(0, ((t - debut) / etendue) * 100));
  };

  return (
    <div className="bg-surface-card rounded-card shadow-card p-5 flex flex-col gap-5">
      <div className="flex justify-between text-xs text-ink-tertiary px-1">
        <span>{formatDate(new Date(debut).toISOString())}</span>
        <span>{formatDate(new Date(fin).toISOString())}</span>
      </div>

      <div className="flex flex-col gap-5">
        {projets.map((projet) => {
          const jalonsProjet = jalons.filter((j) => j.projetId === projet.id);
          return (
            <div key={projet.id} className="flex items-center gap-4">
              <Link to={`/projets/${projet.id}`} className="w-48 shrink-0 text-sm font-semibold text-ink-primary hover:text-boa-navy hover:underline truncate">
                {projet.nom}
              </Link>
              <div className="relative flex-1 h-2 rounded-full bg-surface-border">
                <div
                  className="absolute h-full rounded-full bg-boa-navy-50"
                  style={{ left: `${position(projet.dateDebut)}%`, right: `${100 - position(projet.dateFinCible)}%` }}
                />
                {jalonsProjet.map((jalon) => (
                  <span
                    key={jalon.id}
                    title={`${jalon.libelle} — ${formatDate(jalon.dateCible)} (${jalon.statut})`}
                    className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-surface-card -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${position(jalon.dateCible)}%`, backgroundColor: couleurTon[toneStatutJalon[jalon.statut]] }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
