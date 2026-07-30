import type { CasDeTest, ElementATester, ExecutionCas, Iteration } from './types';

export function casDuCahier(cahierId: string, elements: ElementATester[], cas: CasDeTest[]): CasDeTest[] {
  const elementIds = new Set(elements.filter((e) => e.cahierId === cahierId).map((e) => e.id));
  return cas.filter((c) => elementIds.has(c.elementId));
}

export function iterationsDuCahier(cahierId: string, iterations: Iteration[]): Iteration[] {
  return iterations.filter((it) => it.cahierId === cahierId).sort((a, b) => a.numero - b.numero);
}

export function derniereIteration(cahierId: string, iterations: Iteration[]): Iteration | undefined {
  const iters = iterationsDuCahier(cahierId, iterations);
  return iters.length > 0 ? iters[iters.length - 1] : undefined;
}

/** Taux de réussite (0-100) des cas déjà exécutés dans une itération, ou null si rien n'a encore été exécuté. */
export function tauxReussite(iterationId: string, executions: ExecutionCas[]): number | null {
  const execs = executions.filter((e) => e.iterationId === iterationId);
  const executees = execs.filter((e) => e.statut !== 'Non exécuté');
  if (executees.length === 0) return null;
  const reussies = executees.filter((e) => e.statut === 'Réussi').length;
  return Math.round((reussies / executees.length) * 100);
}
