interface PillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

/** Bouton pilule utilisé pour les filtres de période et les onglets. */
export function Pill({ label, active = false, onClick }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full px-4 py-2 text-[13px] font-semibold bg-boa-navy text-white border border-boa-navy transition-colors'
          : 'rounded-full px-4 py-2 text-[13px] font-semibold bg-surface-card text-ink-secondary border border-surface-border hover:bg-boa-navy-50 hover:border-boa-navy-50 transition-colors'
      }
    >
      {label}
    </button>
  );
}
