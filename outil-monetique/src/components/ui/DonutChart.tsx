import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

export interface SegmentDonut {
  label: string;
  value: number;
  couleur: string;
}

interface DonutChartProps {
  segments: SegmentDonut[];
  centre?: { valeur: string | number; libelle: string };
}

export function DonutChart({ segments, centre }: DonutChartProps) {
  const total = segments.reduce((somme, s) => somme + s.value, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[180px] h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={segments.length > 1 ? 2 : 0}
              stroke="none"
            >
              {segments.map((segment) => (
                <Cell key={segment.label} fill={segment.couleur} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centre && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-ink-primary tabular-nums">{centre.valeur}</span>
            <span className="text-xs text-ink-secondary">{centre.libelle}</span>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2 text-[13px]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: segment.couleur }} />
            <span className="text-ink-secondary">{segment.label} :</span>
            <span className="font-bold text-ink-primary tabular-nums">
              {segment.value}
              {total > 0 && <span className="font-normal text-ink-tertiary"> ({Math.round((segment.value / total) * 100)}%)</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
