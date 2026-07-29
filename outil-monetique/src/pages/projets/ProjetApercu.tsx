import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatDate, formatMontant } from '../../lib/format';
import type { Depense, Entite, Personne, Projet, Reseau } from '../../lib/types';

interface ProjetApercuProps {
  projet: Projet;
  personnes: Personne[];
  entites: Entite[];
  reseaux: Reseau[];
  depenses: Depense[];
}

export function ProjetApercu({ projet, personnes, entites, reseaux, depenses }: ProjetApercuProps) {
  const responsable = personnes.find((p) => p.id === projet.responsableId);
  const entitesProjet = entites.filter((e) => projet.entiteIds.includes(e.id));
  const reseauxProjet = reseaux.filter((r) => projet.reseauIds.includes(r.id));
  const consomme = depenses.filter((d) => d.projetId === projet.id).reduce((s, d) => s + d.montant, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <Card title="Description" className="lg:col-span-2">
        <p className="text-sm text-ink-secondary whitespace-pre-wrap">{projet.description || 'Aucune description renseignée.'}</p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Responsable</p>
            <p className="text-sm text-ink-primary">{responsable?.nom ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Priorité</p>
            <Badge label={projet.priorite} tone={projet.priorite === 'Critique' || projet.priorite === 'Haute' ? 'critical' : 'neutral'} />
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Entités</p>
            <p className="text-sm text-ink-primary">{entitesProjet.map((e) => e.nom).join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Réseaux</p>
            <p className="text-sm text-ink-primary">{reseauxProjet.map((r) => r.nom).join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Date de début</p>
            <p className="text-sm text-ink-primary">{formatDate(projet.dateDebut)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Date cible</p>
            <p className="text-sm text-ink-primary">{formatDate(projet.dateFinCible)}</p>
          </div>
          {projet.dateFinReelle && (
            <div>
              <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Date de fin réelle</p>
              <p className="text-sm text-ink-primary">{formatDate(projet.dateFinReelle)}</p>
            </div>
          )}
        </div>

        {projet.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {projet.tags.map((tag) => (
              <Badge key={tag} label={tag} tone="neutral" />
            ))}
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-5">
        <Card title="Avancement">
          <div className="flex flex-col gap-2">
            <ProgressBar pourcentage={projet.avancement} tone={projet.statut === 'Clôturé' ? 'success' : 'info'} />
            <p className="text-sm text-ink-secondary tabular-nums">{projet.avancement}% réalisé</p>
          </div>
        </Card>

        <Card title="Budget">
          <div className="flex flex-col gap-2">
            <ProgressBar
              pourcentage={projet.budgetAlloue > 0 ? (consomme / projet.budgetAlloue) * 100 : 0}
              tone={consomme > projet.budgetAlloue ? 'critical' : 'success'}
            />
            <p className="text-sm text-ink-secondary">
              <span className="font-semibold text-ink-primary tabular-nums">{formatMontant(consomme)}</span> consommés sur{' '}
              {formatMontant(projet.budgetAlloue)}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
