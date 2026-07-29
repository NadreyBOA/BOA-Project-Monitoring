import { personnesRepo } from './repositories';
import { useRepositoryList } from './useRepositoryList';
import type { Personne } from './types';

/**
 * Utilisateur courant, faute d'authentification dans l'outil pour l'instant :
 * on retient la première personne au profil Coordinateur (Cellule Déploiement),
 * à défaut la première personne active. Toutes les actions tracées (création,
 * auteur des dépenses, etc.) s'appuient sur ce choix en attendant une vraie
 * gestion de session.
 */
export function useUtilisateurCourant(): Personne | undefined {
  const { items: personnes } = useRepositoryList(personnesRepo);
  return personnes.find((p) => p.roleOutil === 'COORDINATEUR' && p.actif) ?? personnes.find((p) => p.actif);
}
