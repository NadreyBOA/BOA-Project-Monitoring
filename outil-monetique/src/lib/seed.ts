import { db } from './db';
import { champsAudit } from './repository';
import {
  cahiersDeTestRepo,
  casDeTestRepo,
  depensesRepo,
  editeursRepo,
  elementsATesterRepo,
  entitesRepo,
  environnementsRepo,
  executionsCasRepo,
  installationsPatchRepo,
  iterationsRepo,
  jalonsRepo,
  journalRepo,
  modulesRepo,
  parametresKPIRepo,
  patchsRepo,
  personnesRepo,
  pointsRunRepo,
  projetsRepo,
  reseauxRepo,
  restaurationsRepo,
  versionsProductionRepo,
} from './repositories';

/**
 * Jeu de données de démonstration, injecté au premier lancement (base vide).
 * Permet à l'application de fonctionner immédiatement sans backend, et sert
 * de fil rouge pour valider la couche repository de bout en bout.
 */
export async function ensureSeed(): Promise<void> {
  const dejaInitialise = (await db.entites.count()) > 0;
  if (dejaInitialise) return;

  // ── Référentiels ──────────────────────────────────────────────────────
  const entites = await Promise.all(
    [
      { code: 'BJ' as const, nom: 'Bénin', schemaConnectivite: 'A' as const },
      { code: 'BF' as const, nom: 'Burkina Faso', schemaConnectivite: 'B' as const },
      { code: 'CI' as const, nom: "Côte d'Ivoire", schemaConnectivite: 'A' as const },
      { code: 'ML' as const, nom: 'Mali', schemaConnectivite: 'B' as const },
      { code: 'NE' as const, nom: 'Niger', schemaConnectivite: 'B' as const },
      { code: 'SN' as const, nom: 'Sénégal', schemaConnectivite: 'A' as const },
      { code: 'TG' as const, nom: 'Togo', schemaConnectivite: 'A' as const },
      { code: 'BSI' as const, nom: 'BOA Services International', schemaConnectivite: 'B' as const },
    ].map((e) => entitesRepo.create({ ...e, actif: true }))
  );
  const entite = (code: string) => entites.find((e) => e.code === code)!;

  const reseaux = await Promise.all(
    (['GIM-UEMOA', 'Visa', 'Mastercard'] as const).map((nom) => reseauxRepo.create({ nom }))
  );
  const reseau = (nom: string) => reseaux.find((r) => r.nom === nom)!;

  const modules = await Promise.all(
    (['SVFE', 'SVBO', 'SVCM', 'ATM', 'TPE', 'WebGate'] as const).map((nom) => modulesRepo.create({ nom }))
  );
  const module_ = (nom: string) => modules.find((m) => m.nom === nom)!;

  const editeurs = await Promise.all(
    ['BPC', 'HPS', 'CTMI', 'EAI'].map((nom) => editeursRepo.create({ nom }))
  );
  const editeur = (nom: string) => editeurs.find((e) => e.nom === nom)!;

  const personnes = await Promise.all(
    [
      { nom: 'Aïcha Konaté', email: 'aicha.konate@boa.africa', entiteCode: 'CI', roleOutil: 'COORDINATEUR' as const, fonction: 'Responsable Cellule Déploiement' },
      { nom: 'Moussa Diarra', email: 'moussa.diarra@boa.africa', entiteCode: 'ML', roleOutil: 'TESTEUR' as const, fonction: 'Analyste monétique' },
      { nom: 'Fatou Sow', email: 'fatou.sow@boa.africa', entiteCode: 'SN', roleOutil: 'TESTEUR' as const, fonction: 'Testeuse fonctionnelle' },
      { nom: 'Kwabena Mensah', email: 'kwabena.mensah@boa.africa', entiteCode: 'TG', roleOutil: 'OBSERVATEUR' as const, fonction: 'Head SI Monétiques' },
      { nom: 'Ibrahim Traoré', email: 'ibrahim.traore@boa.africa', entiteCode: 'BF', roleOutil: 'TESTEUR' as const, fonction: 'Administrateur environnements' },
      { nom: 'Julien Kouassi', email: 'julien.kouassi@boa.africa', entiteCode: 'BJ', roleOutil: 'ADMINISTRATEUR' as const, fonction: 'Administrateur outil' },
    ].map((p) =>
      personnesRepo.create({
        nom: p.nom,
        email: p.email,
        entiteId: entite(p.entiteCode).id,
        roleOutil: p.roleOutil,
        fonction: p.fonction,
        actif: true,
      })
    )
  );
  const personne = (nom: string) => personnes.find((p) => p.nom === nom)!;
  const responsable = personne('Aïcha Konaté').id;

  await Promise.all(
    [
      { cle: 'seuil_depassement_budget', libelle: 'Seuil d\'alerte de dépassement budgétaire', valeur: 90, unite: '%' },
      { cle: 'delai_cible_patch', libelle: 'Délai cible réception → déploiement d\'un patch', valeur: 30, unite: 'jours' },
      { cle: 'taux_reussite_min', libelle: 'Taux de réussite minimal d\'une campagne de test', valeur: 85, unite: '%' },
    ].map((k) => parametresKPIRepo.create(k))
  );

  // ── Projets ───────────────────────────────────────────────────────────
  const auditAicha = champsAudit(responsable);
  const projets = await Promise.all([
    projetsRepo.create({
      ...auditAicha,
      nom: 'BrightBridge — Refonte routage GIM',
      description: 'Correctif et modernisation du routage des transactions GIM-UEMOA.',
      statut: 'En cours',
      responsableId: responsable,
      entiteIds: [entite('CI').id, entite('SN').id],
      reseauIds: [reseau('GIM-UEMOA').id],
      dateDebut: '2026-02-01',
      dateFinCible: '2026-09-30',
      priorite: 'Haute',
      avancement: 62,
      budgetAlloue: 18_000_000,
      tags: ['GIM', 'routage'],
    }),
    projetsRepo.create({
      ...auditAicha,
      nom: 'Certification Visa Enhancement',
      description: 'Mise en conformité des flux Visa (Enhancement Oct. 2026).',
      statut: 'En cours',
      responsableId: personne('Fatou Sow').id,
      entiteIds: [entite('SN').id],
      reseauIds: [reseau('Visa').id],
      dateDebut: '2026-03-15',
      dateFinCible: '2026-10-01',
      priorite: 'Critique',
      avancement: 40,
      budgetAlloue: 9_500_000,
      tags: ['Visa', 'conformité'],
    }),
    projetsRepo.create({
      ...auditAicha,
      nom: 'PCA GIM-UEMOA — 7 filiales',
      description: 'Plan de continuité d\'activité GIM-UEMOA sur l\'ensemble des filiales.',
      statut: 'Cadrage',
      responsableId: personne('Ibrahim Traoré').id,
      entiteIds: entites.filter((e) => e.code !== 'BSI').map((e) => e.id),
      reseauIds: [reseau('GIM-UEMOA').id],
      dateDebut: '2026-06-01',
      dateFinCible: '2027-01-31',
      priorite: 'Haute',
      avancement: 12,
      budgetAlloue: 25_000_000,
      tags: ['PCA'],
    }),
    projetsRepo.create({
      ...auditAicha,
      nom: 'Mobile App Prototype — 9TDesign',
      description: 'Prototype d\'application mobile pour tests utilisateurs.',
      statut: 'En pause',
      responsableId: personne('Kwabena Mensah').id,
      entiteIds: [entite('TG').id],
      reseauIds: [],
      dateDebut: '2025-11-01',
      dateFinCible: '2026-04-30',
      priorite: 'Moyenne',
      avancement: 28,
      budgetAlloue: 4_200_000,
      tags: ['mobile'],
    }),
    projetsRepo.create({
      ...auditAicha,
      nom: 'Migration Environnements de test',
      description: 'Consolidation des environnements de test Groupe.',
      statut: 'Clôturé',
      responsableId: personne('Ibrahim Traoré').id,
      entiteIds: [entite('BF').id, entite('ML').id],
      reseauIds: [],
      dateDebut: '2025-09-01',
      dateFinCible: '2026-01-15',
      dateFinReelle: '2026-01-10',
      priorite: 'Moyenne',
      avancement: 100,
      budgetAlloue: 3_000_000,
      tags: ['environnements'],
    }),
  ]);
  const projet = (nom: string) => projets.find((p) => p.nom.startsWith(nom))!;

  await Promise.all([
    jalonsRepo.create({
      ...champsAudit(responsable),
      projetId: projet('BrightBridge').id,
      libelle: 'Recette Groupe',
      dateCible: '2026-08-15',
      statut: 'À venir',
      responsableId: responsable,
    }),
    jalonsRepo.create({
      ...champsAudit(responsable),
      projetId: projet('Certification Visa').id,
      libelle: 'Dépôt dossier réseau',
      dateCible: '2026-07-01',
      statut: 'En retard',
      responsableId: personne('Fatou Sow').id,
    }),
  ]);

  await Promise.all([
    depensesRepo.create({
      ...champsAudit(responsable),
      projetId: projet('BrightBridge').id,
      date: '2026-04-10',
      libelle: 'Prestation intégrateur BPC',
      categorie: 'Prestation',
      montant: 6_500_000,
      auteurId: responsable,
    }),
    depensesRepo.create({
      ...champsAudit(personne('Fatou Sow').id),
      projetId: projet('Certification Visa').id,
      date: '2026-05-02',
      libelle: 'Frais de certification réseau',
      categorie: 'Licence',
      montant: 2_100_000,
      auteurId: personne('Fatou Sow').id,
    }),
  ]);

  // ── Environnements ────────────────────────────────────────────────────
  const versions = await Promise.all([
    versionsProductionRepo.create({
      ...champsAudit(responsable),
      reference: 'PROD-2026.06',
      dateMiseEnProd: '2026-06-15',
      moduleIds: [module_('SVFE').id, module_('SVBO').id],
      description: 'Version de production Groupe — juin 2026.',
    }),
  ]);

  const environnements = await Promise.all([
    environnementsRepo.create({
      ...champsAudit(responsable),
      nom: 'RECETTE-GROUPE-01',
      type: 'Recette',
      statut: 'Occupé',
      versionProdDeployee: { reference: 'PROD-2026.04', date: '2026-04-20' },
      description: 'Environnement de recette Groupe, campagnes GIM et Visa.',
      responsableId: personne('Ibrahim Traoré').id,
    }),
    environnementsRepo.create({
      ...champsAudit(responsable),
      nom: 'TEST-CI-02',
      type: 'Test',
      entiteId: entite('CI').id,
      statut: 'Disponible',
      versionProdDeployee: { reference: 'PROD-2026.06', date: '2026-06-15' },
      description: 'Environnement de test dédié Côte d\'Ivoire.',
      responsableId: personne('Ibrahim Traoré').id,
    }),
    environnementsRepo.create({
      ...champsAudit(responsable),
      nom: 'PREPROD-GROUPE',
      type: 'Préproduction',
      statut: 'En restauration',
      versionProdDeployee: { reference: 'PROD-2026.02', date: '2026-02-01' },
      description: 'Préproduction Groupe, restauration en cours depuis PROD-2026.06.',
      responsableId: personne('Ibrahim Traoré').id,
    }),
  ]);

  await restaurationsRepo.create({
    ...champsAudit(responsable),
    environnementId: environnements[2].id,
    dateDemande: '2026-07-20',
    versionSource: versions[0].reference,
    motif: 'Alignement avant recette PCA',
    demandeurId: personne('Ibrahim Traoré').id,
    statut: 'Planifiée',
  });

  // ── Patchs ────────────────────────────────────────────────────────────
  const patchs = await Promise.all([
    patchsRepo.create({
      ...champsAudit(responsable),
      reference: 'SVFE-2026-0142',
      editeurId: editeur('BPC').id,
      moduleIds: [module_('SVFE').id],
      dateReception: '2026-06-02',
      contenu: 'Correctif routage GIM — recette avant mise en production Groupe.',
      type: 'Correctif',
      criticite: 'Haute',
      projetId: projet('BrightBridge').id,
      reseauIds: [reseau('GIM-UEMOA').id],
      statut: 'En recette',
      responsableId: responsable,
    }),
    patchsRepo.create({
      ...champsAudit(responsable),
      reference: 'SVBO-2026-0089',
      editeurId: editeur('HPS').id,
      moduleIds: [module_('SVBO').id],
      dateReception: '2026-06-18',
      contenu: 'Mise à jour reporting filiales — Bénin, Togo.',
      type: 'Évolution',
      criticite: 'Moyenne',
      reseauIds: [],
      statut: 'Validé',
      responsableId: personne('Kwabena Mensah').id,
    }),
    patchsRepo.create({
      ...champsAudit(responsable),
      reference: 'ATM-2026-0021',
      editeurId: editeur('CTMI').id,
      moduleIds: [module_('ATM').id],
      dateReception: '2026-07-05',
      contenu: 'Patch sécurité EMV — à valider avant fin de mois.',
      type: 'Sécurité',
      criticite: 'Critique',
      reseauIds: [reseau('Mastercard').id, reseau('Visa').id],
      statut: 'En analyse',
      responsableId: personne('Ibrahim Traoré').id,
    }),
    patchsRepo.create({
      ...champsAudit(responsable),
      reference: 'TPE-2026-0055',
      editeurId: editeur('BPC').id,
      moduleIds: [module_('TPE').id],
      dateReception: '2026-05-20',
      contenu: 'Certification Mastercard — dossier prêt pour soumission réseau.',
      type: 'Réglementaire',
      criticite: 'Haute',
      reseauIds: [reseau('Mastercard').id],
      statut: 'Déployé',
      responsableId: responsable,
    }),
  ]);

  await installationsPatchRepo.create({
    ...champsAudit(responsable),
    patchId: patchs[3].id,
    environnementId: environnements[0].id,
    dateInstallation: '2026-06-01',
    installeParId: personne('Ibrahim Traoré').id,
    statut: 'Installé',
    resultat: 'Installation conforme, aucun écart constaté.',
  });

  // ── Tests (léger) ─────────────────────────────────────────────────────
  const cahier = await cahiersDeTestRepo.create({
    ...champsAudit(responsable),
    nom: 'Cahier de recette — Routage GIM',
    projetId: projet('BrightBridge').id,
    perimetre: 'Routage des transactions GIM-UEMOA, filiales pilotes CI/SN.',
    entiteIds: [entite('CI').id, entite('SN').id],
    moduleIds: [module_('SVFE').id],
    statut: 'En cours',
    responsableId: personne('Fatou Sow').id,
  });

  const element = await elementsATesterRepo.create({
    ...champsAudit(responsable),
    cahierId: cahier.id,
    libelle: 'Routage transaction retrait GAB',
    moduleId: module_('SVFE').id,
    description: 'Vérifier le routage correct des retraits GAB inter-filiales.',
    criticite: 'Haute',
  });

  const cas = await casDeTestRepo.create({
    ...champsAudit(responsable),
    elementId: element.id,
    reference: 'CT-001',
    titre: 'Retrait GAB filiale CI vers acquéreur SN',
    preconditions: 'Carte de test active, environnement TEST-CI-02 disponible.',
    etapes: ['Insérer la carte de test', 'Effectuer un retrait de 20 000 FCFA', 'Vérifier le routage GIM'],
    resultatAttendu: 'Transaction routée et acceptée sans écart de compensation.',
    donneesTest: 'Carte de test EMV n°4000-TEST-0007',
    statut: 'Réussi',
  });

  const iteration = await iterationsRepo.create({
    ...champsAudit(responsable),
    cahierId: cahier.id,
    numero: 1,
    dateDebut: '2026-07-10',
    dateFin: '2026-07-15',
    environnementId: environnements[1].id,
    statut: 'Terminée',
  });

  await executionsCasRepo.create({
    ...champsAudit(responsable),
    iterationId: iteration.id,
    casId: cas.id,
    testeurId: personne('Fatou Sow').id,
    statut: 'Réussi',
    duree: 25,
    dateExecution: '2026-07-12',
    commentaire: 'Aucun écart constaté.',
  });

  // ── Run ───────────────────────────────────────────────────────────────
  await Promise.all([
    pointsRunRepo.create({
      ...champsAudit(responsable),
      titre: 'Écart de routage détecté en recette TPE',
      description: 'Écart de routage constaté sur les transactions TPE en environnement de recette.',
      type: 'Incident',
      priorite: 'Haute',
      statut: 'Ouvert',
      responsableId: personne('Ibrahim Traoré').id,
      entiteIds: [entite('CI').id],
      reseauIds: [reseau('GIM-UEMOA').id],
      dateOuverture: '2026-07-22',
      dateEcheance: '2026-08-05',
      objetLie: patchs[0].id,
    }),
    pointsRunRepo.create({
      ...champsAudit(responsable),
      titre: 'Rejets de transactions GIM en environnement de recette',
      description: 'Taux de rejet anormal observé sur les transactions GIM-UEMOA en recette Mali.',
      type: 'Incident',
      priorite: 'Critique',
      statut: 'En cours',
      responsableId: personne('Moussa Diarra').id,
      entiteIds: [entite('ML').id],
      reseauIds: [reseau('GIM-UEMOA').id],
      dateOuverture: '2026-07-18',
      dateEcheance: '2026-07-31',
    }),
    pointsRunRepo.create({
      ...champsAudit(responsable),
      titre: 'Point hebdomadaire coordination filiales',
      description: 'Coordination récurrente avec les correspondants filiales.',
      type: 'Coordination',
      priorite: 'Basse',
      statut: 'Résolu',
      responsableId: responsable,
      entiteIds: entites.map((e) => e.id),
      reseauIds: [],
      dateOuverture: '2026-07-01',
      dateCloture: '2026-07-01',
    }),
  ]);

  // ── Journal ───────────────────────────────────────────────────────────
  await journalRepo.create({
    typeObjet: 'projet',
    objetId: projet('BrightBridge').id,
    type: 'création',
    auteurId: responsable,
    date: '2026-02-01T09:00:00.000Z',
    resume: 'Création du projet BrightBridge — Refonte routage GIM.',
  });
}
