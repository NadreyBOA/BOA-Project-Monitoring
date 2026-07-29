export type BadgeTone = 'success' | 'warning' | 'critical' | 'neutral' | 'info';

interface BadgeProps {
  label: string;
  tone: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  success: 'bg-boa-green-50 text-boa-green-700',
  warning: 'bg-amber-50 text-status-warning',
  critical: 'bg-red-50 text-status-critical',
  neutral: 'bg-surface-tint text-ink-secondary',
  info: 'bg-boa-navy-50 text-boa-navy',
};

/** Badge de statut coloré selon la palette sémantique du brief (section 2.2). */
export function Badge({ label, tone }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneStyles[tone]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
