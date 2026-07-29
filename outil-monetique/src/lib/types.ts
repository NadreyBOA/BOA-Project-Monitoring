// ─── Modèle de données — cahier de développement, section 5 ────────────────
// Dates stockées en ISO (YYYY-MM-DD), affichées en JJ/MM/AAAA.
// Montants en FCFA (XOF), entiers.

export type CodeEntite = 'BJ' | 'BF' | 'CI' | 'ML' | 'NE' | 'SN' | 'TG' | 'BSI';
export type SchemaConnectivite = 'A' | 'B';

export type RoleOutil = 'ADMINISTRATEUR' | 'COORDINATEUR' | 'TESTEUR' | 'OBSERVATEUR';

export type NomModule = 'SVFE' | 'SVBO' | 'SVCM' | 'ATM' | 'TPE' | 'WebGate';
export type NomReseau = 'GIM-UEMOA' | 'Visa' | 'Mastercard';

export type TypeObjetJournal =
  | 'projet'
  | 'patch'
  | 'environnement'
  | 'cahierTest'
  | 'casTest'
  | 'pointRun';

export type TypeActionJournal =
  | 'création'
  | 'modification'
  | 'changement de statut'
  | 'commentaire'
  | 'pièce jointe';

// ─── Entités transverses ────────────────────────────────────────────────────

export interface Entite {
  id: string;
  code: CodeEntite;
  nom: string;
  schemaConnectivite: SchemaConnectivite;
  actif: boolean;
}

export interface Personne {
  id: string;
  nom: string;
  email: string;
  entiteId: string;
  roleOutil: RoleOutil;
  fonction: string;
  actif: boolean;
}

export interface Reseau {
  id: string;
  nom: string;
}

export interface Module {
  id: string;
  nom: string;
}

export interface Editeur {
  id: string;
  nom: string;
}

export interface ActionJournal {
  id: string;
  typeObjet: TypeObjetJournal;
  objetId: string;
  type: TypeActionJournal;
  auteurId: string;
  date: string;
  resume: string;
  detail?: string;
}

// ─── Champs communs à toutes les entités majeures ───────────────────────────

export interface EntiteBase {
  id: string;
  dateCreation: string;
  dateModification: string;
  creePar: string;
  modifiePar: string;
}

// ─── Projets ─────────────────────────────────────────────────────────────

export type StatutProjet = 'Cadrage' | 'En cours' | 'En pause' | 'Clôturé' | 'Annulé';
export type PrioriteProjet = 'Basse' | 'Moyenne' | 'Haute' | 'Critique';

export interface Projet extends EntiteBase {
  nom: string;
  description: string;
  statut: StatutProjet;
  responsableId: string;
  entiteIds: string[];
  reseauIds: string[];
  dateDebut: string;
  dateFinCible: string;
  dateFinReelle?: string;
  priorite: PrioriteProjet;
  avancement: number; // 0-100
  budgetAlloue: number; // FCFA
  tags: string[];
}

export type StatutJalon = 'À venir' | 'Atteint' | 'En retard';

export interface Jalon extends EntiteBase {
  projetId: string;
  libelle: string;
  dateCible: string;
  dateReelle?: string;
  statut: StatutJalon;
  responsableId: string;
}

export type CategorieDepense = 'Prestation' | 'Licence' | 'Matériel' | 'Déplacement' | 'Autre';

export interface Depense extends EntiteBase {
  projetId: string;
  date: string;
  libelle: string;
  categorie: CategorieDepense;
  montant: number; // FCFA
  auteurId: string;
  justificatif?: string;
}

// ─── Tests ───────────────────────────────────────────────────────────────

export type StatutCahierTest = 'Brouillon' | 'En cours' | 'Clôturé';

export interface CahierDeTest extends EntiteBase {
  nom: string;
  projetId?: string;
  perimetre: string;
  entiteIds: string[];
  moduleIds: string[];
  statut: StatutCahierTest;
  responsableId: string;
}

export type Criticite = 'Basse' | 'Moyenne' | 'Haute' | 'Critique';

export interface ElementATester extends EntiteBase {
  cahierId: string;
  libelle: string;
  moduleId: string;
  description: string;
  criticite: Criticite;
}

