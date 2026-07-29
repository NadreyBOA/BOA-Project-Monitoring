import Dexie, { type Table } from 'dexie';
import type {
  ActionJournal,
  CahierDeTest,
  CasDeTest,
  Depense,
  DroitEnvironnement,
  Editeur,
  ElementATester,
  Entite,
  Environnement,
  ExecutionCas,
  InstallationPatch,
  Iteration,
  Jalon,
  Module,
  ParametreKPI,
  Patch,
  Personne,
  PointRun,
  Projet,
  Reseau,
  Restauration,
  VersionProduction,
} from './types';

// Couche de persistance par défaut : IndexedDB via Dexie.
// Objectif : permettre à l'application de fonctionner immédiatement sans
// serveur. Cette classe est le seul point de couplage à IndexedDB — le reste
// de l'application passe exclusivement par la couche repository (repository.ts),
// pour permettre une bascule ultérieure vers un backend REST sans toucher aux écrans.
export class OutilMonetiqueDB extends Dexie {
  entites!: Table<Entite, string>;
  personnes!: Table<Personne, string>;
  reseaux!: Table<Reseau, string>;
  modules!: Table<Module, string>;
  editeurs!: Table<Editeur, string>;
  actionsJournal!: Table<ActionJournal, string>;

  projets!: Table<Projet, string>;
  jalons!: Table<Jalon, string>;
  depenses!: Table<Depense, string>;

  cahiersDeTest!: Table<CahierDeTest, string>;
  elementsATester!: Table<ElementATester, string>;
  casDeTest!: Table<CasDeTest, string>;
  iterations!: Table<Iteration, string>;
  executionsCas!: Table<ExecutionCas, string>;

  environnements!: Table<Environnement, string>;
  droitsEnvironnement!: Table<DroitEnvironnement, string>;
  restaurations!: Table<Restauration, string>;
  versionsProduction!: Table<VersionProduction, string>;

  patchs!: Table<Patch, string>;
  installationsPatch!: Table<InstallationPatch, string>;

  pointsRun!: Table<PointRun, string>;

  parametresKPI!: Table<ParametreKPI, string>;

  constructor() {
    super('outil-monetique-boa');

    this.version(1).stores({
      entites: 'id, code, actif',
      personnes: 'id, entiteId, roleOutil, actif',
      reseaux: 'id, nom',
      modules: 'id, nom',
      editeurs: 'id, nom',
      actionsJournal: 'id, typeObjet, objetId, date',

      projets: 'id, statut, responsableId, priorite, dateFinCible',
      jalons: 'id, projetId, statut, dateCible',
      depenses: 'id, projetId, date, categorie',

      cahiersDeTest: 'id, projetId, statut, responsableId',
      elementsATester: 'id, cahierId, moduleId',
      casDeTest: 'id, elementId, statut',
      iterations: 'id, cahierId, environnementId, statut',
      executionsCas: 'id, iterationId, casId, testeurId, statut',

      environnements: 'id, type, statut, entiteId',
      droitsEnvironnement: 'id, environnementId, personneId',
      restaurations: 'id, environnementId, statut',
      versionsProduction: 'id, dateMiseEnProd',

      patchs: 'id, statut, editeurId, projetId, dateReception',
      installationsPatch: 'id, patchId, environnementId, statut',

      pointsRun: 'id, statut, type, priorite, responsableId, dateEcheance',

      parametresKPI: 'id, cle',
    });
  }
}

export const db = new OutilMonetiqueDB();
