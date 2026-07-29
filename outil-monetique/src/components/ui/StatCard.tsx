import type { ComponentType } from 'react';

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: 'green' | 'navy' | 'violet' | 'critical' | 'warning';
}

const toneStyles: Record<NonNullable<StatCardProps['tone']>, string> = {
  green: 'bg-boa-green-50 text-boa-green-700',
  navy: 'bg-boa-navy-50 text-boa-navy',
  violet: 'bg-boa-violet-50 text-boa-violet',
  critical: 'bg-red-50 text-status-critical',
  warning: 'bg-amber-50 text-status-warning',
};

export function StatCard({ icon: Icon, label, value, tone = 'green' }: StatCardProps) {
  return (
    <div className="bg-surface-card rounded-card shadow-card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${toneStyles[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold text-ink-primary leading-tight tabular-nums">{value}</div>
        <div className="text-[13px] text-ink-secondary leading-snug">{label}</div>
      </div>
    </div>
  );
}