export type StatutCasDeTest = 'Non exécuté' | 'Réussi' | 'Échoué' | 'Bloqué' | 'Non applicable';

export interface CasDeTest extends EntiteBase {
  elementId: string;
  reference: string;
  titre: string;
  preconditions: string;
  etapes: string[];
  resultatAttendu: string;
  donneesTest?: string;
  statut: StatutCasDeTest;
}

export type StatutIteration = 'Planifiée' | 'En cours' | 'Terminée';

export interface Iteration extends EntiteBase {
  cahierId: string;
  numero: number;
  dateDebut: string;
  dateFin?: string;
  environnementId: string;
  statut: StatutIteration;
}

export interface ExecutionCas extends EntiteBase {
  iterationId: string;
  casId: string;
  testeurId: string;
  statut: StatutCasDeTest;
  duree: number; // minutes
  dateExecution: string;
  commentaire?: string;
  anomalieLiee?: string; // id d'un PointRun
}

// ─── Environnements ──────────────────────────────────────────────────────

export type TypeEnvironnement = 'Test' | 'Recette' | 'Préproduction' | 'Formation' | 'Iso-production';
export type StatutEnvironnement = 'Disponible' | 'Occupé' | 'Indisponible' | 'En restauration';

export interface Environnement extends EntiteBase {
  nom: string;
  type: TypeEnvironnement;
  entiteId?: string; // absent = périmètre Groupe
  statut: StatutEnvironnement;
  versionProdDeployee: { reference: string; date: string };
  description: string;
  responsableId: string;
}

export type NiveauDroit = 'Lecture' | 'Exécution' | 'Administration';

export interface DroitEnvironnement extends EntiteBase {
  environnementId: string;
  personneId: string;
  niveau: NiveauDroit;
  dateAttribution: string;
  attribueParId: string;
}

export type StatutRestauration = 'Demandée' | 'Planifiée' | 'Réalisée' | 'Échouée';

export interface Restauration extends EntiteBase {
  environnementId: string;
  dateDemande: string;
  dateRealisation?: string;
  versionSource: string;
  motif: string;
  demandeurId: string;
  statut: StatutRestauration;
}

export interface VersionProduction extends EntiteBase {
  reference: string;
  dateMiseEnProd: string;
  moduleIds: string[];
  description: string;
}

// ─── Patchs ──────────────────────────────────────────────────────────────

export type TypePatch = 'Correctif' | 'Évolution' | 'Réglementaire' | 'Sécurité';
export type StatutPatch = 'Reçu' | 'En analyse' | 'En recette' | 'Validé' | 'Déployé' | 'Rejeté' | 'En attente';

export interface Patch extends EntiteBase {
  reference: string;
  editeurId: string;
  moduleIds: string[];
  dateReception: string;
  contenu: string;
  type: TypePatch;
  criticite: Criticite;
  projetId?: string;
  reseauIds: string[];
  statut: StatutPatch;
  responsableId: string;
  pieceJointe?: string;
}

export type StatutInstallation = 'Installé' | 'Échec' | 'Annulé';

export interface InstallationPatch extends EntiteBase {
  patchId: string;
  environnementId: string;
  dateInstallation: string;
  installeParId: string;
  statut: StatutInstallation;
  resultat?: string;
  iterationTestLiee?: string;
}

// ─── Run ─────────────────────────────────────────────────────────────────

export type TypePointRun = 'Incident' | 'Demande' | 'Tâche récurrente' | 'Coordination' | 'Analyse';
export type StatutPointRun = 'Ouvert' | 'En cours' | 'En attente' | 'Résolu' | 'Clôturé';

export interface PointRun extends EntiteBase {
  titre: string;
  description: string;
  type: TypePointRun;
  priorite: PrioriteProjet;
  statut: StatutPointRun;
  responsableId: string;
  entiteIds: string[];
  reseauIds: string[];
  dateOuverture: string;
  dateEcheance?: string;
  dateCloture?: string;
  objetLie?: string; // id d'un patch, environnement ou cahier de test
}

// ─── Paramètres ──────────────────────────────────────────────────────────

export interface ParametreKPI {
  id: string;
  cle: string;
  libelle: string;
  valeur: number;
  unite?: string;
  description?: string;
}
