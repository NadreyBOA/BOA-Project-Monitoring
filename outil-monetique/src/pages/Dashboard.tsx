import { useEffect, useState } from 'react';
import { FolderKanban, Layers, Package, Zap, ClipboardCheck, CalendarClock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { DonutChart } from '../components/ui/DonutChart';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../lib/format';
import {
  cahiersDeTestRepo,
  environnementsRepo,
  iterationsRepo,
  jalonsRepo,
  patchsRepo,
  personnesRepo,
  pointsRunRepo,
  projetsRepo,
} from '../lib/repositories';
import type { CahierDeTest, Environnement, Iteration, Jalon, Patch, Personne, PointRun, Projet } from '../lib/types';

interface DonneesDashboard {
  projets: Projet[];
  jalons: Jalon[];
  patchs: Patch[];
  environnements: Environnement[];
  cahiers: CahierDeTest[];
  pointsRun: PointRun[];
  iterations: Iteration[];
  personnes: Personne[];
}

const statutsPatchEnAttente: Patch['statut'][] = ['Reçu', 'En analyse', 'En recette', 'En attente'];
const statutsRunOuverts: PointRun['statut'][] = ['Ouvert', 'En cours', 'En attente'];

const toneStatutJalon: Record<Jalon['statut'], 'success' | 'warning' | 'critical' | 'info'> = {
  Atteint: 'success',
  'À venir': 'info',
  'En retard': 'critical',
};

const rangPriorite: Record<PointRun['priorite'], number> = { Critique: 3, Haute: 2, Moyenne: 1, Basse: 0 };

const badgeToneRun: Record<PointRun['statut'], BadgeTone> = {
  Ouvert: 'critical',
  'En cours': 'warning',
  'En attente': 'neutral',
  Résolu: 'success',
  Clôturé: 'neutral',
};

export function Dashboard() {
  const [donnees, setDonnees] = useState<DonneesDashboard | null>(null);

  useEffect(() => {
    Promise.all([
      projetsRepo.list(),
      jalonsRepo.list(),
      patchsRepo.list(),
      environnementsRepo.list(),
      cahiersDeTestRepo.list(),
      pointsRunRepo.list(),
      iterationsRepo.list(),
      personnesRepo.list(),
    ]).then(([projets, jalons, patchs, environnements, cahiers, pointsRun, iterations, personnes]) => {
      setDonnees({ projets, jalons, patchs, environnements, cahiers, pointsRun, iterations, personnes });
    });
  }, []);

  if (!donnees) {
    return <p className="text-sm text-ink-tertiary">Chargement du tableau de bord…</p>;
  }

  const nomPersonne = (id: string) => donnees.personnes.find((p) => p.id === id)?.nom ?? 'Non attribué';

  const projetsEnCours = donnees.projets.filter((p) => p.statut === 'En cours').length;
  const patchsEnAttente = donnees.patchs.filter((p) => statutsPatchEnAttente.includes(p.statut)).length;
  const environnementsDisponibles = donnees.environnements.filter((e) => e.statut === 'Disponible').length;
  const runOuverts = donnees.pointsRun.filter((r) => statutsRunOuverts.includes(r.statut)).length;
  const cahiersActifs = donnees.cahiers.filter((c) => c.statut === 'En cours').length;

  const donutSegments = [
    {
      label: 'En cours / Clôturés',
      value: donnees.projets.filter((p) => p.statut === 'En cours' || p.statut === 'Clôturé').length,
      couleur: '#008457',
    },
    {
      label: 'Cadrage / En pause',
      value: donnees.projets.filter((p) => p.statut === 'Cadrage' || p.statut === 'En pause').length,
      couleur: '#312B81',
    },
    { label: 'Annulés', value: donnees.projets.filter((p) => p.statut === 'Annulé').length, couleur: '#D0D5DD' },
  ];

  const projetParId = (id: string) => donnees.projets.find((p) => p.id === id);

  const prochainesEcheances = [
    ...donnees.jalons.map((j) => ({
      id: j.id,
      date: j.dateCible,
      libelle: `Jalon — ${j.libelle}`,
      contexte: projetParId(j.projetId)?.nom ?? '—',
    })),
    ...donnees.pointsRun
      .filter((r) => r.dateEcheance)
      .map((r) => ({ id: r.id, date: r.dateEcheance!, libelle: `Run — ${r.titre}`, contexte: 'Point de run' })),
    ...donnees.iterations
      .filter((it) => it.dateFin)
      .map((it) => ({ id: it.id, date: it.dateFin!, libelle: `Fin d'itération n°${it.numero}`, contexte: 'Cahier de test' })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const anomaliesOuvertes = donnees.pointsRun
    .filter((r) => statutsRunOuverts.includes(r.statut))
    .sort((a, b) => rangPriorite[b.priorite] - rangPriorite[a.priorite])
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-ink-secondary mb-1">Piloter et suivre les déploiements monétiques</p>
        <h1 className="text-[34px] font-extrabold text-ink-primary text-balance">Tableau de bord monétique</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        <StatCard icon={FolderKanban} label="Projets en cours" value={projetsEnCours} tone="green" />
        <StatCard icon={Package} label="Patchs en attente" value={patchsEnAttente} tone="warning" />
        <StatCard icon={Layers} label="Environnements disponibles" value={environnementsDisponibles} tone="navy" />
        <StatCard icon={Zap} label="Points de run ouverts" value={runOuverts} tone="critical" />
        <StatCard icon={ClipboardCheck} label="Cahiers de test actifs" value={cahiersActifs} tone="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <Card title="Vue d'ensemble des projets">
          <DonutChart segments={donutSegments} centre={{ valeur: donnees.projets.length, libelle: 'projets' }} />
        </Card>

        <Card title="Conformité et échéances" className="lg:col-span-2">
          {donnees.jalons.length === 0 ? (
            <EmptyState message="Aucun jalon enregistré pour le moment." />
          ) : (
            <div className="flex flex-col gap-4">
              {donnees.jalons.map((jalon) => {
                const projet = projetParId(jalon.projetId);
                return (
                  <div key={jalon.id} className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink-primary">{jalon.libelle}</p>
                      <p className="text-xs text-ink-tertiary">{projet?.nom ?? '—'}</p>
                      <div className="mt-2">
                        <ProgressBar pourcentage={projet?.avancement ?? 0} tone={toneStatutJalon[jalon.statut]} />
                      </div>
                    </div>
                    <Badge label={`${jalon.statut} · ${formatDate(jalon.dateCible)}`} tone={toneStatutJalon[jalon.statut]} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <Card title="Prochaines échéances" actions={<CalendarClock className="w-4 h-4 text-ink-tertiary" />}>
          {prochainesEcheances.length === 0 ? (
            <EmptyState message="Aucune échéance à venir." />
          ) : (
            <ul className="flex flex-col gap-3">
              {prochainesEcheances.map((echeance) => (
                <li key={echeance.id} className="flex items-center justify-between gap-3 border border-surface-border rounded-chip px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-primary truncate">{echeance.libelle}</p>
                    <p className="text-xs text-ink-tertiary">{echeance.contexte}</p>
                  </div>
                  <span className="text-xs font-semibold text-ink-secondary shrink-0 tabular-nums">{formatDate(echeance.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Anomalies ouvertes">
          {anomaliesOuvertes.length === 0 ? (
            <EmptyState message="Aucun point de run ouvert." />
          ) : (
            <ul className="flex flex-col gap-4">
              {anomaliesOuvertes.map((point) => (
                <li key={point.id} className="flex items-start gap-3">
                  <Avatar nom={nomPersonne(point.responsableId)} taille={34} couleur="#312B81" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink-primary">{point.titre}</p>
                    <p className="text-[13px] text-ink-secondary mt-0.5">{point.description}</p>
                    <div className="mt-2">
                      <Badge label={point.statut} tone={badgeToneRun[point.statut]} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
