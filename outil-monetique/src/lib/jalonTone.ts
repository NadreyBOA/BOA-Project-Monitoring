import type { Jalon } from './types';

export const toneStatutJalon: Record<Jalon['statut'], 'success' | 'warning' | 'critical' | 'info'> = {
  Atteint: 'success',
  'À venir': 'info',
  'En retard': 'critical',
};
