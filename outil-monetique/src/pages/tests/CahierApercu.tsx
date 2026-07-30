import { Card } from '../../components/ui/Card';
import { formatDate } from '../../lib/format';
import { casDuCahier, derniereIteration, iterationsDuCahier } from '../../lib/testsStats';
import type { CahierDeTest, ElementATester, CasDeTest, Entite, Iteration, Module, Personne, Projet } from '../../lib/types';

interface CahierApercuProps {
  cahier: CahierDeTest;
  projets: Projet[];
  entites: Entite[];
  modules: Module[];
  personnes: Personne[];
  elements: ElementATester[];
  cas: CasDeTest[];
  iterations: Iteration[];
}

export function CahierApercu({ cahier, projets, entites, modules, personnes, elements, cas, iterations }: CahierApercuProps) {
  const projet = cahier.projetId ? projets.find((p) => p.id === cahier.projetId) : undefined;
  const responsable = personnes.find((p) => p.id === cahier.responsableId);
  const entitesCahier = entites.filter((e) => cahier.entiteIds.includes(e.id));
  const modulesCahier = modules.filter((m) => cahier.moduleIds.includes(m.id));
  const nbElements = elements.filter((e) => e.cahierId === cahier.id).length;
  const nbCas = casDuCahier(cahier.id, elements, cas).length;
  const nbIterations = iterationsDuCahier(cahier.id, iterations).length;
  const derniere = derniereIteration(cahier.id, iterations);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <Card title="Périmètre" className="lg:col-span-2">
        <p className="text-sm text-ink-secondary whitespace-pre-wrap">{cahier.perimetre || 'Aucun périmètre renseigné.'}</p>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Projet lié</p>
            <p className="text-sm text-ink-primary">{projet?.nom ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Responsable</p>
            <p className="text-sm text-ink-primary">{responsable?.nom ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Modules</p>
            <p className="text-sm text-ink-primary">{modulesCahier.map((m) => m.nom).join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Entités</p>
            <p className="text-sm text-ink-primary">{entitesCahier.map((e) => e.nom).join(', ') || '—'}</p>
          </div>
        </div>
      </Card>

      <Card title="Synthèse">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-secondary">Éléments à tester</span>
            <span className="font-semibold tabular-nums">{nbElements}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-secondary">Cas de test</span>
            <span className="font-semibold tabular-nums">{nbCas}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-secondary">Itérations</span>
            <span className="font-semibold tabular-nums">{nbIterations}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-secondary">Dernière itération</span>
            <span className="font-semibold">{derniere ? `n°${derniere.numero} — ${formatDate(derniere.dateDebut)}` : '—'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
