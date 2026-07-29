import { formatDate } from '../../lib/format';

export interface EvenementTimeline {
  id: string;
  date: string;
  auteur: string;
  resume: string;
  detail?: string;
}

/** Historique horodaté des actions menées sur un objet (journal d'audit). */
export function Timeline({ evenements }: { evenements: EvenementTimeline[] }) {
  if (evenements.length === 0) {
    return <p className="text-sm text-ink-tertiary">Aucune action enregistrée pour le moment.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {evenements.map((evenement, index) => (
        <li key={evenement.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-boa-green mt-1.5 shrink-0" />
            {index < evenements.length - 1 && <span className="w-px flex-1 bg-surface-border" />}
          </div>
          <div className="pb-1">
            <p className="text-sm text-ink-primary">
              <span className="font-semibold">{evenement.auteur}</span> — {evenement.resume}
            </p>
            {evenement.detail && <p className="text-[13px] text-ink-secondary mt-0.5">{evenement.detail}</p>}
            <p className="text-xs text-ink-tertiary mt-1 tabular-nums">{formatDate(evenement.date)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
