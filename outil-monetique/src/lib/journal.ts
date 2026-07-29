import { journalRepo } from './repositories';
import type { TypeActionJournal, TypeObjetJournal } from './types';

/** Enregistre une entrée dans le journal d'audit (historique horodaté d'un objet). */
export function tracer(
  typeObjet: TypeObjetJournal,
  objetId: string,
  type: TypeActionJournal,
  auteurId: string,
  resume: string,
  detail?: string
) {
  return journalRepo.create({
    typeObjet,
    objetId,
    type,
    auteurId,
    date: new Date().toISOString(),
    resume,
    detail,
  });
}
