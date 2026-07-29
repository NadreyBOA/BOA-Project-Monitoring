import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, actions, children, className = '' }: CardProps) {
  return (
    <section className={`bg-surface-card rounded-card shadow-card p-5 flex flex-col gap-4 ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-2.5">
          {title && <h2 className="text-[17px] font-bold text-ink-primary">{title}</h2>}
          {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
