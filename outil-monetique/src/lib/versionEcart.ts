import type { Environnement, VersionProduction } from './types';

export function derniereVersionProduction(versions: VersionProduction[]): VersionProduction | undefined {
  if (versions.length === 0) return undefined;
  const triees = [...versions].sort((a, b) => a.dateMiseEnProd.localeCompare(b.dateMiseEnProd));
  return triees[triees.length - 1];
}

/** Un environnement est à jour si sa version reflétée correspond à la dernière version de production connue. */
export function estAJour(environnement: Environnement, versions: VersionProduction[]): boolean {
  const derniere = derniereVersionProduction(versions);
  if (!derniere) return true;
  return environnement.versionProdDeployee.reference === derniere.reference;
}
