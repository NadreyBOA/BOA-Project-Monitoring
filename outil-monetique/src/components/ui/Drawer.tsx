import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Panneau latéral coulissant pour les formulaires (création/édition d'un objet). */
export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fermer le panneau"
        onClick={onClose}
        className="absolute inset-0 bg-ink-primary/30"
      />
      <div className="relative w-full max-w-md h-full bg-surface-card shadow-card flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border">
          <h2 className="text-lg font-bold text-ink-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-secondary hover:bg-surface-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-boa-navy"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-surface-border">{footer}</div>}
      </div>
    </div>
  );
}
