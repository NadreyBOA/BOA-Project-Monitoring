import type { ComponentType } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  action?: { label: string; onClick: () => void };
  icon?: ComponentType<{ className?: string }>;
}

export function EmptyState({ message, action, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-tint flex items-center justify-center text-ink-tertiary">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-ink-secondary max-w-xs">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-full px-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
