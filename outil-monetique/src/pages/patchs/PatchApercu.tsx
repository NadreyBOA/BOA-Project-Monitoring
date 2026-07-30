import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/format';
import type { Editeur, Module, Patch, Personne, Projet, Reseau } from '../../lib/types';

interface PatchApercuProps {
  patch: Patch;
  editeurs: Editeur[];
  modules: Module[];
  reseaux: Reseau[];
  projets: Projet[];
  personnes: Personne[];
}

export function PatchApercu({ patch, editeurs, modules, reseaux, projets, personnes }: PatchApercuProps) {
  const editeur = editeurs.find((e) => e.id === patch.editeurId);
  const modulesPatch = modules.filter((m) => patch.moduleIds.includes(m.id));
  const reseauxPatch = reseaux.filter((r) => patch.reseauIds.includes(r.id));
  const projet = patch.projetId ? projets.find((p) => p.id === patch.projetId) : undefined;
  const responsable = personnes.find((p) => p.id === patch.responsableId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <Card title="Contenu" className="lg:col-span-2">
        <p className="text-sm text-ink-secondary whitespace-pre-wrap">{patch.contenu || 'Aucun contenu renseigné.'}</p>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Éditeur</p>
            <p className="text-sm text-ink-primary">{editeur?.nom ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Type</p>
            <p className="text-sm text-ink-primary">{patch.type}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Criticité</p>
            <Badge label={patch.criticite} tone={patch.criticite === 'Critique' || patch.criticite === 'Haute' ? 'critical' : 'neutral'} />
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Date de réception</p>
            <p className="text-sm text-ink-primary">{formatDate(patch.dateReception)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Modules</p>
            <p className="text-sm text-ink-primary">{modulesPatch.map((m) => m.nom).join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Réseaux</p>
            <p className="text-sm text-ink-primary">{reseauxPatch.map((r) => r.nom).join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Projet lié</p>
            <p className="text-sm text-ink-primary">{projet?.nom ?? '—'}</p>
          </div>
          {patch.pieceJointe && (
            <div>
              <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Pièce jointe</p>
              <p className="text-sm text-ink-primary">{patch.pieceJointe}</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Responsable">
        <p className="text-sm text-ink-primary font-semibold">{responsable?.nom ?? '—'}</p>
        <p className="text-xs text-ink-tertiary mt-1">{responsable?.fonction}</p>
      </Card>
    </div>
  );
}
