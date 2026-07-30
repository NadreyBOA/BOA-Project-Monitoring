import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/format';
import { champsAudit } from '../../lib/repository';
import { tracer } from '../../lib/journal';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { droitsEnvironnementRepo, personnesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { DroitEnvironnement, Environnement, NiveauDroit } from '../../lib/types';

const toneNiveau: Record<NiveauDroit, BadgeTone> = {
  Lecture: 'neutral',
  Exécution: 'info',
  Administration: 'critical',
};

interface EnvironnementDroitsProps {
  environnement: Environnement;
  droits: DroitEnvironnement[];
  recharger: () => void;
}

export function EnvironnementDroits({ environnement, droits, recharger }: EnvironnementDroitsProps) {
  const { items: personnes } = useRepositoryList(personnesRepo);
  const utilisateurCourant = useUtilisateurCourant();
  const droitsEnvironnement = droits.filter((d) => d.environnementId === environnement.id);

  const [ouvert, setOuvert] = useState(false);
  const [droitEnEdition, setDroitEnEdition] = useState<DroitEnvironnement | null>(null);
  const [personneId, setPersonneId] = useState('');
  const [niveau, setNiveau] = useState<NiveauDroit>('Lecture');

  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? '—';
  const personnesDisponibles = personnes.filter((p) => !droitsEnvironnement.some((d) => d.personneId === p.id));

  function ouvrirAttribution() {
    setDroitEnEdition(null);
    setPersonneId(personnesDisponibles[0]?.id ?? '');
    setNiveau('Lecture');
    setOuvert(true);
  }

  function ouvrirModification(droit: DroitEnvironnement) {
    setDroitEnEdition(droit);
    setPersonneId(droit.personneId);
    setNiveau(droit.niveau);
    setOuvert(true);
  }

  async function enregistrer() {
    if (!personneId || !utilisateurCourant) return;
    if (droitEnEdition) {
      await droitsEnvironnementRepo.update(droitEnEdition.id, { niveau, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
      await tracer('environnement', environnement.id, 'modification', utilisateurCourant.id, `Niveau de droit de ${nomPersonne(personneId)} changé en « ${niveau} ».`);
    } else {
      await droitsEnvironnementRepo.create({
        ...champsAudit(utilisateurCourant.id),
        environnementId: environnement.id,
        personneId,
        niveau,
        dateAttribution: new Date().toISOString().slice(0, 10),
        attribueParId: utilisateurCourant.id,
      });
      await tracer('environnement', environnement.id, 'modification', utilisateurCourant.id, `Droit « ${niveau} » attribué à ${nomPersonne(personneId)}.`);
    }
    setOuvert(false);
    recharger();
  }

  async function retirer(droit: DroitEnvironnement) {
    if (!utilisateurCourant) return;
    await droitsEnvironnementRepo.remove(droit.id);
    await tracer('environnement', environnement.id, 'modification', utilisateurCourant.id, `Droit retiré à ${nomPersonne(droit.personneId)}.`);
    recharger();
  }

  return (
    <>
      <Card
        title="Droits d'accès"
        actions={
          <button
            type="button"
            onClick={ouvrirAttribution}
            className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700"
          >
            <Plus className="w-4 h-4" /> Attribuer un droit
          </button>
        }
      >
        {droitsEnvironnement.length === 0 ? (
          <EmptyState message="Aucun droit attribué sur cet environnement." />
        ) : (
          <ul className="flex flex-col gap-3">
            {droitsEnvironnement.map((droit) => (
              <li key={droit.id} className="flex items-center justify-between gap-3 border border-surface-border rounded-chip px-3.5 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar nom={nomPersonne(droit.personneId)} taille={30} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-primary truncate">{nomPersonne(droit.personneId)}</p>
                    <p className="text-xs text-ink-tertiary">
                      Attribué le {formatDate(droit.dateAttribution)} par {nomPersonne(droit.attribueParId)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge label={droit.niveau} tone={toneNiveau[droit.niveau]} />
                  <button type="button" onClick={() => ouvrirModification(droit)} className="text-xs font-semibold text-boa-navy hover:underline">
                    Changer
                  </button>
                  <button type="button" onClick={() => retirer(droit)} className="text-xs font-semibold text-status-critical hover:underline">
                    Retirer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={droitEnEdition ? 'Changer le niveau de droit' : 'Attribuer un droit'}
        footer={
          <button type="button" onClick={enregistrer} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
            Enregistrer
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Personne">
            <select value={personneId} onChange={(e) => setPersonneId(e.target.value)} disabled={!!droitEnEdition} className={champClasses}>
              {droitEnEdition ? (
                <option value={personneId}>{nomPersonne(personneId)}</option>
              ) : (
                personnesDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))
              )}
            </select>
          </Field>
          <Field label="Niveau">
            <select value={niveau} onChange={(e) => setNiveau(e.target.value as NiveauDroit)} className={champClasses}>
              {(['Lecture', 'Exécution', 'Administration'] as NiveauDroit[]).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Drawer>
    </>
  );
}
