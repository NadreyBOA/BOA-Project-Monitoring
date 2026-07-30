import { useState } from 'react';
import { Play } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/format';
import { champsAudit } from '../../lib/repository';
import { tracer } from '../../lib/journal';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { casDuCahier, iterationsDuCahier } from '../../lib/testsStats';
import { environnementsRepo, executionsCasRepo, iterationsRepo, personnesRepo, pointsRunRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type {
  CahierDeTest,
  CasDeTest,
  ElementATester,
  ExecutionCas,
  Iteration,
  StatutCasDeTest,
  StatutIteration,
} from '../../lib/types';

const toneStatutIteration: Record<StatutIteration, BadgeTone> = {
  Planifiée: 'neutral',
  'En cours': 'info',
  Terminée: 'success',
};

interface CahierIterationsProps {
  cahier: CahierDeTest;
  elements: ElementATester[];
  cas: CasDeTest[];
  iterations: Iteration[];
  executions: ExecutionCas[];
  recharger: () => void;
}

export function CahierIterations({ cahier, elements, cas, iterations, executions, recharger }: CahierIterationsProps) {
  const { items: environnements } = useRepositoryList(environnementsRepo);
  const { items: personnes } = useRepositoryList(personnesRepo);
  const { items: pointsRun } = useRepositoryList(pointsRunRepo);
  const utilisateurCourant = useUtilisateurCourant();

  const iterationsCahier = iterationsDuCahier(cahier.id, iterations);
  const casCahier = casDuCahier(cahier.id, elements, cas);

  const [drawerOuvert, setDrawerOuvert] = useState(false);
  const [environnementChoisi, setEnvironnementChoisi] = useState('');

  const nomEnvironnement = (id: string) => environnements.find((e) => e.id === id)?.nom ?? '—';

  async function lancerIteration() {
    if (!environnementChoisi || !utilisateurCourant || casCahier.length === 0) return;
    const numero = iterationsCahier.length > 0 ? Math.max(...iterationsCahier.map((it) => it.numero)) + 1 : 1;
    const iteration = await iterationsRepo.create({
      ...champsAudit(utilisateurCourant.id),
      cahierId: cahier.id,
      numero,
      dateDebut: new Date().toISOString().slice(0, 10),
      environnementId: environnementChoisi,
      statut: 'En cours',
    });
    await Promise.all(
      casCahier.map((casItem) =>
        executionsCasRepo.create({
          ...champsAudit(utilisateurCourant.id),
          iterationId: iteration.id,
          casId: casItem.id,
          testeurId: cahier.responsableId,
          statut: 'Non exécuté',
          duree: 0,
          dateExecution: new Date().toISOString().slice(0, 10),
        })
      )
    );
    await tracer('cahierTest', cahier.id, 'modification', utilisateurCourant.id, `Itération n°${numero} lancée sur ${nomEnvironnement(environnementChoisi)} (${casCahier.length} cas).`);
    setDrawerOuvert(false);
    setEnvironnementChoisi('');
    recharger();
  }

  async function terminerIteration(iteration: Iteration) {
    if (!utilisateurCourant) return;
    await iterationsRepo.update(iteration.id, { statut: 'Terminée', dateFin: new Date().toISOString().slice(0, 10), dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
    await tracer('cahierTest', cahier.id, 'changement de statut', utilisateurCourant.id, `Itération n°${iteration.numero} marquée Terminée.`);
    recharger();
  }

  async function modifierExecution(execution: ExecutionCas, patch: Partial<ExecutionCas>) {
    if (!utilisateurCourant) return;
    await executionsCasRepo.update(execution.id, { ...patch, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
    if (patch.statut) {
      await tracer('cahierTest', cahier.id, 'modification', utilisateurCourant.id, `Résultat saisi pour un cas de test : ${patch.statut}.`);
    }
    recharger();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setDrawerOuvert(true)}
          disabled={casCahier.length === 0}
          className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700 disabled:opacity-40"
        >
          <Play className="w-4 h-4" /> Lancer une itération
        </button>
      </div>

      {iterationsCahier.length === 0 ? (
        <Card>
          <EmptyState message="Aucune itération pour ce cahier. Lancez-en une pour commencer à saisir des résultats." />
        </Card>
      ) : (
        [...iterationsCahier].reverse().map((iteration) => {
          const executionsIteration = executions.filter((e) => e.iterationId === iteration.id);
          return (
            <Card
              key={iteration.id}
              title={`Itération n°${iteration.numero}`}
              actions={
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-tertiary">
                    {formatDate(iteration.dateDebut)} {iteration.dateFin && `→ ${formatDate(iteration.dateFin)}`} · {nomEnvironnement(iteration.environnementId)}
                  </span>
                  <Badge label={iteration.statut} tone={toneStatutIteration[iteration.statut]} />
                  {iteration.statut !== 'Terminée' && (
                    <button type="button" onClick={() => terminerIteration(iteration)} className="text-xs font-semibold text-boa-navy hover:underline">
                      Marquer terminée
                    </button>
                  )}
                </div>
              }
            >
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-surface-border text-xs font-semibold text-ink-tertiary uppercase tracking-wide">
                      <th className="text-left px-3 py-2">Cas</th>
                      <th className="text-left px-3 py-2">Testeur</th>
                      <th className="text-left px-3 py-2">Statut</th>
                      <th className="text-left px-3 py-2">Durée (min)</th>
                      <th className="text-left px-3 py-2">Commentaire</th>
                      <th className="text-left px-3 py-2">Anomalie liée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionsIteration.map((execution) => {
                      const casItem = cas.find((c) => c.id === execution.casId);
                      return (
                        <tr key={execution.id} className="border-b border-surface-border last:border-0">
                          <td className="px-3 py-2.5 align-top">
                            <span className="font-mono text-xs text-ink-tertiary mr-1.5">{casItem?.reference}</span>
                            <span className="font-medium text-ink-primary">{casItem?.titre}</span>
                          </td>
                          <td className="px-3 py-2.5 align-top">
                            <select
                              value={execution.testeurId}
                              onChange={(e) => modifierExecution(execution, { testeurId: e.target.value })}
                              className={`${champClasses} py-1.5 text-xs`}
                            >
                              {personnes.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.nom}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2.5 align-top">
                            <select
                              value={execution.statut}
                              onChange={(e) => modifierExecution(execution, { statut: e.target.value as StatutCasDeTest })}
                              className={`${champClasses} py-1.5 text-xs`}
                            >
                              {(['Non exécuté', 'Réussi', 'Échoué', 'Bloqué', 'Non applicable'] as StatutCasDeTest[]).map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2.5 align-top">
                            <input
                              type="number"
                              defaultValue={execution.duree}
                              onBlur={(e) => modifierExecution(execution, { duree: Number(e.target.value) || 0 })}
                              className={`${champClasses} py-1.5 text-xs w-20`}
                            />
                          </td>
                          <td className="px-3 py-2.5 align-top">
                            <input
                              type="text"
                              defaultValue={execution.commentaire ?? ''}
                              onBlur={(e) => modifierExecution(execution, { commentaire: e.target.value || undefined })}
                              className={`${champClasses} py-1.5 text-xs`}
                            />
                          </td>
                          <td className="px-3 py-2.5 align-top">
                            <select
                              value={execution.anomalieLiee ?? ''}
                              onChange={(e) => modifierExecution(execution, { anomalieLiee: e.target.value || undefined })}
                              className={`${champClasses} py-1.5 text-xs`}
                            >
                              <option value="">Aucune</option>
                              {pointsRun.map((point) => (
                                <option key={point.id} value={point.id}>
                                  {point.titre}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })
      )}

      <Drawer
        open={drawerOuvert}
        onClose={() => setDrawerOuvert(false)}
        title="Lancer une itération"
        footer={
          <button type="button" onClick={lancerIteration} className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700">
            Lancer
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-secondary">
            Crée une nouvelle campagne d'exécution pour les {casCahier.length} cas de test de ce cahier, avec un statut « Non exécuté » à saisir.
          </p>
          <Field label="Environnement d'exécution">
            <select value={environnementChoisi} onChange={(e) => setEnvironnementChoisi(e.target.value)} className={champClasses}>
              <option value="" disabled>
                Choisir…
              </option>
              {environnements.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.nom} ({env.type})
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Drawer>
    </div>
  );
}
