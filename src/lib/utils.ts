import { format, differenceInDays, isPast, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Project, Milestone, Task, Risk,
  RiskProbability, RiskImpact,
  ProjectStatus, ProjectPriority, HealthStatus, MilestoneStatus, TaskStatus
} from './types';

// ─── Date helpers ────────────────────────────────────────────────────────────

export function fmt(dateStr: string | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!dateStr) return '—';
  try { return format(parseISO(dateStr), pattern, { locale: fr }); }
  catch { return dateStr; }
}

export function daysLeft(endDate: string): number {
  return differenceInDays(parseISO(endDate), new Date());
}

export function isOverdue(dateStr: string): boolean {
  try { return isPast(parseISO(dateStr)); }
  catch { return false; }
}

// ─── Progress ────────────────────────────────────────────────────────────────

export function computeMilestoneProgress(milestone: Milestone): number {
  if (!milestone.tasks.length) {
    return milestone.status === 'TERMINE' ? 100 : 0;
  }
  const done = milestone.tasks.filter(t => t.status === 'TERMINE').length;
  return Math.round((done / milestone.tasks.length) * 100);
}

export function computeProjectProgress(milestones: Milestone[]): number {
  if (!milestones.length) return 0;
  const totalWeight = milestones.reduce((s, m) => s + m.weight, 0);
  if (!totalWeight) return 0;
  const weighted = milestones.reduce((s, m) => {
    const p = computeMilestoneProgress(m);
    return s + p * m.weight;
  }, 0);
  return Math.round(weighted / totalWeight);
}

// ─── Risk score ──────────────────────────────────────────────────────────────

const probScore: Record<RiskProbability, number> = { FAIBLE: 1, MOYEN: 2, ELEVE: 3 };
const impactScore: Record<RiskImpact, number> = { FAIBLE: 1, MOYEN: 2, ELEVE: 3, CRITIQUE: 4 };

export function computeRiskScore(probability: RiskProbability, impact: RiskImpact): number {
  return probScore[probability] * impactScore[impact];
}

export function riskLevel(score: number): 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE' {
  if (score <= 2) return 'FAIBLE';
  if (score <= 4) return 'MOYEN';
  if (score <= 6) return 'ELEVE';
  return 'CRITIQUE';
}

// ─── Label maps ──────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  BROUILLON: 'Brouillon',
  PLANIFIE: 'Planifié',
  EN_COURS: 'En cours',
  EN_PAUSE: 'En pause',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  BROUILLON: 'bg-gray-100 text-gray-700',
  PLANIFIE: 'bg-blue-100 text-blue-700',
  EN_COURS: 'bg-green-100 text-green-700',
  EN_PAUSE: 'bg-yellow-100 text-yellow-700',
  TERMINE: 'bg-emerald-100 text-emerald-700',
  ANNULE: 'bg-red-100 text-red-700',
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  CRITIQUE: 'Critique',
  HAUTE: 'Haute',
  MOYENNE: 'Moyenne',
  BASSE: 'Basse',
};

export const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  CRITIQUE: 'bg-red-100 text-red-700 border border-red-200',
  HAUTE: 'bg-orange-100 text-orange-700 border border-orange-200',
  MOYENNE: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  BASSE: 'bg-gray-100 text-gray-600 border border-gray-200',
};

export const HEALTH_COLORS: Record<HealthStatus, string> = {
  VERT: 'bg-green-500',
  ORANGE: 'bg-orange-500',
  ROUGE: 'bg-red-500',
};

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  VERT: 'Sain',
  ORANGE: 'À surveiller',
  ROUGE: 'En danger',
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  NON_COMMENCE: 'Non commencé',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  EN_RETARD: 'En retard',
  ANNULE: 'Annulé',
};

export const MILESTONE_STATUS_COLORS: Record<MilestoneStatus, string> = {
  NON_COMMENCE: 'bg-gray-100 text-gray-600',
  EN_COURS: 'bg-blue-100 text-blue-700',
  TERMINE: 'bg-green-100 text-green-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  ANNULE: 'bg-gray-100 text-gray-400',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  BLOQUE: 'Bloqué',
  ANNULE: 'Annulé',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  A_FAIRE: 'bg-gray-100 text-gray-600',
  EN_COURS: 'bg-blue-100 text-blue-700',
  TERMINE: 'bg-green-100 text-green-700',
  BLOQUE: 'bg-red-100 text-red-700',
  ANNULE: 'bg-gray-100 text-gray-400',
};

export const JOURNAL_TYPE_LABELS: Record<string, string> = {
  REUNION: 'Réunion',
  RELANCE: 'Relance',
  DECISION: 'Décision',
  INCIDENT: 'Incident',
  LIVRAISON: 'Livraison',
  VALIDATION: 'Validation',
  ESCALADE: 'Escalade',
  COMITE: 'Comité',
  AUTRE: 'Autre',
};

export const JOURNAL_TYPE_COLORS: Record<string, string> = {
  REUNION: 'bg-blue-100 text-blue-700',
  RELANCE: 'bg-yellow-100 text-yellow-700',
  DECISION: 'bg-purple-100 text-purple-700',
  INCIDENT: 'bg-red-100 text-red-700',
  LIVRAISON: 'bg-green-100 text-green-700',
  VALIDATION: 'bg-emerald-100 text-emerald-700',
  ESCALADE: 'bg-orange-100 text-orange-700',
  COMITE: 'bg-indigo-100 text-indigo-700',
  AUTRE: 'bg-gray-100 text-gray-600',
};

export const CATEGORY_LABELS: Record<string, string> = {
  TPE: 'TPE',
  DAB_GAB: 'DAB/GAB',
  CARTE: 'Carte',
  VIREMENT: 'Virement',
  'MONÉTIQUE': 'Monétique',
  INFRASTRUCTURE: 'Infrastructure',
  'RÉGLEMENTAIRE': 'Réglementaire',
  AUTRE: 'Autre',
};

// ─── ID generators ───────────────────────────────────────────────────────────

export function generateProjectCode(existing: Project[]): string {
  const year = new Date().getFullYear();
  const nums = existing
    .map(p => {
      const m = p.code.match(/PRJ-\d{4}-(\d{3})/);
      return m ? parseInt(m[1]) : 0;
    })
    .filter(Boolean);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `PRJ-${year}-${String(next).padStart(3, '0')}`;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── Stats for dashboard ─────────────────────────────────────────────────────

export function getProjectStats(projects: Project[]) {
  return {
    total: projects.length,
    enCours: projects.filter(p => p.status === 'EN_COURS').length,
    termine: projects.filter(p => p.status === 'TERMINE').length,
    enRetard: projects.filter(p =>
      p.status === 'EN_COURS' && isOverdue(p.plannedEndDate)
    ).length,
    rouge: projects.filter(p => p.healthStatus === 'ROUGE').length,
    orange: projects.filter(p => p.healthStatus === 'ORANGE').length,
    vert: projects.filter(p => p.healthStatus === 'VERT').length,
    critique: projects.filter(p => p.priority === 'CRITIQUE').length,
  };
}

// ─── Open action items across all projects ───────────────────────────────────

export function getAllOpenActions(projects: Project[]) {
  return projects.flatMap(p =>
    p.journal.flatMap(j =>
      j.actionItems
        .filter(a => a.status !== 'FERME')
        .map(a => ({ ...a, projectId: p.id, projectName: p.name, projectCode: p.code }))
    )
  );
}
