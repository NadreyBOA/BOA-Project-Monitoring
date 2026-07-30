import { Card } from '../../components/ui/Card';
import { Timeline } from '../../components/ui/Timeline';
import { journalRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { Patch, Personne } from '../../lib/types';

export function PatchHistorique({ patch, personnes }: { patch: Patch; personnes: Personne[] }) {
  const { items: journal } = useRepositoryList(journalRepo);
  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? 'Utilisateur inconnu';

  const evenements = journal
    .filter((entree) => entree.typeObjet === 'patch' && entree.objetId === patch.id)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entree) => ({ id: entree.id, date: entree.date, auteur: nomPersonne(entree.auteurId), resume: entree.resume, detail: entree.detail }));

  return (
    <Card title="Historique">
      <Timeline evenements={evenements} />
    </Card>
  );
}
