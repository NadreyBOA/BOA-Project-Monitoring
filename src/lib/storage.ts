'use client';
import { Project } from './types';
import { computeProjectProgress } from './utils';

const KEY = 'boa_projects_v1';

export function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return getSampleData();
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function getProject(id: string): Project | undefined {
  return loadProjects().find(p => p.id === id);
}

export function upsertProject(project: Project): void {
  const projects = loadProjects();
  project.progress = computeProjectProgress(project.milestones);
  project.updatedAt = new Date().toISOString();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  saveProjects(projects);
}

export function deleteProject(id: string): void {
  saveProjects(loadProjects().filter(p => p.id !== id));
}

// ─── Sample data (loaded on first visit) ─────────────────────────────────────

function getSampleData(): Project[] {
  const now = new Date().toISOString();
  const sample: Project[] = [
    {
      id: 'prj-demo-001',
      name: 'Déploiement TPE Nouvelle Génération',
      code: 'PRJ-2024-001',
      description: 'Remplacement du parc TPE existant par des terminaux nouvelle génération compatibles NFC et sans contact.',
      category: 'TPE',
      status: 'EN_COURS',
      priority: 'HAUTE',
      healthStatus: 'ORANGE',
      progress: 45,
      objectives: 'Moderniser 500 TPE dans les agences et chez les commerçants partenaires d\'ici fin 2024.',
      scope: 'Agences BOA Maroc + 50 commerçants partenaires',
      outOfScope: 'TPE des filiales étrangères',
      successCriteria: '95% des TPE déployés, taux de disponibilité > 99%, formation 100% du personnel',
      assumptions: 'Budget validé, fournisseur retenu, homologation Bank Al-Maghrib en cours',
      constraints: 'Délais réglementaires, disponibilité des équipes terrain',
      interProjectDependencies: 'PRJ-2024-003 (Infrastructure réseau)',
      startDate: '2024-01-15',
      plannedEndDate: '2024-12-31',
      plannedDurationDays: 351,
      projectManager: 'Nadrey BOA',
      sponsor: 'Direction Monétique',
      team: [
        { id: 't1', name: 'Karim Alaoui', role: 'Chef de projet technique', email: 'k.alaoui@boa.ma', organization: 'BOA Maroc' },
        { id: 't2', name: 'Fatima Zahra', role: 'Responsable déploiement', email: 'f.zahra@boa.ma', organization: 'BOA Maroc' },
        { id: 't3', name: 'Mohamed Idrissi', role: 'Technicien terrain', organization: 'BOA Maroc' },
      ],
      stakeholders: [
        { id: 's1', name: 'Direction Générale', role: 'Commanditaire', organization: 'BOA Maroc', influence: 'FORT', interest: 'MOYEN' },
        { id: 's2', name: 'Bank Al-Maghrib', role: 'Régulateur', organization: 'BAM', influence: 'FORT', interest: 'FORT' },
      ],
      milestones: [
        {
          id: 'm1', order: 1, name: 'Phase 1 – Cadrage & Homologation', description: 'Finalisation du cahier des charges et obtention des homologations réglementaires',
          plannedDate: '2024-03-31', actualDate: '2024-04-10', status: 'TERMINE',
          responsible: 'Nadrey BOA', deliverables: ['CDC validé', 'Homologation BAM', 'Contrat fournisseur'], weight: 8,
          tasks: [
            { id: 'tk1', milestoneId: 'm1', name: 'Rédaction CDC', plannedDate: '2024-02-15', actualDate: '2024-02-18', status: 'TERMINE', assignedTo: ['Karim Alaoui'], priority: 'HAUTE', estimatedDays: 20, actualDays: 22, dependencies: [], progress: 100 },
            { id: 'tk2', milestoneId: 'm1', name: 'Dossier homologation BAM', plannedDate: '2024-03-15', actualDate: '2024-03-28', status: 'TERMINE', assignedTo: ['Nadrey BOA'], priority: 'HAUTE', estimatedDays: 30, actualDays: 35, dependencies: ['tk1'], progress: 100 },
          ]
        },
        {
          id: 'm2', order: 2, name: 'Phase 2 – Pilote (50 TPE)', description: 'Déploiement pilote sur 3 agences test',
          plannedDate: '2024-06-30', status: 'EN_COURS',
          responsible: 'Fatima Zahra', deliverables: ['50 TPE installés', 'Rapport pilote', 'Formation personnel'], weight: 7,
          tasks: [
            { id: 'tk3', milestoneId: 'm2', name: 'Installation pilote agence Casablanca', plannedDate: '2024-05-31', actualDate: '2024-05-29', status: 'TERMINE', assignedTo: ['Mohamed Idrissi'], priority: 'HAUTE', estimatedDays: 10, actualDays: 9, dependencies: ['tk2'], progress: 100 },
            { id: 'tk4', milestoneId: 'm2', name: 'Installation pilote agence Rabat', plannedDate: '2024-06-15', status: 'EN_COURS', assignedTo: ['Mohamed Idrissi'], priority: 'HAUTE', estimatedDays: 10, dependencies: [], progress: 60 },
            { id: 'tk5', milestoneId: 'm2', name: 'Formation personnel pilote', plannedDate: '2024-06-30', status: 'A_FAIRE', assignedTo: ['Fatima Zahra'], priority: 'MOYENNE', estimatedDays: 5, dependencies: ['tk4'], progress: 0 },
          ]
        },
        {
          id: 'm3', order: 3, name: 'Phase 3 – Déploiement massif (450 TPE)', description: 'Déploiement sur l\'ensemble du réseau',
          plannedDate: '2024-11-30', status: 'NON_COMMENCE',
          responsible: 'Fatima Zahra', deliverables: ['450 TPE déployés', 'Formation complète'], weight: 10,
          tasks: []
        },
        {
          id: 'm4', order: 4, name: 'Phase 4 – Clôture & Bilan', description: 'Recette finale, documentation et clôture projet',
          plannedDate: '2024-12-31', status: 'NON_COMMENCE',
          responsible: 'Nadrey BOA', deliverables: ['PV recette', 'Bilan projet', 'Retour d\'expérience'], weight: 5,
          tasks: []
        },
      ],
      risks: [
        { id: 'r1', title: 'Retard homologation BAM', description: 'La BAM pourrait prendre plus de temps que prévu pour valider les nouveaux terminaux.', category: 'REGLEMENTAIRE', probability: 'MOYEN', impact: 'ELEVE', score: 6, status: 'MITIGE', mitigation: 'Dossier soumis avec 2 mois d\'avance, suivi hebdomadaire', contingency: 'Plan de déploiement des anciens TPE en attendant', owner: 'Nadrey BOA', identifiedDate: '2024-01-20' },
        { id: 'r2', title: 'Disponibilité équipes terrain', description: 'Ressources terrain partagées avec d\'autres projets.', category: 'ORGANISATIONNEL', probability: 'ELEVE', impact: 'MOYEN', score: 6, status: 'EN_COURS', mitigation: 'Arbitrage ressources validé par la Direction', contingency: 'Recours à prestataires externes', owner: 'Fatima Zahra', identifiedDate: '2024-02-01' },
        { id: 'r3', title: 'Rupture de stock fournisseur', description: 'Le fournisseur TPE pourrait ne pas livrer dans les délais.', category: 'TECHNIQUE', probability: 'FAIBLE', impact: 'CRITIQUE', score: 4, status: 'IDENTIFIE', mitigation: 'Clause de pénalité dans le contrat, stock tampon de 50 unités', contingency: 'Fournisseur alternatif identifié', owner: 'Karim Alaoui', identifiedDate: '2024-01-25' },
      ],
      journal: [
        {
          id: 'j1', date: '2024-05-15', type: 'COMITE',
          title: 'Comité de pilotage Q1 2024',
          description: 'Présentation de l\'avancement de la phase pilote. Retard constaté sur l\'agence Rabat dû à des travaux de rénovation.',
          participants: ['Nadrey BOA', 'Karim Alaoui', 'Direction Monétique', 'Fatima Zahra'],
          author: 'Nadrey BOA',
          location: 'Siège BOA, Salle Marrakech',
          actionItems: [
            { id: 'ai1', description: 'Replanifier l\'installation Rabat au 10 juin', assignedTo: 'Fatima Zahra', dueDate: '2024-06-10', status: 'EN_COURS' },
            { id: 'ai2', description: 'Valider le planning déploiement massif avec les régions', assignedTo: 'Nadrey BOA', dueDate: '2024-05-30', status: 'FERME' },
          ]
        },
        {
          id: 'j2', date: '2024-04-22', type: 'RELANCE',
          title: 'Relance BAM sur homologation',
          description: 'Relance téléphonique auprès de la BAM pour accélérer le traitement du dossier d\'homologation. Confirmation de réception du dossier complet.',
          participants: ['Nadrey BOA'],
          author: 'Nadrey BOA',
          actionItems: [
            { id: 'ai3', description: 'Envoyer les documents complémentaires demandés par BAM', assignedTo: 'Nadrey BOA', dueDate: '2024-04-25', status: 'FERME' },
          ]
        },
        {
          id: 'j3', date: '2024-03-10', type: 'DECISION',
          title: 'Choix du fournisseur TPE',
          description: 'Suite à l\'appel d\'offres, la Direction a retenu Ingenico Group pour la fourniture des 500 terminaux.',
          participants: ['Direction Générale', 'Direction Achats', 'Nadrey BOA'],
          author: 'Nadrey BOA',
          actionItems: []
        },
      ],
      comments: [
        { id: 'c1', date: '2024-05-20', author: 'Nadrey BOA', content: 'Le pilote Casablanca est un succès. Les commerçants sont très satisfaits de la rapidité des transactions NFC.', type: 'IMPORTANT' },
        { id: 'c2', date: '2024-04-15', author: 'Karim Alaoui', content: 'Attention : la version firmware 3.2.1 présente un bug sur les transactions > 5000 DH. En attente du patch fournisseur.', type: 'IMPORTANT' },
      ],
      budget: {
        currency: 'MAD',
        totalEstimated: 2500000,
        totalActual: 890000,
        lines: [
          { id: 'b1', category: 'Matériel', description: '500 terminaux TPE Ingenico', estimated: 1800000, actual: 0 },
          { id: 'b2', category: 'Logiciel', description: 'Licences & mises à jour', estimated: 200000, actual: 185000 },
          { id: 'b3', category: 'Déploiement', description: 'Installation & câblage', estimated: 300000, actual: 520000 },
          { id: 'b4', category: 'Formation', description: 'Formation personnel', estimated: 100000, actual: 85000 },
          { id: 'b5', category: 'Gestion projet', description: 'Ressources internes', estimated: 100000, actual: 100000 },
        ]
      },
      tags: ['TPE', 'NFC', 'Déploiement', '2024'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prj-demo-002',
      name: 'Migration Cartes VISA vers EMV 3DS 2.0',
      code: 'PRJ-2024-002',
      description: 'Migration du protocole d\'authentification des cartes VISA vers EMV 3D Secure 2.0 pour conformité avec les exigences VISA.',
      category: 'CARTE',
      status: 'PLANIFIE',
      priority: 'CRITIQUE',
      healthStatus: 'VERT',
      progress: 10,
      objectives: 'Assurer la conformité totale avec le protocole 3DS 2.0 d\'ici Q3 2024.',
      scope: 'Toutes les cartes VISA émises par BOA Maroc',
      outOfScope: 'Cartes Mastercard (projet séparé)',
      successCriteria: '100% des cartes migrées, zéro incident en production',
      assumptions: 'Support technique VISA disponible',
      constraints: 'Deadline VISA : 15 octobre 2024',
      interProjectDependencies: 'Aucune',
      startDate: '2024-06-01',
      plannedEndDate: '2024-10-15',
      plannedDurationDays: 136,
      projectManager: 'Nadrey BOA',
      sponsor: 'Direction Informatique',
      team: [
        { id: 't4', name: 'Ahmed Benali', role: 'Architecte SI', organization: 'BOA Maroc' },
        { id: 't5', name: 'Sara Mansouri', role: 'Développeuse Backend', organization: 'BOA Maroc' },
      ],
      stakeholders: [
        { id: 's3', name: 'VISA International', role: 'Partenaire réseau', organization: 'VISA', influence: 'FORT', interest: 'FORT' },
      ],
      milestones: [
        { id: 'm5', order: 1, name: 'Analyse & Architecture', plannedDate: '2024-07-15', status: 'EN_COURS', responsible: 'Ahmed Benali', deliverables: ['Document architecture', 'Plan de migration'], weight: 6, tasks: [], description: '' },
        { id: 'm6', order: 2, name: 'Développement & Tests', plannedDate: '2024-09-15', status: 'NON_COMMENCE', responsible: 'Sara Mansouri', deliverables: ['Code migré', 'Tests unitaires', 'Recette'], weight: 10, tasks: [], description: '' },
        { id: 'm7', order: 3, name: 'Mise en production', plannedDate: '2024-10-15', status: 'NON_COMMENCE', responsible: 'Nadrey BOA', deliverables: ['MEP validée', 'Go-live'], weight: 8, tasks: [], description: '' },
      ],
      risks: [
        { id: 'r4', title: 'Dépassement deadline VISA', description: 'Risque de sanctions financières en cas de non-conformité au 15/10.', category: 'REGLEMENTAIRE', probability: 'FAIBLE', impact: 'CRITIQUE', score: 4, status: 'IDENTIFIE', mitigation: 'Planning serré respecté, points hebdomadaires', contingency: 'Demande d\'extension auprès de VISA', owner: 'Nadrey BOA', identifiedDate: '2024-06-01' },
      ],
      journal: [],
      comments: [],
      budget: {
        currency: 'MAD',
        totalEstimated: 500000,
        totalActual: 50000,
        lines: [
          { id: 'b6', category: 'Développement', description: 'Ressources internes', estimated: 300000, actual: 50000 },
          { id: 'b7', category: 'Tests', description: 'Environnement de test VISA', estimated: 100000 },
          { id: 'b8', category: 'Infrastructure', description: 'Serveurs HSM', estimated: 100000 },
        ]
      },
      tags: ['VISA', '3DS', 'Conformité', 'Sécurité'],
      createdAt: now,
      updatedAt: now,
    }
  ];
  saveProjects(sample);
  return sample;
}
