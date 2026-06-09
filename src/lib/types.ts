// ─── Enums & Unions ────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'BROUILLON'
  | 'PLANIFIE'
  | 'EN_COURS'
  | 'EN_PAUSE'
  | 'TERMINE'
  | 'ANNULE';

export type ProjectPriority = 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'BASSE';

export type ProjectCategory =
  | 'TPE'
  | 'DAB_GAB'
  | 'CARTE'
  | 'VIREMENT'
  | 'MONÉTIQUE'
  | 'INFRASTRUCTURE'
  | 'RÉGLEMENTAIRE'
  | 'AUTRE';

export type HealthStatus = 'VERT' | 'ORANGE' | 'ROUGE';

export type MilestoneStatus =
  | 'NON_COMMENCE'
  | 'EN_COURS'
  | 'TERMINE'
  | 'EN_RETARD'
  | 'ANNULE';

export type TaskStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINE' | 'BLOQUE' | 'ANNULE';

export type RiskProbability = 'FAIBLE' | 'MOYEN' | 'ELEVE';
export type RiskImpact = 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
export type RiskStatus = 'IDENTIFIE' | 'EN_COURS' | 'MITIGE' | 'REALISE' | 'CLOS';
export type RiskCategory =
  | 'TECHNIQUE'
  | 'ORGANISATIONNEL'
  | 'FINANCIER'
  | 'REGLEMENTAIRE'
  | 'CALENDAIRE'
  | 'SECURITE'
  | 'AUTRE';

export type JournalEntryType =
  | 'REUNION'
  | 'RELANCE'
  | 'DECISION'
  | 'INCIDENT'
  | 'LIVRAISON'
  | 'VALIDATION'
  | 'ESCALADE'
  | 'COMITE'
  | 'AUTRE';

export type CommentType = 'GENERAL' | 'IMPORTANT' | 'QUESTION' | 'DECISION';

export type ActionItemStatus = 'OUVERT' | 'EN_COURS' | 'FERME';

// ─── Base Entities ──────────────────────────────────────────────────────────

export interface Person {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  organization?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  organization: string;
  email?: string;
  phone?: string;
  influence: 'FAIBLE' | 'MOYEN' | 'FORT';
  interest: 'FAIBLE' | 'MOYEN' | 'FORT';
  notes?: string;
}

// ─── Action Items ───────────────────────────────────────────────────────────

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: ActionItemStatus;
  closedDate?: string;
}

// ─── Journal ────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  date: string;
  type: JournalEntryType;
  title: string;
  description: string;
  participants: string[];
  actionItems: ActionItem[];
  author: string;
  location?: string;
  nextMeetingDate?: string;
}

// ─── Tasks & Milestones ─────────────────────────────────────────────────────

export interface Task {
  id: string;
  milestoneId: string;
  name: string;
  description?: string;
  plannedDate: string;
  actualDate?: string;
  status: TaskStatus;
  assignedTo: string[];
  priority: 'HAUTE' | 'MOYENNE' | 'BASSE';
  estimatedDays: number;
  actualDays?: number;
  dependencies: string[];
  progress: number; // 0–100
  comments?: string;
}

export interface Milestone {
  id: string;
  order: number;
  name: string;
  description?: string;
  plannedDate: string;
  actualDate?: string;
  status: MilestoneStatus;
  tasks: Task[];
  responsible: string;
  deliverables: string[];
  weight: number; // 1–10, used to compute overall progress
}

// ─── Risks ──────────────────────────────────────────────────────────────────

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  probability: RiskProbability;
  impact: RiskImpact;
  score: number; // computed: probability × impact (1–9 scale)
  status: RiskStatus;
  mitigation: string;
  contingency: string;
  owner: string;
  identifiedDate: string;
  reviewDate?: string;
  notes?: string;
}

// ─── Budget ─────────────────────────────────────────────────────────────────

export interface BudgetLine {
  id: string;
  category: string;
  description: string;
  estimated: number;
  actual?: number;
}

export interface Budget {
  currency: string;
  totalEstimated: number;
  totalActual: number;
  lines: BudgetLine[];
}

// ─── Comments ───────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  date: string;
  author: string;
  content: string;
  type: CommentType;
}

// ─── Project (root entity) ──────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  code: string; // ex: PRJ-2024-001
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  healthStatus: HealthStatus;
  progress: number; // 0–100, auto-computed

  // Cadrage
  objectives: string;
  scope: string;
  outOfScope: string;
  successCriteria: string;
  assumptions: string;
  constraints: string;
  interProjectDependencies: string;

  // Dates
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  plannedDurationDays: number;

  // Équipe
  projectManager: string;
  sponsor: string;
  team: Person[];
  stakeholders: Stakeholder[];

  // Contenu
  milestones: Milestone[];
  risks: Risk[];
  journal: JournalEntry[];
  comments: Comment[];
  budget: Budget;

  // Meta
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
