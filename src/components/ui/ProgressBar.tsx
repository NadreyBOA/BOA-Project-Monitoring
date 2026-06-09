interface ProgressBarProps {
  value: number; // 0–100
  size?: 'sm' | 'md';
  color?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ value, size = 'md', color, showLabel = false }: ProgressBarProps) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const bg = color ?? (value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-blue-500' : value >= 25 ? 'bg-yellow-500' : 'bg-red-500');
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-200 rounded-full ${h} overflow-hidden`}>
        <div className={`${bg} ${h} rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      {showLabel && <span className="text-xs text-gray-600 w-9 text-right">{value}%</span>}
    </div>
  );
}
