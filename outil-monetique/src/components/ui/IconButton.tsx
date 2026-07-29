import type { ComponentType } from 'react';

interface IconButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  variant?: 'outline' | 'solid' | 'ghost';
  hasNotification?: boolean;
}

const variantStyles: Record<NonNullable<IconButtonProps['variant']>, string> = {
  outline: 'border border-surface-border bg-surface-card text-ink-secondary hover:bg-boa-navy-50 hover:text-boa-navy',
  solid: 'bg-boa-navy text-white border border-boa-navy hover:bg-boa-green-700',
  ghost: 'text-ink-secondary hover:bg-boa-green-50 hover:text-boa-green',
};

/** Bouton rond icône seule, avec infobulle native (title) et pastille de notification optionnelle. */
export function IconButton({ icon: Icon, label, onClick, variant = 'outline', hasNotification }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-boa-navy ${variantStyles[variant]}`}
    >
      <Icon className="w-4 h-4" />
      {hasNotification && (
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-status-critical border-2 border-surface-card" />
      )}
    </button>
  );
}
