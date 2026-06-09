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
  BROUILLON: 'bg-[#efefec] text-[#6b6b65]',
  PLANIFIE:  'bg-[#e8ecf5] text-[#1B2E5E]',
  EN_COURS:  'bg-[#e8f5ee] text-[#1B7A4B]',
  EN_PAUSE:  'bg-[#fdf6e8] text-[#d4830a]',
  TERMINE:   'bg-[#e8f5ee] text-[#145c38] font-semibold',
  ANNULE:    'bg-[#fdf0ef] text-[#c0392b]',
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  CRITIQUE: 'Critique',
  HAUTE: 'Haute',
  MOYENNE: 'Moyenne',
  BASSE: 'Basse',
};

export const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  CRITIQUE: 'bg-[#fdf0ef] text-[#c0392b] border border-[#f5c4bf]',
  HAUTE:    'bg-[#fdf6e8] text-[#d4830a] border border-[#f5dfa8]',
  MOYENNE:  'bg-[#e8ecf5] text-[#1B2E5E] border border-[#c5cde8]',
  BASSE:    'bg-[#efefec] text-[#6b6b65] border border-[#dcdcd8]',
};

export const HEALTH_COLORS: Record<HealthStatus, string> = {
  VERT:   'bg-[#1B7A4B]',
  ORANGE: 'bg-[#d4830a]',
  ROUGE:  'bg-[#c0392b]',
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
  NON_COMMENCE: 'bg-[#efefec] text-[#6b6b65]',
  EN_COURS:     'bg-[#e8ecf5] text-[#1B2E5E]',
  TERMINE:      'bg-[#e8f5ee] text-[#1B7A4B]',
  EN_RETARD:    'bg-[#fdf0ef] text-[#c0392b]',
  ANNULE:       'bg-[#efefec] text-[#6b6b65] opacity-60',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  BLOQUE: 'Bloqué',
  ANNULE: 'Annulé',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  A_FAIRE:  'bg-[#efefec] text-[#6b6b65]',
  EN_COURS: 'bg-[#e8ecf5] text-[#1B2E5E]',
  TERMINE:  'bg-[#e8f5ee] text-[#1B7A4B]',
  BLOQUE:   'bg-[#fdf0ef] text-[#c0392b]',
  ANNULE:   'bg-[#efefec] text-[#6b6b65] opacity-60',
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
  REUNION:    'bg-[#e8ecf5] text-[#1B2E5E]',
  RELANCE:    'bg-[#fdf6e8] text-[#d4830a]',
  DECISION:   'bg-[#f0ecf7] text-[#5b3d8a]',
  INCIDENT:   'bg-[#fdf0ef] text-[#c0392b]',
  LIVRAISON:  'bg-[#e8f5ee] text-[#1B7A4B]',
  VALIDATION: 'bg-[#e8f5ee] text-[#145c38]',
  ESCALADE:   'bg-[#fdf6e8] text-[#d4830a]',
  COMITE:     'bg-[#e8ecf5] text-[#1B2E5E]',
  AUTRE:      'bg-[#efefec] text-[#6b6b65]',
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
