import { db } from './db';
import { createRepository } from './repository';
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

export const entitesRepo = createRepository<Entite>(db.entites);
export const personnesRepo = createRepository<Personne>(db.personnes);
export const reseauxRepo = createRepository<Reseau>(db.reseaux);
export const modulesRepo = createRepository<Module>(db.modules);
export const editeursRepo = createRepository<Editeur>(db.editeurs);
export const journalRepo = createRepository<ActionJournal>(db.actionsJournal);

export const projetsRepo = createRepository<Projet>(db.projets);
export const jalonsRepo = createRepository<Jalon>(db.jalons);
export const depensesRepo = createRepository<Depense>(db.depenses);

export const cahiersDeTestRepo = createRepository<CahierDeTest>(db.cahiersDeTest);
export const elementsATesterRepo = createRepository<ElementATester>(db.elementsATester);
export const casDeTestRepo = createRepository<CasDeTest>(db.casDeTest);
export const iterationsRepo = createRepository<Iteration>(db.iterations);
export const executionsCasRepo = createRepository<ExecutionCas>(db.executionsCas);

export const environnementsRepo = createRepository<Environnement>(db.environnements);
export const droitsEnvironnementRepo = createRepository<DroitEnvironnement>(db.droitsEnvironnement);
export const restaurationsRepo = createRepository<Restauration>(db.restaurations);
export const versionsProductionRepo = createRepository<VersionProduction>(db.versionsProduction);

export const patchsRepo = createRepository<Patch>(db.patchs);
export const installationsPatchRepo = createRepository<InstallationPatch>(db.installationsPatch);

export const pointsRunRepo = createRepository<PointRun>(db.pointsRun);

export const parametresKPIRepo = createRepository<ParametreKPI>(db.parametresKPI);
