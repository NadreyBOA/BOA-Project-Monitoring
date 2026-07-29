export type ToneBarre = 'success' | 'warning' | 'critical' | 'info' | 'neutral';

const toneColors: Record<ToneBarre, string> = {
  success: '#008457',
  warning: '#F79009',
  critical: '#E5484D',
  info: '#044C7E',
  neutral: '#98A2B3',
};

interface ProgressBarProps {
  pourcentage: number; // 0-100
  tone?: ToneBarre;
}

export function ProgressBar({ pourcentage, tone = 'success' }: ProgressBarProps) {
  const valeur = Math.max(0, Math.min(100, pourcentage));
  return (
    <div
      className="h-[9px] rounded-full bg-surface-border overflow-hidden"
      role="progressbar"
      aria-valuenow={valeur}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${valeur}%`, backgroundColor: toneColors[tone] }}
      />
    </div>
  );
}
