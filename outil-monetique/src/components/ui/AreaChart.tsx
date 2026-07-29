import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

export interface SerieAire {
  cle: string;
  libelle: string;
  couleur: string;
  valeurs: number[];
}

interface AreaChartProps {
  categories: string[];
  series: SerieAire[];
  formatValeur?: (valeur: number) => string;
}

export function AreaChart({ categories, series, formatValeur = (v) => String(v) }: AreaChartProps) {
  const donnees = categories.map((categorie, index) => {
    const point: Record<string, string | number> = { categorie };
    for (const serie of series) point[serie.cle] = serie.valeurs[index] ?? 0;
    return point;
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={donnees} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              {series.map((serie) => (
                <linearGradient key={serie.cle} id={`degrade-${serie.cle}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={serie.couleur} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={serie.couleur} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="#EEF0F3" />
            <XAxis
              dataKey="categorie"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#98A2B3', fontSize: 11.5 }}
            />
            <Tooltip
              formatter={(valeur: number, cle: string) => {
                const serie = series.find((s) => s.cle === cle);
                return [formatValeur(valeur), serie?.libelle ?? cle];
              }}
              contentStyle={{ borderRadius: 12, border: '1px solid #EEF0F3', boxShadow: '0 4px 24px rgba(16,23,38,0.06)' }}
            />
            {series.map((serie) => (
              <Area
                key={serie.cle}
                type="monotone"
                dataKey={serie.cle}
                stroke={serie.couleur}
                strokeWidth={2.5}
                fill={`url(#degrade-${serie.cle})`}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 px-1">
        {series.map((serie) => (
          <div key={serie.cle} className="flex items-center gap-1.5 text-xs text-ink-secondary">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: serie.couleur }} />
            {serie.libelle}
          </div>
        ))}
      </div>
    </div>
  );
}
