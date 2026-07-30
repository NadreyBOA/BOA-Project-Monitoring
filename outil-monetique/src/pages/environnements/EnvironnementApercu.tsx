import { Card } from '../../components/ui/Card';
import { formatDate } from '../../lib/format';
import type { Entite, Environnement, Personne } from '../../lib/types';

interface EnvironnementApercuProps {
  environnement: Environnement;
  entites: Entite[];
  personnes: Personne[];
}

export function EnvironnementApercu({ environnement, entites, personnes }: EnvironnementApercuProps) {
  const responsable = personnes.find((p) => p.id === environnement.responsableId);
  const perimetre = environnement.entiteId ? entites.find((e) => e.id === environnement.entiteId)?.nom : 'Groupe';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <Card title="Description" className="lg:col-span-2">
        <p className="text-sm text-ink-secondary whitespace-pre-wrap">{environnement.description || 'Aucune description renseignée.'}</p>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Type</p>
            <p className="text-sm text-ink-primary">{environnement.type}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Périmètre</p>
            <p className="text-sm text-ink-primary">{perimetre}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Responsable</p>
            <p className="text-sm text-ink-primary">{responsable?.nom ?? '—'}</p>
          </div>
        </div>
      </Card>

      <Card title="Version de production déployée">
        <p className="text-xl font-extrabold text-ink-primary">{environnement.versionProdDeployee.reference}</p>
        <p className="text-sm text-ink-secondary">Déployée le {formatDate(environnement.versionProdDeployee.date)}</p>
      </Card>
    </div>
  );
}
