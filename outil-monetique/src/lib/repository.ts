import type { Table } from 'dexie';
import { v4 as uuid } from './uuid';

export interface ConIdentifiant {
  id: string;
}

export interface Repository<T extends ConIdentifiant> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(entree: Omit<T, 'id'>): Promise<T>;
  update(id: string, modification: Partial<Omit<T, 'id'>>): Promise<T>;
  remove(id: string): Promise<void>;
}

/**
 * Fabrique un repository générique adossé à une table Dexie.
 * Seul point de couplage à IndexedDB pour le reste de l'application :
 * une future implémentation REST n'a qu'à respecter la même interface `Repository<T>`.
 */
export function createRepository<T extends ConIdentifiant>(table: Table<T, string>): Repository<T> {
  return {
    async list() {
      return table.toArray();
    },
    async get(id) {
      return table.get(id);
    },
    async create(entree) {
      const item = { ...entree, id: uuid() } as T;
      await table.add(item);
      return item;
    },
    async update(id, modification) {
      await table.update(id, modification as object);
      const item = await table.get(id);
      if (!item) throw new Error(`Entrée introuvable après mise à jour : ${id}`);
      return item;
    },
    async remove(id) {
      await table.delete(id);
    },
  };
}

/** Champs communs (audit) à renseigner à la création des entités majeures. */
export function champsAudit(auteurId: string) {
  const maintenant = new Date().toISOString();
  return {
    dateCreation: maintenant,
    dateModification: maintenant,
    creePar: auteurId,
    modifiePar: auteurId,
  };
}
