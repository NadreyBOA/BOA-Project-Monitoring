import type { ReactNode } from 'react';

/** Classes partagées pour les champs de saisie (input/select/textarea) des formulaires. */
export const champClasses =
  'w-full rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink-primary outline-none focus:border-boa-navy focus:ring-2 focus:ring-boa-navy-50';

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}
